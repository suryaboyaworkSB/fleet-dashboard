"""
auth_service.py
───────────────
Handles Verizon Fleet API authentication.

How Verizon auth works:
  - GET https://fim.api.us.fleetmatics.com/token
  - Authorization: Basic <base64(username:password)>
  - Response: plain text token string (not JSON)
  - Token expires every few minutes → we cache it in Redis
    with TTL slightly under its real expiry so we always stay ahead

Call get_token() before every API request — it handles everything.
"""

import base64
import logging
import threading

import requests

from core.config import settings
from services.redis_client import redis_client, REDIS_AVAILABLE

logger = logging.getLogger(__name__)

TOKEN_CACHE_KEY = "fleet:auth_token"
TOKEN_TTL_SECONDS = 240  # Cache for 4 minutes; Verizon tokens last ~5 min

# Lock so concurrent requests don't all hit the auth endpoint simultaneously
_refresh_lock = threading.Lock()


def _basic_auth_header() -> str:
    """Return a Basic Authorization header value for username:password."""
    raw = f"{settings.VERIZON_USERNAME}:{settings.VERIZON_PASSWORD}"
    encoded = base64.b64encode(raw.encode("utf-8")).decode("utf-8")
    return f"Basic {encoded}"


def _fetch_fresh_token() -> str:
    """
    GET the Verizon token endpoint with Basic auth.
    Returns the token as a plain string.
    Raises on any failure.
    """
    try:
        response = requests.get(
            settings.VERIZON_AUTH_URL,
            headers={
                "Authorization": _basic_auth_header(),
                "Accept": "text/plain",
            },
            timeout=10,
        )
        response.raise_for_status()

        token = response.text.strip()
        if not token:
            raise ValueError("Empty token received from Verizon auth endpoint")

        logger.info(f"✅ New Verizon token obtained (cached for {TOKEN_TTL_SECONDS}s)")
        return token

    except requests.exceptions.HTTPError as e:
        logger.error(f"Auth HTTP {e.response.status_code}: {e.response.text}")
        raise
    except requests.exceptions.Timeout:
        logger.error("Auth request timed out")
        raise
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise


def _cache_token(token: str) -> None:
    if not REDIS_AVAILABLE or not redis_client:
        return
    try:
        redis_client.setex(TOKEN_CACHE_KEY, TOKEN_TTL_SECONDS, token)
        logger.debug(f"Token cached in Redis (TTL={TOKEN_TTL_SECONDS}s)")
    except Exception as e:
        logger.warning(f"Redis token write failed: {e}")


def _get_cached_token() -> str | None:
    if not REDIS_AVAILABLE or not redis_client:
        return None
    try:
        return redis_client.get(TOKEN_CACHE_KEY)
    except Exception as e:
        logger.warning(f"Redis token read failed: {e}")
        return None


def invalidate_token() -> None:
    """Force-clear the cached token (called on 401 from Verizon API)."""
    if REDIS_AVAILABLE and redis_client:
        try:
            redis_client.delete(TOKEN_CACHE_KEY)
            logger.info("Cached token invalidated")
        except Exception:
            pass


def get_token() -> str:
    """
    Public API — returns a valid Verizon bearer token.
    Serves from Redis cache when available; fetches fresh token when expired.
    Thread-safe: only one refresh runs at a time even under concurrent load.
    """
    cached = _get_cached_token()
    if cached:
        logger.debug("Using cached Verizon token")
        return cached

    with _refresh_lock:
        # Re-check after acquiring lock (another thread may have refreshed)
        cached = _get_cached_token()
        if cached:
            return cached

        token = _fetch_fresh_token()
        _cache_token(token)
        return token
