import logging
import time

from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

#  engine, Base, and Session factory from our session module
from app.db.session import engine, Base, SessionLocal

# import all models so SQLAlchemy registers them under Base.metadata
from app.db.models import Crop, Farmer, CropPrice, SMSLog

# Set up clean logging output in terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    """
    Seeds initial default data into the database if tables are empty.
    """
    logger.info("Seeding initial default crops...")

    # Check if any crops already exist in the database
    existing_crop = db.query(Crop).first()
    
    if not existing_crop:
        # Default Ugandan staples to seed automatically
        default_crops = [
            Crop(name="Maize", unit="kg"),
            Crop(name="Beans", unit="kg"),
            Crop(name="Matooke", unit="cluster"),
            Crop(name="Coffee", unit="kg"),
        ]
        
        db.add_all(default_crops)
        db.commit()  # Saves initial crops to PostgreSQL permanently
        logger.info("Successfully seeded default crops: Maize, Beans, Matooke, Coffee.")
    else:
        logger.info("Database already contains crop records. Skipping seed step.")


def create_tables() -> None:
    """
    Waits for PostgreSQL to be ready, creates all tables, and seeds default data.
    """
    logger.info("Waiting for PostgreSQL to become available...")

    last_error: Exception | None = None
    for attempt in range(30):
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            break
        except OperationalError as exc:
            last_error = exc
            logger.warning("Database is not ready yet (%s). Retrying in 2 seconds...", exc)
            time.sleep(2)
    else:
        raise RuntimeError("Database did not become ready in time.") from last_error

    logger.info("Creating PostgreSQL tables inside Docker container...")

    # Base.metadata inspects all subclasses of Base (Crop, Farmer, etc.)
    # and generates raw PostgreSQL SQL statements to create tables.
    Base.metadata.create_all(bind=engine)

    logger.info("All tables created successfully!")

    # Open a temporary database session to run the seed script
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()


if __name__ == "__main__":
    logger.info("Starting database initialization script...")
    create_tables()
    logger.info("Database setup complete!")