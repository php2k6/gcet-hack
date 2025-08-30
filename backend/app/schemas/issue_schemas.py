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

# Media schemas
class MediaResponse(BaseModel):
    id: UUID4
    issue_id: UUID4
    path: str  # Azure Blob URL or local path
    blob_name: Optional[str] = Field(None, description="Azure blob name for management")
    filename: Optional[str] = Field(None, description="Original filename")
    file_size: Optional[int] = Field(None, description="File size in bytes")
    file_type: Optional[str] = Field(None, description="MIME type")
    storage_type: Optional[str] = Field("azure_blob", description="Storage type: local or azure_blob")
    created_at: Optional[datetime] = Field(None, description="Upload timestamp")
    
    class Config:
        from_attributes = True

# Issue request schemas
class IssueCreateRequest(BaseModel):
    #authority_id: UUID4 = Field(..., description="Authority responsible for this issue")
    title: str = Field(..., min_length=5, max_length=255, description="Issue title")
    description: str = Field(..., min_length=10, description="Detailed description of the issue")
    location: str = Field(..., min_length=3, max_length=255, description="Location where issue occurred (format: 'latitude,longitude')")
    district: str = Field(..., min_length=2, max_length=100, description="District where issue occurred")
    radius: Optional[int] = Field(500, ge=50, le=5000, description="Radius in meters for duplicate detection (default: 500m)")
    #category: str = Field(..., min_length=2, max_length=100, description="Issue category")
    #priority: Optional[int] = Field(1, ge=1, le=4, description="Priority level (1=low, 2=medium, 3=high, 4=urgent)")

# Enhanced Issue model for internal operations (includes district field)
class IssueCreateData(BaseModel):
    """Extended Issue model with additional district field for internal operations.
    This bridges the gap between API requests and database operations."""
    user_id: UUID4
    authority_id: UUID4  # Authority ID resolved from category and district
    title: str
    description: str
    location: str  # Format: "latitude,longitude"
    radius: int = 500  # Radius in meters for duplicate detection
    district: str  # Additional field used for authority lookup (not stored in DB)
    category: str  # AI-detected category
    priority: int  # AI-detected priority
    status: int = 0  # Default status (open)
    
    class Config:
        from_attributes = True
    
    def to_issue_dict(self) -> dict:
        """Convert to dictionary for Issue model creation (excludes district)"""
        return {
            "user_id": self.user_id,
            "authority_id": self.authority_id, 
            "title": self.title,
            "description": self.description,
            "location": self.location,
            "radius": self.radius,
            "category": self.category,
            "priority": self.priority,
            "status": self.status
        }

class IssueUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=255, description="Updated issue title")
    description: Optional[str] = Field(None, min_length=10, description="Updated description")
    location: Optional[str] = Field(None, min_length=3, max_length=255, description="Updated location (format: 'latitude,longitude')")
    radius: Optional[int] = Field(None, ge=50, le=5000, description="Updated radius in meters for duplicate detection")
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
    radius: int = Field(500, description="Radius in meters for duplicate detection")
    created_at: datetime
    updated_at: datetime
    priority: int
    category: str
    
    # Related data
    user: IssueUserResponse
    authority: IssueAuthorityResponse
    votes: List[VoteResponse] = []
    media: List[MediaResponse] = []
    vote_count: int = Field(..., description="Total number of votes")
    
    class Config:
        from_attributes = True

class IssueCreateResponse(BaseModel):
    message: str
    issue: IssueResponse
    
    class Config:
        from_attributes = True

class IssueDuplicateResponse(BaseModel):
    message: str
    existing_issue: IssueResponse
    auto_upvoted: bool = Field(..., description="Whether the user's vote was automatically added")
    distance_meters: float = Field(..., description="Distance from the new location to existing issue")
    
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

# Heatmap schemas
class HeatmapIssueResponse(BaseModel):
    title: str
    location: str
    priority: int
    status: int
    category: str
    radius: int = Field(500, description="Radius in meters for duplicate detection")
    
    class Config:
        from_attributes = True
