from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Crop(Base):
    """
    Represents a type of crop sold in Ugandan markets.
    Examples: Maize, Beans, Matooke, Coffee.
    """
    __tablename__ = "crops"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    unit: Mapped[str] = mapped_column(String(20), default="kg")  # e.g., kg, bag, cluster
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    # Relationship: One crop has many historical price records over time
    prices: Mapped[List["CropPrice"]] = relationship("CropPrice", back_populates="crop", cascade="all, delete-orphan")


class CropPrice(Base):
    """
    Represents daily market price entries for a crop in a specific city/market.
    Supports both automated API fetches and manual admin overrides.
    """
    __tablename__ = "crop_prices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    crop_id: Mapped[int] = mapped_column(Integer, ForeignKey("crops.id"), nullable=False)
    
    price_ugx: Mapped[float] = mapped_column(Float, nullable=False)  # Price in Ugandan Shillings
    market_location: Mapped[str] = mapped_column(String(100), default="Kampala")
    price_source: Mapped[str] = mapped_column(String(50), default="MANUAL_OVERRIDE")  # "AUTOMATIC_API" or "MANUAL_OVERRIDE"
    
    date_recorded: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        index=True
    )

    # Relationship back to the main Crop model
    crop: Mapped["Crop"] = relationship("Crop", back_populates="prices")


class Farmer(Base):
    """
    Represents a registered farmer who receives daily SMS broadcasts.
    """
    __tablename__ = "farmers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)  # e.g. +256700000000
    district: Mapped[str] = mapped_column(String(100), default="Kampala")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)  # Farmers can opt out
    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )


class SMSLog(Base):
    """
    Audit log tracking every SMS broadcast attempt, status, and contents.
    """
    __tablename__ = "sms_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    recipient_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    message_body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING")  # "SENT", "FAILED", "DELIVERED"
    provider_message_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # Twilio SID
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sent_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )