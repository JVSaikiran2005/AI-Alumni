from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from config import settings
from database import engine, Base, get_db
import models
from schemas import UserResponse
from groq import Groq
from pydantic import BaseModel
from typing import List
import uuid

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AlumniConnect API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserSyncPayload(BaseModel):
    firebase_uid: str
    email: str
    full_name: str
    role: models.UserRole = models.UserRole.STUDENT


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    user_id: str
    messages: List[ChatMessage]


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/")
async def root():
    return {"message": "AlumniConnect API is running"}


@app.post("/users/sync", response_model=UserResponse)
async def sync_user(payload: UserSyncPayload, db: Session = Depends(get_db)):
    """
    Create or update a user record in the database based on Firebase user info.
    """
    user = db.query(models.User).filter(models.User.id == payload.firebase_uid).first()

    if not user:
        user = models.User(
            id=payload.firebase_uid,
            email=payload.email,
            password_hash="",  # handled by Firebase, not used here
            full_name=payload.full_name,
            role=payload.role,
        )
        db.add(user)
    else:
        user.email = payload.email
        user.full_name = payload.full_name
        user.role = payload.role

    db.commit()
    db.refresh(user)

    return UserResponse.from_orm(user)


@app.post("/ai/chat")
async def ai_chat(request: ChatRequest):
    """
    AI interaction endpoint backed by Groq large language models.
    """
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")

    client = Groq(api_key=settings.GROQ_API_KEY)

    try:
        completion = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": m.role, "content": m.content} for m in request.messages],
        )
        ai_message = completion.choices[0].message.content
        return {"reply": ai_message}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
