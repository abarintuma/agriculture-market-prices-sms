from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Crop, CropPrice, Farmer, SMSLog
from app.schemas.sms import SMSBroadcastRequest, SMSBroadcastResponse
from app.services.openweather import get_formatted_weather_summary
from app.services.sms import send_single_sms

router = APIRouter()


@router.post("/broadcast", response_model=SMSBroadcastResponse)
async def trigger_sms_broadcast(
    payload: SMSBroadcastRequest, 
    db: Session = Depends(get_db)
):
    """
    Fetches latest prices + live weather, formats a broadcast message,
    and dispatches SMS to active farmers.
    """
    # Fetch active farmers (optionally filtered by district)
    query = db.query(Farmer).filter(Farmer.is_active == True)
    if payload.district_filter:
        query = query.filter(Farmer.district.ilike(payload.district_filter))
    
    farmers = query.all()
    if not farmers:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active farmers found matching the criteria."
        )

    # Compile market price summary
    crops = db.query(Crop).all()
    price_lines = []
    
    for crop in crops:
        latest = (
            db.query(CropPrice)
            .filter(CropPrice.crop_id == crop.id)
            .order_by(CropPrice.date_recorded.desc())
            .first()
        )
        if latest:
            price_lines.append(f"{crop.name}: UGX {latest.price_ugx:,.0f}/{crop.unit}")

    price_summary = ", ".join(price_lines) if price_lines else "No market updates today."

    # Fetch live weather summary asynchronously
    weather_summary = await get_formatted_weather_summary()

    # Construct final SMS message body
    message_body = f"AGRI-UPDATE\nPrices: {price_summary}\nWeather: {weather_summary}"
    if payload.custom_note:
        message_body += f"\nNote: {payload.custom_note}"

    # Dispatch SMS and log entries in PostgreSQL
    successful_sends = 0
    failed_sends = 0

    for farmer in farmers:
        result = send_single_sms(farmer.phone_number, message_body)
        
        # Log delivery status
        sms_log = SMSLog(
            recipient_phone=farmer.phone_number,
            message_body=message_body,
            status="SENT" if result["success"] else "FAILED",
            provider_message_id=result.get("message_sid"),
            error_message=result.get("error"),
        )
        db.add(sms_log)

        if result["success"]:
            successful_sends += 1
        else:
            failed_sends += 1

    db.commit()  # Save all SMS log entries

    return SMSBroadcastResponse(
        total_recipients=len(farmers),
        successful_sends=successful_sends,
        failed_sends=failed_sends,
        message_preview=message_body,
    )