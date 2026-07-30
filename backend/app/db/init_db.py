import logging
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
    Connects to PostgreSQL in Docker and executes 'CREATE TABLE IF NOT EXISTS'
    for every model defined under Base.
    """
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