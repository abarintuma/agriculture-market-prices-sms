from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import settings

# create pysical connection pool to postgres
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG, # If DEBUG=True, prints raw SQL statements to terminal!
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

class Base(DeclarativeBase):
    pass

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()