from fastapi import APIRouter

from app.api.v1.crops import router as crops_router
from app.api.v1.prices import router as prices_router
from app.api.v1.farmers import router as farmers_router
from app.api.v1.sms import router as sms_router

api_router = APIRouter()

# Register individual route modules with clear URL prefixes and OpenAPI tags
api_router.include_router(crops_router, prefix="/crops", tags=["Crops"])
api_router.include_router(prices_router, prefix="/prices", tags=["Prices"])
api_router.include_router(farmers_router, prefix="/farmers", tags=["Farmers"])
api_router.include_router(sms_router, prefix="/sms", tags=["SMS Broadcasts"])