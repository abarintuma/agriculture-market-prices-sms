from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Crop
from app.schemas.crop import CropCreate, CropResponse

router = APIRouter()


@router.post("/", response_model=CropResponse, status_code=status.HTTP_201_CREATED)
def create_crop(crop_in: CropCreate, db: Session = Depends(get_db)):
    """
    Registers a new crop (e.g., Cassava, Rice) in the system.
    """
    # Check if a crop with the same name already exists
    existing = db.query(Crop).filter(Crop.name.ilike(crop_in.name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Crop '{crop_in.name}' already exists."
        )

    db_crop = Crop(name=crop_in.name, unit=crop_in.unit)
    db.add(db_crop)
    db.commit()
    db.refresh(db_crop)  # Reloads model instance from DB to obtain newly generated 'id'
    return db_crop


@router.get("/", response_model=List[CropResponse])
def list_crops(db: Session = Depends(get_db)):
    """
    Returns a list of all registered crops.
    """
    return db.query(Crop).order_by(Crop.name.asc()).all()