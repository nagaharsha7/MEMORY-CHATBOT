import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from langchain_classic.chains import ConversationChain
from langchain_classic.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI

import models

# Load environment variables
load_dotenv()

def get_ai_response(db: Session, chat_id: int, user_message_content: str) -> str:
    """
    Core LangChain Service:
    1. Reads past messages from SQLite for a given chat session.
    2. Constructs a LangChain ConversationBufferMemory object and populates it.
    3. Initializes ChatOpenAI pointing to the OpenRouter endpoint.
    4. Runs ConversationChain to generate a response from the AI.
    """
    
    # Retrieve configuration from environment variables
    api_key = os.getenv("OPENROUTER_API_KEY")
    model_name = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
    api_base = "https://openrouter.ai/api/v1"
    
    # Validation: Raise error if API key is missing/placeholder
    if not api_key or api_key == "your_openrouter_api_key_here":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenRouter API key is missing. Please configure OPENROUTER_API_KEY in the backend/.env file."
        )

    # 1. Fetch historical messages for this chat session from database (ordered chronologically)
    past_messages = (
        db.query(models.Message)
        .filter(models.Message.chat_id == chat_id)
        .order_by(models.Message.timestamp.asc())
        .all()
    )

    # 2. Build LangChain's memory and seed it with the chat history
    memory = ConversationBufferMemory()
    for msg in past_messages:
        if msg.sender == "user":
            memory.chat_memory.add_user_message(msg.content)
        elif msg.sender == "ai":
            memory.chat_memory.add_ai_message(msg.content)

    try:
        # 3. Instantiate the ChatOpenAI client customized for OpenRouter
        # OpenRouter needs some additional headers to satisfy its request protocol,
        # such as referring site and app title.
        llm = ChatOpenAI(
            openai_api_base=api_base,
            openai_api_key=api_key,
            model_name=model_name,
            temperature=0.7,
            default_headers={
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Full Stack AI Chatbot with Memory"
            }
        )

        # 4. Bind the model and memory inside a ConversationChain
        conversation = ConversationChain(
            llm=llm,
            memory=memory,
            verbose=True  # Logs the prompt variables to stdout (useful for debugging)
        )

        # 5. Execute the chain.
        # LangChain automatically injects the accumulated conversation history
        # and appends the new user message.
        ai_response = conversation.predict(input=user_message_content)
        
        return ai_response.strip()

    except Exception as e:
        # Log the error details and return a user-friendly API exception
        print(f"Error calling OpenRouter API: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error communicating with OpenRouter: {str(e)}"
        )
