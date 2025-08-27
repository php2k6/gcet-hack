from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    district: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    role: int
    is_google: bool
    google_id: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Authority Schemas
class AuthorityBase(BaseModel):
    name: str
    district: str
    contact_email: EmailStr
    contact_phone: Optional[str] = None
    category: str

class AuthorityCreate(AuthorityBase):
    user_id: str

class AuthorityResponse(AuthorityBase):
    id: str
    user_id: str
    
    class Config:
        from_attributes = True

# Issue Schemas
class IssueBase(BaseModel):
    title: str
    description: str
    location: str
    category: str
    priority: Optional[int] = 1

class IssueCreate(IssueBase):
    authority_id: str

class IssueResponse(IssueBase):
    id: str
    user_id: str
    authority_id: str
    status: int
    created_at: datetime
    updated_at: datetime
    priority: int
    
    class Config:
        from_attributes = True

# Vote Schemas
class VoteBase(BaseModel):
    issue_id: str

class VoteCreate(VoteBase):
    pass

class VoteResponse(VoteBase):
    id: str
    user_id: str
    
    class Config:
        from_attributes = True

# Media Schemas
class MediaBase(BaseModel):
    path: str

class MediaCreate(MediaBase):
    issue_id: str

class MediaResponse(MediaBase):
    id: str
    issue_id: str
    
    class Config:
        from_attributes = True

# Notification Schemas
class NotificationBase(BaseModel):
    message: str
    is_citizen: Optional[bool] = True

class NotificationCreate(NotificationBase):
    issue_id: str
    user_id: str

class NotificationResponse(NotificationBase):
    id: str
    issue_id: str
    user_id: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Award Schemas
class AwardBase(BaseModel):
    description: str
    is_citizen: Optional[bool] = True

class AwardCreate(AwardBase):
    winner_id: str

class AwardResponse(AwardBase):
    id: str
    winner_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True