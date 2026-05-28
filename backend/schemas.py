from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# --- USER SCHEMAS ---

class UserCreate(BaseModel):
    """
    Schema for user registration request.
    """
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")


class UserResponse(BaseModel):
    """
    Schema for user registration/login response (without password).
    """
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True


# --- AUTH SCHEMAS ---

class Token(BaseModel):
    """
    Schema representing JWT token details sent to client.
    """
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """
    Schema for decoded JWT token contents.
    """
    user_id: Optional[int] = None
    username: Optional[str] = None


# --- CHAT & MESSAGE SCHEMAS ---

class MessageCreate(BaseModel):
    """
    Schema for saving a message.
    """
    content: str
    sender: str  # 'user' or 'ai'


class MessageResponse(BaseModel):
    """
    Schema for message data returned to client.
    """
    id: int
    chat_id: int
    sender: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True


class ChatCreate(BaseModel):
    """
    Schema for creating a new chat session.
    """
    title: Optional[str] = "New Chat"


class ChatResponse(BaseModel):
    """
    Schema for chat session details.
    """
    id: int
    user_id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    """
    Schema for sending a chat message.
    """
    message: str = Field(..., min_length=1, description="Message to send to AI")
    chat_id: Optional[int] = Field(None, description="Active Chat ID. If omitted, a new chat session will be created.")


class ChatResponsePayload(BaseModel):
    """
    Schema for FastAPI response after processing a chat input.
    """
    chat_id: int
    response: str
    user_message: MessageResponse
    ai_message: MessageResponse

    class Config:
        from_attributes = True
