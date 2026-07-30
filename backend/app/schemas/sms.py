from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# Schema for manually triggering an SMS broadcast
class SMSBroadcastRequest(BaseModel):
    district_filter: Optional[str] = None  # Send to all districts, or filter by 'Kampala'
    custom_note: Optional[str] = None      # optional extra note added to SMS


# schema for returning broadcast outcome statistics
class SMSBroadcastResponse(BaseModel):
    total_recipients: int
    successful_sends: int
    failed_sends: int
    message_preview: str


# audit log response
class SMSLogResponse(BaseModel):
    id: int
    recipient_phone: str
    message_body: str
    status: str
    provider_message_id: Optional[str] = None
    error_message: Optional[str] = None
    sent_at: datetime

    model_config = ConfigDict(from_attributes=True)