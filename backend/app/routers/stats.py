from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import Optional, List
from datetime import datetime, timedelta
import uuid

from app.database import get_db
from app.models import User, Issue, Authority, Vote
from app.auth import get_current_user
from app.schemas.stats_schemas import (
    IssueStatsResponse,
    StatusDistribution,
    CitizenLeaderboardResponse,
    AuthorityLeaderboardResponse,
    LeaderboardCitizenResponse,
    LeaderboardAuthorityResponse
)

router = APIRouter(
    tags=["statistics"]
)

def check_admin_or_authority_access(current_user: User, authority_id: Optional[uuid.UUID] = None):
    """Check if user has permission to access stats"""
    # Admin can access all stats
    if current_user.role == 2:
        return True, None
    
    # Authority users can only access their own authority's stats
    if current_user.role == 1:
        if authority_id is None:
            # Authority users must specify authority_id
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Authority users must specify authority_id parameter"
            )
        
        # Check if the authority belongs to the current user
        return True, authority_id
    
    # Citizens cannot access stats
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied. Only admins and authorities can view statistics."
    )

@router.get("/stats/issues", response_model=IssueStatsResponse)
def get_issue_statistics(
    authority_id: Optional[uuid.UUID] = Query(None, description="Filter by specific authority"),
    status_filter: Optional[int] = Query(None, ge=0, le=3, description="Filter by issue status"),
    category: Optional[str] = Query(None, description="Filter by issue category"),
    district: Optional[str] = Query(None, description="Filter by district"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get issue statistics. 
    - Admins can see server-wide stats or filter by authority
    - Authority users can only see their own authority's stats
    """
    
    # Check permissions
    has_access, forced_authority_id = check_admin_or_authority_access(current_user, authority_id)
    
    # If user is authority, override authority_id with their authority
    if current_user.role == 1 and forced_authority_id:
        # Find the authority associated with this user
        user_authority = db.query(Authority).filter(Authority.user_id == current_user.id).first()
        if not user_authority:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No authority found for current user"
            )
        authority_id = user_authority.id
    
    # Build query filters
    query = db.query(Issue)
    
    # Apply filters
    if authority_id:
        query = query.filter(Issue.authority_id == authority_id)
    
    if status_filter is not None:
        query = query.filter(Issue.status == status_filter)
    
    if category:
        query = query.filter(Issue.category.ilike(f"%{category}%"))
    
    if district:
        query = query.join(Authority).filter(Authority.district.ilike(f"%{district}%"))
    
    # Get total issues count
    total_issues = query.count()
    
    # Get status distribution
    status_counts = (
        query.with_entities(Issue.status, func.count(Issue.id))
        .group_by(Issue.status)
        .all()
    )
    
    # Initialize status distribution
    status_dist = StatusDistribution()
    status_mapping = {
        0: 'open',
        1: 'in_progress', 
        2: 'resolved',
        3: 'closed'
    }
    
    for status_val, count in status_counts:
        if status_val in status_mapping:
            setattr(status_dist, status_mapping[status_val], count)
    
    # Get last 24 hours issues
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
    last_24h_query = query.filter(Issue.created_at >= twenty_four_hours_ago)
    last_24h_issues = last_24h_query.count()
    
    # Get authority name if filtering by specific authority
    authority_name = None
    if authority_id:
        authority = db.query(Authority).filter(Authority.id == authority_id).first()
        authority_name = authority.name if authority else None
    
    return IssueStatsResponse(
        total_issues=total_issues,
        status_distribution=status_dist,
        last_24h_issues=last_24h_issues,
        authority_specific=authority_id is not None,
        authority_name=authority_name
    )

@router.get("/leaderboards/citizen", response_model=CitizenLeaderboardResponse)
def get_citizen_leaderboard(
    limit: int = Query(10, ge=1, le=100, description="Number of citizens to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get citizen leaderboard based on number of issues reported.
    Available to all authenticated users.
    """
    
    try:
        # Query to get citizen statistics
        citizen_stats = (
            db.query(
                User.id,
                User.name,
                User.email,
                User.district,
                func.count(Issue.id).label('total_issues'),
                func.sum(func.case([(Issue.status == 2, 1)], else_=0)).label('resolved_issues'),
                func.sum(func.case([(Issue.status.in_([0, 1]), 1)], else_=0)).label('pending_issues'),
                func.max(Issue.created_at).label('last_issue_date')
            )
            .outerjoin(Issue, User.id == Issue.user_id)  # Use outer join to include users with no issues
            .filter(User.role == 0)  # Only citizens
            .group_by(User.id, User.name, User.email, User.district)
            .having(func.count(Issue.id) > 0)  # Only users with at least one issue
            .order_by(func.count(Issue.id).desc())
            .limit(limit)
            .all()
        )
        
        # Convert to response format
        leaderboard_citizens = []
        for stats in citizen_stats:
            total = int(stats.total_issues) if stats.total_issues else 0
            resolved = int(stats.resolved_issues) if stats.resolved_issues else 0
            pending = int(stats.pending_issues) if stats.pending_issues else 0
            success_rate = (resolved / total * 100) if total > 0 else 0.0
            
            citizen = LeaderboardCitizenResponse(
                id=stats.id,
                name=stats.name,
                email=stats.email,
                district=stats.district,
                total_issues=total,
                resolved_issues=resolved,
                pending_issues=pending,
                success_rate=round(success_rate, 2),
                last_issue_date=stats.last_issue_date
            )
            leaderboard_citizens.append(citizen)
        
        return CitizenLeaderboardResponse(
            citizens=leaderboard_citizens,
            total_count=len(leaderboard_citizens)
        )
        
    except Exception as e:
        print(f"❌ Citizen leaderboard error: {str(e)}")
        # Return empty leaderboard on error
        return CitizenLeaderboardResponse(
            citizens=[],
            total_count=0
        )

@router.get("/leaderboards/authority", response_model=AuthorityLeaderboardResponse)
def get_authority_leaderboard(
    limit: int = Query(10, ge=1, le=100, description="Number of authorities to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get authority leaderboard based on number of issues handled and resolution rate.
    Available to all authenticated users.
    """
    
    try:
        # Query to get authority statistics
        authority_stats = (
            db.query(
                Authority.id,
                Authority.name,
                Authority.district,
                Authority.category,
                Authority.contact_email,
                func.count(Issue.id).label('total_issues'),
                func.sum(func.case([(Issue.status == 2, 1)], else_=0)).label('resolved_issues'),
                func.sum(func.case([(Issue.status.in_([0, 1]), 1)], else_=0)).label('pending_issues'),
                func.avg(
                    func.case([
                        (Issue.status == 2, 
                         func.extract('epoch', Issue.updated_at - Issue.created_at) / 86400)
                    ])
                ).label('avg_resolution_days'),
                func.max(Issue.updated_at).label('last_activity_date')
            )
            .outerjoin(Issue, Authority.id == Issue.authority_id)  # Use outer join
            .group_by(Authority.id, Authority.name, Authority.district, Authority.category, Authority.contact_email)
            .having(func.count(Issue.id) > 0)  # Only authorities with at least one issue
            .order_by(func.count(Issue.id).desc())
            .limit(limit)
            .all()
        )
        
        # Convert to response format
        leaderboard_authorities = []
        for stats in authority_stats:
            total = int(stats.total_issues) if stats.total_issues else 0
            resolved = int(stats.resolved_issues) if stats.resolved_issues else 0
            pending = int(stats.pending_issues) if stats.pending_issues else 0
            success_rate = (resolved / total * 100) if total > 0 else 0.0
            
            authority = LeaderboardAuthorityResponse(
                id=stats.id,
                name=stats.name,
                district=stats.district,
                category=stats.category,
                contact_email=stats.contact_email,
                total_issues=total,
                resolved_issues=resolved,
                pending_issues=pending,
                success_rate=round(success_rate, 2),
                avg_resolution_time=round(float(stats.avg_resolution_days), 2) if stats.avg_resolution_days else None,
                last_activity_date=stats.last_activity_date
            )
            leaderboard_authorities.append(authority)
        
        return AuthorityLeaderboardResponse(
            authorities=leaderboard_authorities,
            total_count=len(leaderboard_authorities)
        )
        
    except Exception as e:
        print(f"❌ Authority leaderboard error: {str(e)}")
        # Return empty leaderboard on error
        return AuthorityLeaderboardResponse(
            authorities=[],
            total_count=0
        )
