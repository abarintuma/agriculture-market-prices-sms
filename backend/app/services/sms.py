from typing import Dict, Any
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

from app.core.config import settings


def get_twilio_client() -> Client:
    """
    Initializes and returns the official Twilio REST Client using our credentials.
    """
    return Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)


def send_single_sms(to_phone: str, message_body: str) -> Dict[str, Any]:
    """
    Sends an SMS message to a single phone number via Twilio.
    
    :param to_phone: Target phone number in E.164 format (e.g. +256700000000)
    :param message_body: The text message content to send
    :return: Dictionary containing delivery status and message SID
    """
    # 1. Ensure Twilio credentials are provided
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        print("Warning: Twilio credentials missing in .env. SMS skipped.")
        return {
            "success": False,
            "error": "Twilio credentials not configured.",
            "message_sid": None,
        }

    try:
        # 2. Instantiate Twilio Client
        client = get_twilio_client()

        # 3. Dispatch the SMS message
        message = client.messages.create(
            body=message_body,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=to_phone
        )

        print(f"SMS sent successfully to {to_phone}! SID: {message.sid}")
        return {
            "success": True,
            "message_sid": message.sid,
            "error": None,
        }

    except TwilioRestException as e:
        print(f"Twilio Error sending to {to_phone}: {e.msg}")
        return {
            "success": False,
            "message_sid": None,
            "error": f"Twilio Error ({e.code}): {e.msg}",
        }
    except Exception as e:
        print(f"Unexpected error sending SMS: {str(e)}")
        return {
            "success": False,
            "message_sid": None,
            "error": str(e),
        }