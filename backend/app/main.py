from fastapi import FastAPI, APIRouter
from app.database import engine, get_db
from sqlalchemy.orm import Session
import app.models
from app.routers import chatbot, auth, user, question, answer, vote, notifications, home, comment
from fastapi.middleware.cors import CORSMiddleware
import re
app = FastAPI()
app.include_router(chatbot.router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",     
    allow_credentials=True,    
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api")
def root():
    return {"message" : "Hello World"}