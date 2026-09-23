"""
MediScan FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings, validate_runtime_settings
from app.database import engine, Base
from app.api import auth, profile, scanner, dashboard, bot, community
from app.security import SecurityHeadersMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    validate_runtime_settings()
    # Create all tables on startup (use Alembic migrations in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="MediScan API",
    description="Personal health scanner — cross-reference product data with your health profile.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.add_middleware(SecurityHeadersMiddleware)

# Routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(scanner.router)
app.include_router(dashboard.router)
app.include_router(bot.router)
app.include_router(community.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "MediScan API v1.0"}
