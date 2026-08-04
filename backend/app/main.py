from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_router

# 1. Initialize FastAPI Application Instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Agri-Market SMS updates, weather integration, and price management.",
    version="1.0.0",
    docs_url="/docs",       # Interactive Swagger UI documentation
    redoc_url="/redoc",     # Alternative ReDoc documentation
)

# 2. Configure CORS (Cross-Origin Resource Sharing)
# Allows the React + Vite frontend (port 3000) to call this API without browser CORS errors.
# When using docker-compose with Nginx reverse-proxying /api -> backend, the Origin header
# will be the frontend URL, so we must list it explicitly.
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    # Add your production frontend domain here when deploying:
    # "https://yourdomain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, PUT, DELETE, OPTIONS, etc.
    allow_headers=["*"],  # Allows all standard request headers
)

# 3. Mount Central API Router
# All API endpoints in app/api/v1/ will now be prefixed with /api/v1
app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
def initialize_database() -> None:
    """Create database tables and seed defaults before serving requests."""
    from app.db.init_db import create_tables

    create_tables()


# 4. Root & Health Check Endpoints
@app.get("/", tags=["Health Check"])
def root_check():
    """
    Root endpoint returning basic app metadata.
    """
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health", tags=["Health Check"])
def health_check():
    """
    Used by load balancers, Docker, or monitoring tools to check system uptime.
    """
    return {"status": "healthy"}