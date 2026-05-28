import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load local environment files if present
load_dotenv()

# Read the connection string from the environment.
# Render will supply this automatically as 'DATABASE_URL'.
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Fallback to local SQLite file if no cloud database URL is provided
    DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chatbot.db")
    DATABASE_URL = f"sqlite:///{DB_FILE}"

# SQLAlchemy requires 'postgresql://' instead of 'postgres://' (Render default prefix)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configure the connection engine
if DATABASE_URL.startswith("sqlite"):
    # SQLite requires check_same_thread=False
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL connection (cloud)
    engine = create_engine(DATABASE_URL)

# Setup session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    """
    Dependency to yield db session and close it afterward.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
