import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.vehicles import router as vehicles_router

# ── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── App ────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Fleet Dashboard API",
    description="Real-time fleet tracking powered by Verizon Fleet API + Redis",
    version="1.0.0",
)

# ── CORS (allow React dev server) ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(vehicles_router)


# ── Health check ───────────────────────────────────────────────────────────
@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "service": "Fleet Dashboard API"}


# ── Startup log ───────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Fleet Dashboard API started — http://localhost:8000")
    logger.info("📖 API docs available at  http://localhost:8000/docs")
