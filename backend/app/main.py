from fastapi import FastAPI
from app.database import engine
from app.models import Base
from app.routers import chatbot, auth, users, issues, authorities
from fastapi.middleware.cors import CORSMiddleware

# Import all models to ensure they're registered
from app import models

# Note: Using Alembic migrations instead of create_all
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GCET Hack API",
    description="Backend API for GCET Hack project - Civic Engagement Platform",
    version="1.0.0"
)

# CORS middleware - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Set to False when using "*" for origins
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=[
        "*",
        "Authorization", 
        "Content-Type", 
        "Accept",
        "Origin",
        "User-Agent",
        "DNT",
        "Cache-Control",
        "X-Mx-ReqToken",
        "Keep-Alive",
        "X-Requested-With",
        "If-Modified-Since"
    ],
    expose_headers=["*"],
)

# Include routers
app.include_router(chatbot.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(issues.router, prefix="/api")
app.include_router(authorities.router, prefix="/api")

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