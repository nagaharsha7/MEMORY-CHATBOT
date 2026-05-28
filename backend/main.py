import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routes import auth_routes, chat_routes

# Automatically create all SQLite tables on application startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Full Stack AI Chatbot with Memory",
    description="A ChatGPT-like clone using FastAPI, SQLAlchemy, SQLite, and LangChain memory.",
    version="1.0.0"
)

# Configure Cross-Origin Resource Sharing (CORS).
# This permits our React frontend (running on http://localhost:5173 or http://127.0.0.1:5173)
# to query this API.
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://frontend-theta-weld-46.vercel.app",
    "https://frontend-ke8x6xplt-nagaharsha7s-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https://.*\\.vercel\\.app",
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allows all HTTP headers
)

# Include Router paths from routes/ package
app.include_router(auth_routes.router)
app.include_router(chat_routes.router)

# Health Check Route
@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "message": "AI Chatbot API is online and functional."
    }



if __name__ == "__main__":
    # Runs the application on http://127.0.0.1:8000
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
