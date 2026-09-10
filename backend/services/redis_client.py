"""
redis_client.py
───────────────
Shared Redis connection used by auth_service and verizon_service.
Gracefully degrades if Redis is unavailable.
"""

import logging
import redis as redis_lib

from core.config import settings

logger = logging.getLogger(__name__)

try:
    redis_client = redis_lib.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        decode_responses=True,
        socket_connect_timeout=3,
        socket_timeout=3,
    )
    redis_client.ping()
    REDIS_AVAILABLE = True
    logger.info("✅ Redis connected")
except Exception as e:
    redis_client = None
    REDIS_AVAILABLE = False
    logger.warning(f"⚠️  Redis unavailable ({e}) — running without cache")
