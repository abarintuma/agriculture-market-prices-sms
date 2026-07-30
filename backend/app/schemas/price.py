from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict


# base schema for market prices
class CropPriceBase(BaseModel):
    price_ugx: float = Field(..., gt=0, description="Price in Ugandan Shillings (must be greater than 0)")
    market_location: str = Field(default="Kampala", max_length=100)
    price_source: Literal["AUTOMATIC_API", "MANUAL_OVERRIDE"] = "MANUAL_OVERRIDE"


# input schema (when Next.js admin submits a price update)
class CropPriceCreate(CropPriceBase):
    crop_id: int = Field(..., description="The ID of the crop being priced")


class CropPriceResponse(CropPriceBase):
    id: int
    crop_id: int
    date_recorded: datetime

    model_config = ConfigDict(from_attributes=True)