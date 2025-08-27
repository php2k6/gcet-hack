from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,  # Set to True to log SQL queries (useful for debugging)
    pool_pre_ping=True  # Helps avoid stale connections
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
#get session dependency
def get_db() :
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()