from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
import models
import schemas
import auth
from services.langchain_service import get_ai_response

router = APIRouter(tags=["Chatbot"])

@router.get("/user/chats", response_model=List[schemas.ChatResponse])
def get_user_chats(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get Chat History:
    Retrieves all chat sessions created by the authenticated user,
    sorted with the most recent sessions first.
    """
    chats = (
        db.query(models.Chat)
        .filter(models.Chat.user_id == current_user.id)
        .order_by(models.Chat.created_at.desc())
        .all()
    )
    return chats


@router.get("/history/{chat_id}", response_model=List[schemas.MessageResponse])
def get_chat_history(
    chat_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get Messages for Chat:
    Returns the complete list of messages in a session.
    Verifies that the session belongs to the currently logged-in user.
    """
    chat = db.query(models.Chat).filter(models.Chat.id == chat_id).first()
    
    # Validation: Ensure chat session exists
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found."
        )
        
    # Security: Ensure user owns this chat session
    if chat.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this chat history."
        )
        
    return chat.messages


@router.post("/chat", response_model=schemas.ChatResponsePayload)
def send_message(
    chat_req: schemas.ChatRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Chat Interaction endpoint:
    1. Validates or creates a Chat session.
    2. Saves the new User Message to SQLite.
    3. Triggers LangChain to retrieve memory and generate a response.
    4. Saves the AI Response to SQLite.
    5. Returns both messages and the chat_id.
    """
    chat_id = chat_req.chat_id
    user_msg_content = chat_req.message.strip()
    
    # 1. Create a new chat session if chat_id is not provided
    if chat_id is None:
        # Determine a title for the chat session based on the first user message (truncated)
        title_snippet = user_msg_content[:30] + ("..." if len(user_msg_content) > 30 else "")
        new_chat = models.Chat(
            user_id=current_user.id,
            title=title_snippet,
            created_at=datetime.utcnow()
        )
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        chat_id = new_chat.id
    else:
        # Verify the requested chat session exists and belongs to this user
        chat = db.query(models.Chat).filter(models.Chat.id == chat_id).first()
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found."
            )
        if chat.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied for this chat session."
            )

    # 2. Save user message to database
    user_msg = models.Message(
        chat_id=chat_id,
        sender="user",
        content=user_msg_content,
        timestamp=datetime.utcnow()
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # 3. Call LangChain service to get response (sends DB history context to AI)
    ai_response_content = get_ai_response(db, chat_id, user_msg_content)

    # 4. Save AI response to database
    ai_msg = models.Message(
        chat_id=chat_id,
        sender="ai",
        content=ai_response_content,
        timestamp=datetime.utcnow()
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    # 5. Return the payload to the frontend
    return schemas.ChatResponsePayload(
        chat_id=chat_id,
        response=ai_response_content,
        user_message=schemas.MessageResponse.from_orm(user_msg),
        ai_message=schemas.MessageResponse.from_orm(ai_msg)
    )
