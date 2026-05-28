import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Define database location: SQLite file named 'chatbot.db' in the backend folder
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chatbot.db")
DATABASE_URL = f"sqlite:///{DB_FILE}"

# Create SQLAlchemy engine.
# Note: connect_args={"check_same_thread": False} is required only for SQLite
# as it allows multiple threads to access the database concurrently.
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

# SessionLocal class will be used to instantiate database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base class that our database models will inherit from
Base = declarative_base()

# Dependency to get the database session for each request.
# This yields a session and ensures it is closed after the request is finished.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
