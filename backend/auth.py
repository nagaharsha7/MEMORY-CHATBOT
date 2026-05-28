import os
from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db
import models

# Load environment variables from .env
load_dotenv()

# JWT Config
SECRET_KEY = os.getenv("SECRET_KEY", "5eb76db406a4a15998a6358dbb8e1a8a2529fa47cf7918a9db8c27a92fb4efab")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # Token valid for 24 hours

# FastAPI security helper: parses Authorization header "Bearer <token>"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# --- PASSWORD UTILITIES ---

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compares cleartext password with its stored bcrypt hash.
    """
    try:
        # bcrypt expects bytes for both the password and the hash
        plain_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """
    Generates a secure bcrypt hash of a raw password string.
    """
    # bcrypt expects bytes for hashing
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')



# --- JWT TOKEN UTILITIES ---

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Signs and encodes claims (like user_id/username) into a JWT token.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add standard JWT expiry claim
    to_encode.update({"exp": expire})
    
    # Sign using HS256 algorithm and application secret key
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# --- FASTAPI DEPENDENCY FOR PROTECTED ROUTES ---

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    """
    Decodes JWT token, checks expiry, and returns the authenticated User DB object.
    Raises 401 Unauthorized if verification fails.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode token. This automatically fails if token signature or expiry is invalid
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        username: str = payload.get("sub")  # 'sub' is standard claim for subject (username)
        
        if user_id is None or username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    # Retrieve user from the database
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
        
    return user
