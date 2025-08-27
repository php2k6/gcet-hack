from pydantic import BaseModel, Field, UUID4
from typing import Optional, List
from datetime import datetime

# Vote schemas
class VoteResponse(BaseModel):
    id: UUID4
    user_id: UUID4
    issue_id: UUID4
    
    class Config:
        from_attributes = True

# Issue request schemas
class IssueCreateRequest(BaseModel):
    authority_id: UUID4 = Field(..., description="Authority responsible for this issue")
    title: str = Field(..., min_length=5, max_length=255, description="Issue title")
    description: str = Field(..., min_length=10, description="Detailed description of the issue")
    location: str = Field(..., min_length=3, max_length=255, description="Location where issue occurred")
    category: str = Field(..., min_length=2, max_length=100, description="Issue category")
    priority: Optional[int] = Field(1, ge=1, le=4, description="Priority level (1=low, 2=medium, 3=high, 4=urgent)")

class IssueUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=255, description="Updated issue title")
    description: Optional[str] = Field(None, min_length=10, description="Updated description")
    location: Optional[str] = Field(None, min_length=3, max_length=255, description="Updated location")
    category: Optional[str] = Field(None, min_length=2, max_length=100, description="Updated category")
    priority: Optional[int] = Field(None, ge=1, le=4, description="Updated priority level")
    status: Optional[int] = Field(None, ge=0, le=3, description="Updated status (0=open, 1=in_progress, 2=resolved, 3=closed)")

# User info for issue responses
class IssueUserResponse(BaseModel):
    id: UUID4
    name: str
    email: str
    district: Optional[str]
    
    class Config:
        from_attributes = True

# Authority info for issue responses
class IssueAuthorityResponse(BaseModel):
    id: UUID4
    name: str
    district: str
    contact_email: str
    contact_phone: Optional[str]
    category: str
    
    class Config:
        from_attributes = True

# Issue response schemas
class IssueResponse(BaseModel):
    id: UUID4
    user_id: UUID4
    authority_id: UUID4
    title: str
    description: str
    status: int
    location: str
    created_at: datetime
    updated_at: datetime
    priority: int
    category: str
    
    # Related data
    user: IssueUserResponse
    authority: IssueAuthorityResponse
    votes: List[VoteResponse] = []
    vote_count: int = Field(..., description="Total number of votes")
    
    class Config:
        from_attributes = True

class IssueCreateResponse(BaseModel):
    message: str
    issue: IssueResponse
    
    class Config:
        from_attributes = True

# List response with pagination
class IssueListResponse(BaseModel):
    issues: List[IssueResponse]
    total: int
    page: int
    limit: int
    total_pages: int
    
    class Config:
        from_attributes = True
