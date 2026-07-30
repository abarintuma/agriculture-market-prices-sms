from typing import Dict, Any, Optional
import httpx
from app.core.config import settings


async def fetch_weather_data(city: str = settings.DEFAULT_CITY) -> Optional[Dict[str, Any]]:
    """
    Asynchronously fetches current weather data from OpenWeatherMap API.
    
    Returns raw JSON dictionary if successful, or None if the request fails.
    """
    if not settings.OPENWEATHER_API_KEY:
        print("Warning: OPENWEATHER_API_KEY is not set in .env")
        return None

    # OpenWeatherMap current weather endpoint
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": city,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",  # Get temperature in celsius
    }

    try:
        # Use httpx.AsyncClient for non-blocking asynchronous HTTP calls
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            
            # Raises an exception if HTTP status is 4xx or 5xx
            response.raise_for_status()
            
            return response.json()

    except httpx.HTTPStatusError as exc:
        print(f"OpenWeather API HTTP Error: {exc.response.status_code} - {exc.response.text}")
        return None
    except Exception as exc:
        print(f"Failed to connect to OpenWeather API: {exc}")
        return None


async def get_formatted_weather_summary(city: str = settings.DEFAULT_CITY) -> str:
    """
    Calls fetch_weather_data() and formats the raw JSON into a short,
    SMS-friendly text string for Ugandan farmers.
    
    Example output: "26°C, Light Rain expected"
    """
    data = await fetch_weather_data(city)

    if not data:
        return "Weather unavailable today."

    try:
        # Extract main temperature and general weather description
        temp = round(data["main"]["temp"])
        description = data["weather"][0]["description"].capitalize()
        
        return f"{temp}°C, {description}"
    except (KeyError, IndexError):
        return "Weather unavailable today."