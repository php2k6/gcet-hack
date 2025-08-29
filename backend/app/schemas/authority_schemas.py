from pydantic import BaseModel, Field, UUID4, EmailStr
from typing import Optional
from datetime import datetime

# Authority creation schema (includes user fields)
class AuthorityCreateRequest(BaseModel):
    # User fields
    user_name: str = Field(..., min_length=3, max_length=100, description="User name")
    email: EmailStr = Field(..., description="Email address (used for both user and authority contact)")
    password: str = Field(..., min_length=6, max_length=100, description="User password")
    district: str = Field(..., min_length=2, max_length=100, description="District")
    
    # Authority fields
    authority_name: str = Field(..., min_length=3, max_length=255, description="Authority organization name")
    contact_phone: Optional[str] = Field(None, max_length=20, description="Contact phone")
    category: str = Field(..., min_length=2, max_length=100, description="Authority category")

# Authority request schemas
class AuthorityUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=255, description="Authority name")
    district: Optional[str] = Field(None, min_length=2, max_length=100, description="District served")
    contact_email: Optional[str] = Field(None, description="Contact email address")
    contact_phone: Optional[str] = Field(None, max_length=20, description="Contact phone number")
    category: Optional[str] = Field(None, min_length=2, max_length=100, description="Authority category")

# Authority response schemas
class AuthorityUserResponse(BaseModel):
    id: UUID4
    name: str
    email: str
    role: int
    
    class Config:
        from_attributes = True

class AuthorityResponse(BaseModel):
    id: UUID4
    name: str
    district: str
    contact_email: str
    contact_phone: Optional[str]
    category: str
    user_id: UUID4
    
    # Related data
    user: AuthorityUserResponse
    
    class Config:
        from_attributes = True
