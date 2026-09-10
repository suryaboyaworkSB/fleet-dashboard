import logging
from typing import List, Optional

import requests
from fastapi import APIRouter, HTTPException, Query

from models.vehicle import Vehicle, VehicleSummary, VehicleStatus
from services.verizon_service import get_live_vehicles
from services.auth_service import get_token
from core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["vehicles"])


@router.get("/live-vehicles", response_model=List[Vehicle])
async def live_vehicles(
    status: Optional[VehicleStatus] = Query(
        None, description="Filter by status: moving | idle | offline"
    ),
):
    """
    Returns all live vehicles from Redis cache (or Verizon API on cache miss).
    Optionally filter by status.
    """
    try:
        vehicles = get_live_vehicles()
    except Exception as e:
        logger.error(f"Error fetching vehicles: {e}")
        raise HTTPException(status_code=502, detail="Failed to fetch vehicle data from upstream API")

    if status:
        vehicles = [v for v in vehicles if v.status == status]

    return vehicles


@router.get("/vehicles/summary", response_model=VehicleSummary)
async def vehicle_summary():
    """Returns aggregate counts by status."""
    try:
        vehicles = get_live_vehicles()
    except Exception as e:
        logger.error(f"Error fetching vehicles for summary: {e}")
        raise HTTPException(status_code=502, detail="Failed to fetch vehicle data from upstream API")

    return VehicleSummary(
        total=len(vehicles),
        moving=sum(1 for v in vehicles if v.status == VehicleStatus.MOVING),
        idle=sum(1 for v in vehicles if v.status == VehicleStatus.IDLE),
        offline=sum(1 for v in vehicles if v.status == VehicleStatus.OFFLINE),
    )


@router.get("/vehicles/{vehicle_id}", response_model=Vehicle)
async def get_vehicle(vehicle_id: str):
    """Returns a single vehicle by ID."""
    try:
        vehicles = get_live_vehicles()
    except Exception as e:
        raise HTTPException(status_code=502, detail="Failed to fetch vehicle data")

    for v in vehicles:
        if v.id == vehicle_id:
            return v

    raise HTTPException(status_code=404, detail=f"Vehicle '{vehicle_id}' not found")


@router.get("/debug/raw", tags=["debug"])
async def debug_raw_response():
    """Returns the raw Verizon API response — use this to inspect field names."""
    try:
        token = get_token()
        response = requests.get(
            settings.VERIZON_API_URL,
            headers={
                "Authorization": f"Atmosphere atmosphere_app_id={settings.VERIZON_APP_ID}, Bearer {token}",
                "Accept": "application/json",
            },
            timeout=10,
        )
        return {
            "status_code": response.status_code,
            "url": settings.VERIZON_API_URL,
            "raw": response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text[:2000],
        }
    except Exception as e:
        return {"error": str(e)}
