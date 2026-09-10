"""
verizon_service.py
──────────────────
Fetches live vehicle data from the Verizon Fleet API.

Flow:
  1. get_live_vehicles() checks Redis for cached vehicle list
  2. On cache miss → calls Verizon API with a fresh token from auth_service
  3. Normalizes raw API response → list[Vehicle]
  4. Stores result back in Redis (TTL = REDIS_TTL seconds)

Token management is fully delegated to auth_service — this module
never stores or checks tokens directly.
"""

import json
import logging
from datetime import datetime, timezone
from typing import List, Optional

import requests

from core.config import settings
from models.vehicle import Vehicle, VehicleStatus
from services.auth_service import get_token
from services.redis_client import redis_client, REDIS_AVAILABLE

logger = logging.getLogger(__name__)

CACHE_KEY = "fleet:live_vehicles"


# ── Helpers ────────────────────────────────────────────────────────────────

def _build_headers() -> dict:
    """Build request headers with a fresh (or cached) bearer token."""
    token = get_token()
    return {
        "Authorization": (
            f"Atmosphere atmosphere_app_id={settings.VERIZON_APP_ID},"
            f" Bearer {token}"
        ),
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def _determine_status(speed: float, last_update: str) -> VehicleStatus:
    """Classify vehicle as moving / idle / offline based on speed + recency."""
    try:
        last_dt = datetime.fromisoformat(last_update.replace("Z", "+00:00"))
        age_minutes = (datetime.now(timezone.utc) - last_dt).total_seconds() / 60
        if age_minutes > 15:
            return VehicleStatus.OFFLINE
    except Exception:
        pass

    return VehicleStatus.MOVING if speed > 2 else VehicleStatus.IDLE


def _normalize_vehicle(raw: dict) -> Optional[Vehicle]:
    """Map raw Verizon JSON → our Vehicle model."""
    try:
        lat = float(raw.get("Latitude", raw.get("lat", 0)))
        lng = float(raw.get("Longitude", raw.get("lng", 0)))
        speed = float(raw.get("Speed", raw.get("speed", 0)))
        last_update = str(
            raw.get("LastUpdated", raw.get("last_update", datetime.utcnow().isoformat()))
        )
        return Vehicle(
            id=str(raw.get("VehicleId", raw.get("id", "unknown"))),
            name=str(raw.get("VehicleLabel", raw.get("name", "Unknown Vehicle"))),
            lat=lat,
            lng=lng,
            speed=speed,
            status=_determine_status(speed, last_update),
            last_update=last_update,
            heading=raw.get("Heading"),
            driver=raw.get("DriverName"),
            address=raw.get("Address"),
        )
    except Exception as e:
        logger.error(f"Failed to normalize vehicle: {e} | raw={raw}")
        return None


# ── Redis helpers ──────────────────────────────────────────────────────────

def _cache_vehicles(vehicles: List[Vehicle]) -> None:
    if not REDIS_AVAILABLE or not redis_client:
        return
    try:
        redis_client.setex(
            CACHE_KEY,
            settings.REDIS_TTL,
            json.dumps([v.model_dump() for v in vehicles]),
        )
    except Exception as e:
        logger.warning(f"Redis vehicle write failed: {e}")


def _get_cached_vehicles() -> Optional[List[Vehicle]]:
    if not REDIS_AVAILABLE or not redis_client:
        return None
    try:
        cached = redis_client.get(CACHE_KEY)
        if cached:
            return [Vehicle(**item) for item in json.loads(cached)]
    except Exception as e:
        logger.warning(f"Redis vehicle read failed: {e}")
    return None


# ── Core API call ──────────────────────────────────────────────────────────

def _fetch_from_api() -> List[Vehicle]:
    """
    Call Verizon API.  If we get a 401 the token just expired mid-TTL
    (Verizon can issue short-lived tokens) — we force a token refresh
    and retry once.
    """
    for attempt in range(2):
        try:
            response = requests.get(
                settings.VERIZON_API_URL,
                headers=_build_headers(),
                timeout=10,
            )

            if response.status_code == 401 and attempt == 0:
                # Token expired before Redis TTL — clear cached token and retry
                logger.warning("401 from Verizon API — forcing token refresh")
                if REDIS_AVAILABLE and redis_client:
                    redis_client.delete("fleet:auth_token")
                continue  # retry with fresh token

            response.raise_for_status()
            data = response.json()
            raw_list = (
                data if isinstance(data, list)
                else data.get("Vehicles", data.get("vehicles", []))
            )
            vehicles = [_normalize_vehicle(v) for v in raw_list]
            result = [v for v in vehicles if v is not None]
            logger.info(f"Fetched {len(result)} vehicles from Verizon API")
            return result

        except requests.exceptions.HTTPError as e:
            logger.error(f"Verizon API error {e.response.status_code}: {e.response.text}")
            raise
        except requests.exceptions.Timeout:
            logger.error("Verizon API timed out")
            raise
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            raise

    raise RuntimeError("Verizon API failed after token refresh retry")


# ── Public API ─────────────────────────────────────────────────────────────

def get_live_vehicles() -> List[Vehicle]:
    """
    Returns live vehicles.
    Serves from Redis if cache is fresh; otherwise hits Verizon API.
    """
    cached = _get_cached_vehicles()
    if cached is not None:
        logger.debug(f"Serving {len(cached)} vehicles from cache")
        return cached

    vehicles = _fetch_from_api()
    _cache_vehicles(vehicles)
    return vehicles
