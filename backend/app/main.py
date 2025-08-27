from fastapi import FastAPI
from app.database import engine
from app.models import Base
from app.routers import chatbot
from fastapi.middleware.cors import CORSMiddleware

# Import all models to ensure they're registered
from app import models

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GCET Hack API",
    description="Backend API for GCET Hack project - Civic Engagement Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",     
    allow_credentials=True,    
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chatbot.router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "GCET Hack API is running!",
        "description": "Civic Engagement Platform for Citizens and Authorities",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}