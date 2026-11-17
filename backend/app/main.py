"""Main FastAPI application entry point for EcoCraft AI."""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.init_db import init_database
from app.api.auth import router as auth_router
from app.api.children import router as children_router
from app.api.crafts import router as crafts_router
from app.api.scanner import router as scanner_router
from app.api.progress import router as progress_router
from app.api.learning import router as learning_router
from app.api.favorites import router as favorites_router
from app.api.portal import router as portal_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables, seed curated crafts, and warm up AI vision pipeline."""
    init_database()
    try:
        from app.ai.classifier import warmup_model
        warmup_model()
    except Exception as exc:
        print(f"Classifier warmup notice: {exc}")
    yield


app = FastAPI(
    title="Eco World API",
    description="Turn Waste Into Wonder – AI & CV powered educational DIY platform for kids aged 5-12",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists
upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Include all API Routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(children_router, prefix="/api")
app.include_router(crafts_router, prefix="/api")
app.include_router(scanner_router, prefix="/api")
app.include_router(progress_router, prefix="/api")
app.include_router(learning_router, prefix="/api")
app.include_router(favorites_router, prefix="/api")
app.include_router(portal_router, prefix="/api")


@app.get("/")
def root():
    return {
        "app": "Eco World",
        "tagline": "Turn Waste Into Wonder!",
        "version": "1.0.0",
        "status": "online",
        "target_audience": "Children aged 5-12, parents & educators",
        "endpoints": "/docs"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "ready",
        "ai_engine": "ready",
        "crafts_catalog": "loaded"
    }
