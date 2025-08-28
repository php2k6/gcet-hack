from pydantic import BaseModel, Field, UUID4
from typing import Optional
from datetime import datetime

# Vote request schemas
class VoteCreateRequest(BaseModel):
    """Request to vote on an issue"""
    pass  # No additional fields needed, user_id comes from auth, issue_id from URL

# Vote response schemas
class VoteResponse(BaseModel):
    """Vote response with basic vote information"""
    id: UUID4
    user_id: UUID4
    issue_id: UUID4
    
    class Config:
        from_attributes = True

# User info for vote responses
class VoteUserResponse(BaseModel):
    """User information in vote responses"""
    id: UUID4
    name: str
    email: str
    district: Optional[str]
    
    class Config:
        from_attributes = True

# Detailed vote response with user info
class VoteDetailResponse(BaseModel):
    """Detailed vote response with user information"""
    id: UUID4
    user_id: UUID4
    issue_id: UUID4
    user: VoteUserResponse
    
    class Config:
        from_attributes = True

# Vote operation response
class VoteOperationResponse(BaseModel):
    """Response for vote operations returning the updated issue"""
    message: str
    vote: Optional[VoteResponse] = None
    total_votes: int
    user_has_voted: bool
