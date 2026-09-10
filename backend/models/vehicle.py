from pydantic import BaseModel
from typing import Optional
from enum import Enum


class VehicleStatus(str, Enum):
    MOVING = "moving"
    IDLE = "idle"
    OFFLINE = "offline"


class Vehicle(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    speed: float
    status: VehicleStatus
    last_update: str
    heading: Optional[float] = None
    driver: Optional[str] = None
    address: Optional[str] = None


class VehicleSummary(BaseModel):
    total: int
    moving: int
    idle: int
    offline: int
