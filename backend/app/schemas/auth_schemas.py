from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID

# Request Models
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    district: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: int = 0  # Default to citizen

class GoogleAuthRequest(BaseModel):
    id_token: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

# Response Models
class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    phone: str
    district: str
    role: int
    is_google: bool
    google_id: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True

class SignupResponse(BaseModel):
    message: str = "User created successfully"
    user: UserResponse

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class GoogleAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class LogoutResponse(BaseModel):
    message: str = "Logged out successfully"

class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class MeResponse(BaseModel):
    id: UUID
    name: str
    email: str
    phone: str
    district: str
    role: int
    is_google: bool
    created_at: str

    class Config:
        from_attributes = True
