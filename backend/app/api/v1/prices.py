from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Crop, CropPrice
from app.schemas.price import CropPriceCreate, CropPriceResponse

router = APIRouter()


@router.post("/", response_model=CropPriceResponse, status_code=status.HTTP_201_CREATED)
def record_crop_price(price_in: CropPriceCreate, db: Session = Depends(get_db)):
    """
    Records a new market price entry for a specific crop.
    """
    # Verify the target crop exists
    crop = db.query(Crop).filter(Crop.id == price_in.crop_id).first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Crop with ID {price_in.crop_id} not found."
        )

    db_price = CropPrice(
        crop_id=price_in.crop_id,
        price_ugx=price_in.price_ugx,
        market_location=price_in.market_location,
        price_source=price_in.price_source,
    )
    db.add(db_price)
    db.commit()
    db.refresh(db_price)
    return db_price


@router.get("/latest", response_model=List[CropPriceResponse])
def get_latest_prices(db: Session = Depends(get_db)):
    """
    Fetches the most recent price entry recorded for each registered crop.
    """
    crops = db.query(Crop).all()
    latest_prices = []

    for crop in crops:
        latest_entry = (
            db.query(CropPrice)
            .filter(CropPrice.crop_id == crop.id)
            .order_by(CropPrice.date_recorded.desc())
            .first()
        )
        if latest_entry:
            latest_prices.append(latest_entry)

    return latest_prices