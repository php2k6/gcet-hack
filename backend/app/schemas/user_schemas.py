from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class UserResponse(BaseModel):
    """User response model for API responses"""
    id: UUID
    name: str
    email: EmailStr
    phone: Optional[str] = None
    district: Optional[str] = None
    role: int
    is_google: bool
    google_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdateRequest(BaseModel):
    """User update request model"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    district: Optional[str] = Field(None, max_length=100)
    role: Optional[int] = Field(None, ge=0, le=2)  # 0=citizen, 1=authority, 2=admin (admin only)
    
    class Config:
        # Don't allow updating email, password, is_google, created_at
        extra = "forbid"

class UserListResponse(BaseModel):
    """Response model for user list with pagination"""
    users: List[UserResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class UserQueryParams(BaseModel):
    """Query parameters for user list endpoint"""
    role: Optional[int] = Field(None, ge=0, le=2, description="Filter by user role")
    district: Optional[str] = Field(None, description="Filter by district")
    search: Optional[str] = Field(None, description="Search by name or email")
    created_after: Optional[datetime] = Field(None, description="Filter users created after this date")
    created_before: Optional[datetime] = Field(None, description="Filter users created before this date")
    limit: int = Field(10, ge=1, le=100, description="Number of results per page")
    page: int = Field(1, ge=1, description="Page number")
    sort_by: Optional[str] = Field("created_at", description="Sort by field (created_at, name, email)")
    sort_order: Optional[str] = Field("desc", description="Sort order (asc, desc)")
