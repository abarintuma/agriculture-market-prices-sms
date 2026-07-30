from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Defines the structure, types, and defaults for application settings.
    Pydantic automatically matches class attribute names with keys in .env.
    """
    # 1. Application Settings
    PROJECT_NAME: str = "Agri-Market SMS API"
    DEBUG: bool = True

    # By leaving this without a default value, Pydantic requires
    DATABASE_URL: str

    OPENWEATHER_API_KEY: str = ""
    DEFAULT_CITY: str = "Kampala,UG"

    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # Pydantic configuration telling it to read from the local .env file
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"  # Ignore any extra variables in .env if not explicitly declared above
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()