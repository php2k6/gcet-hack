from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# Stats request schemas
class StatsQueryParams(BaseModel):
    """Query parameters for stats filtering"""
    authority_id: Optional[UUID] = Field(None, description="Filter by specific authority")
    status: Optional[int] = Field(None, ge=0, le=3, description="Filter by issue status")
    category: Optional[str] = Field(None, description="Filter by issue category")
    district: Optional[str] = Field(None, description="Filter by district")

# Status distribution schema
class StatusDistribution(BaseModel):
    """Issue status distribution"""
    open: int = Field(0, description="Number of open issues (status 0)")
    in_progress: int = Field(0, description="Number of in-progress issues (status 1)")
    resolved: int = Field(0, description="Number of resolved issues (status 2)")
    closed: int = Field(0, description="Number of closed issues (status 3)")
    
    class Config:
        from_attributes = True

# Stats response schema
class IssueStatsResponse(BaseModel):
    """Issue statistics response"""
    total_issues: int = Field(..., description="Total number of issues")
    status_distribution: StatusDistribution = Field(..., description="Distribution by status")
    last_24h_issues: int = Field(..., description="Issues created in last 24 hours")
    authority_specific: bool = Field(False, description="Whether stats are for specific authority")
    authority_name: Optional[str] = Field(None, description="Authority name if filtered")
    
    class Config:
        from_attributes = True

# Leaderboard user schema
class LeaderboardCitizenResponse(BaseModel):
    """Citizen leaderboard entry"""
    id: UUID
    name: str
    email: str
    district: Optional[str]
    total_issues: int = Field(..., description="Total issues reported by this citizen")
    resolved_issues: int = Field(..., description="Number of resolved issues")
    pending_issues: int = Field(..., description="Number of pending issues")
    success_rate: float = Field(..., description="Percentage of resolved issues")
    last_issue_date: Optional[datetime] = Field(None, description="Date of last issue reported")
    
    class Config:
        from_attributes = True

# Leaderboard authority schema
class LeaderboardAuthorityResponse(BaseModel):
    """Authority leaderboard entry"""
    id: UUID
    name: str
    district: str
    category: str
    contact_email: str
    total_issues: int = Field(..., description="Total issues assigned to this authority")
    resolved_issues: int = Field(..., description="Number of issues resolved")
    pending_issues: int = Field(..., description="Number of pending issues")
    success_rate: float = Field(..., description="Percentage of resolved issues")
    avg_resolution_time: Optional[float] = Field(None, description="Average resolution time in days")
    last_activity_date: Optional[datetime] = Field(None, description="Date of last issue activity")
    
    class Config:
        from_attributes = True

# Response wrappers
class CitizenLeaderboardResponse(BaseModel):
    """Response for citizen leaderboard"""
    citizens: List[LeaderboardCitizenResponse]
    total_count: int
    
    class Config:
        from_attributes = True

class AuthorityLeaderboardResponse(BaseModel):
    """Response for authority leaderboard"""
    authorities: List[LeaderboardAuthorityResponse]
    total_count: int
    
    class Config:
        from_attributes = True
