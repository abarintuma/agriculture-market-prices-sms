from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Farmer
from app.schemas.farmer import FarmerCreate, FarmerResponse

router = APIRouter()


@router.post("/", response_model=FarmerResponse, status_code=status.HTTP_201_CREATED)
def register_farmer(farmer_in: FarmerCreate, db: Session = Depends(get_db)):
    """
    Registers a new farmer for automated SMS price broadcasts.
    """
    existing = db.query(Farmer).filter(Farmer.phone_number == farmer_in.phone_number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A farmer with this phone number is already registered."
        )

    db_farmer = Farmer(
        full_name=farmer_in.full_name,
        phone_number=farmer_in.phone_number,
        district=farmer_in.district,
    )
    db.add(db_farmer)
    db.commit()
    db.refresh(db_farmer)
    return db_farmer


@router.get("/", response_model=List[FarmerResponse])
def list_farmers(db: Session = Depends(get_db)):
    """
    Retrieves all registered farmers.
    """
    return db.query(Farmer).order_by(Farmer.registered_at.desc()).all()