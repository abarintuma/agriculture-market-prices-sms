from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# Base schema (shared attributes)
class CropBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Name of the crop, e.g. Maize")
    unit: str = Field(default="kg", max_length=20, description="Unit of measurement, e.g. kg, bag")


# schema for incoming requests from admin
class CropCreate(CropBase):
    pass  # inherits name and unit from CropBase without modification


# what fastapi sends to frontend
class CropResponse(CropBase):
    id: int
    created_at: datetime

    # crucial Pydantic v2 configuration!
    # Allows Pydantic to read data directly from SQLAlchemy ORM objects
    model_config = ConfigDict(from_attributes=True)