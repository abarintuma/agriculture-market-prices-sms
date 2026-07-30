from datetime import datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict


class FarmerBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    phone_number: str = Field(..., description="Phone number in E.164 format, e.g. +256700000000")
    district: str = Field(default="Kampala", max_length=100)

    # custom field validator to enforce valid phone formatting
    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, value: str) -> str:
        # strip all whitespaces
        cleaned = value.replace(" ", "")
        
        if cleaned.startswith("0") and len(cleaned) == 10:
            cleaned = "+256" + cleaned[1:]
        
        # Ensure it starts with '+' and contains only numbers after
        if not cleaned.startswith("+") or not cleaned[1:].isdigit():
            raise ValueError("Phone number must be in format +2567... or 07...")
            
        return cleaned


class FarmerCreate(FarmerBase):
    pass


class FarmerResponse(FarmerBase):
    id: int
    is_active: bool
    registered_at: datetime

    model_config = ConfigDict(from_attributes=True)