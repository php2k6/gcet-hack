from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from google.oauth2 import id_token
from google.auth.transport import requests
import os

from app.database import get_db
from app.models import User
from app.auth import auth_handler, get_current_user
from app.schemas.auth_schemas import (
    SignupRequest,
    LoginRequest,
    GoogleAuthRequest,
    RefreshTokenRequest,
    SignupResponse,
    LoginResponse,
    GoogleAuthResponse,
    LogoutResponse,
    RefreshTokenResponse,
    MeResponse,
    UserResponse
)

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

def create_user_response(user: User) -> UserResponse:
    """Helper function to create UserResponse from User model"""
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone or "",  # Handle None values
        district=user.district or "",  # Handle None values
        role=user.role,
        is_google=user.is_google,
        created_at=user.created_at.isoformat()
    )

@router.post("/signup", response_model=LoginResponse, status_code=201)
def signup(
    user_data: SignupRequest,
    db: Session = Depends(get_db)
):
    """Create a new user account (citizen role only)"""
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = auth_handler.hash_password(user_data.password)
    
    # Create new user (force role to be citizen = 0)
    new_user = User(
        id=uuid.uuid4(),
        name=user_data.name,
        email=user_data.email,
        password=hashed_password,
        phone=user_data.phone,
        district=user_data.district,
        role=0,  # Always citizen for signup
        is_google=False
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Convert to UserResponse schema
    user_response = create_user_response(new_user)
    
    # Generate JWT tokens for immediate login after signup
    token_data = {"sub": new_user.email, "role": new_user.role}
    access_token = auth_handler.create_access_token(data=token_data)
    refresh_token = auth_handler.create_refresh_token(data={"sub": new_user.email})
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user_response
    )

@router.post("/login", response_model=LoginResponse)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login existing user with email/password"""
    
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not auth_handler.verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check if role matches (optional role check)
    if user.role != login_data.role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Role mismatch. Please select the correct role."
        )
    
    # Create access token
    token_data = {"sub": user.email, "role": user.role}
    access_token = auth_handler.create_access_token(data=token_data)
    refresh_token = auth_handler.create_refresh_token(data={"sub": user.email})
    
    # Convert user to UserResponse schema
    user_response = create_user_response(user)
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user_response
    )

@router.post("/google", response_model=GoogleAuthResponse)
def google_auth(
    google_data: GoogleAuthRequest,
    db: Session = Depends(get_db)
):
    """Authenticate or create user via Google ID token"""
    
    try:
        # Verify the Google ID token
        # You'll need to set GOOGLE_CLIENT_ID in your environment
        GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        if not GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google authentication not configured"
            )
        
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            google_data.id_token, 
            requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        # Get user info from Google
        google_id = idinfo['sub']  # Google's unique user ID
        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0])  # Fallback to email username
        picture = idinfo.get('picture', '')  # User's profile picture URL
        
        # Check if user exists by email or google_id
        user = db.query(User).filter(
            (User.email == email) | (User.google_id == google_id)
        ).first()
        
        if user:
            # Existing user found
            if user.is_google:
                # User already has Google auth - allow login
                if not user.google_id:
                    user.google_id = google_id  # Update if missing
                    db.commit()
            else:
                # User exists but doesn't use Google auth - link accounts
                user.google_id = google_id
                user.is_google = True
                db.commit()
        else:
            # New user - create with Google auth
            user = User(
                id=uuid.uuid4(),
                name=name,
                email=email,
                password="",  # No password for Google users
                phone="",  # Default empty string since it's mandatory in schema
                district="",  # Default empty string since it's mandatory in schema
                google_id=google_id,
                is_google=True,
                role=0  # Default to citizen
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Create access token
        token_data = {"sub": user.email, "role": user.role}
        access_token = auth_handler.create_access_token(data=token_data)
        
        # Convert user to UserResponse schema
        user_response = create_user_response(user)
        
        return GoogleAuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
        
    except ValueError as e:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google authentication failed"
        )

@router.post("/logout", response_model=LogoutResponse)
def logout(current_user: User = Depends(get_current_user)):
    """Logout user (stateless - just confirms token is valid)"""
    
    # In a stateless JWT system, we don't need to do anything server-side
    # The client should delete the token
    # If you want to implement token blacklisting, you could store invalid tokens in Redis/DB
    
    return LogoutResponse(message="Successfully logged out")

def create_me_response(user: User) -> MeResponse:
    """Helper function to create MeResponse from User model"""
    return MeResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone or "",  # Handle None values
        district=user.district or "",  # Handle None values
        role=user.role,
        is_google=user.is_google,
        created_at=user.created_at.isoformat()
    )

# Additional utility endpoints

@router.get("/me", response_model=MeResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return create_me_response(current_user)

@router.post("/refresh-token", response_model=RefreshTokenResponse)
def refresh_token(request: RefreshTokenRequest):
    """Refresh access token using refresh token"""
    try:
        new_access_token = auth_handler.refresh_access_token(request.refresh_token)
        return RefreshTokenResponse(access_token=new_access_token, token_type="bearer")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )