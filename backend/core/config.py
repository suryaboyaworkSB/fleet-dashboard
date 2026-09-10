import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Verizon API
    VERIZON_API_URL: str = os.getenv("VERIZON_API_URL", "https://fim.api.us.fleetmatics.com/rad/v1/vehicles")
    VERIZON_AUTH_URL: str = os.getenv("VERIZON_AUTH_URL", "https://fim.api.us.fleetmatics.com/token")
    VERIZON_APP_ID: str = os.getenv("VERIZON_APP_ID", "")
    VERIZON_USERNAME: str = os.getenv("VERIZON_USERNAME", "")
    VERIZON_PASSWORD: str = os.getenv("VERIZON_PASSWORD", "")

    # Redis
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_TTL: int = int(os.getenv("REDIS_TTL", "30"))

    # Misc
    POLL_INTERVAL: int = int(os.getenv("POLL_INTERVAL", "5"))

settings = Settings()
