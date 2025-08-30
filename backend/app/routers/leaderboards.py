from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import Issue, Authority
from app.auth import get_current_user
from app.schemas.stats_schemas import LeaderboardAuthorityResponse, AuthorityLeaderboardResponse

router = APIRouter(
    prefix="/leaderboards",
    tags=["leaderboards"]
)

@router.get("/authority", response_model=AuthorityLeaderboardResponse)
def get_authority_leaderboard(
    limit: int = Query(10, ge=1, le=100, description="Number of top authorities to return"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)  # Require authentication
):
    """
    Get authority leaderboard based on number of resolved issues (status == 3).
    Returns top authorities who have resolved the most issues.
    
    Example response:
    - Anand Municipal Corporation: 10 resolved issues
    - Surat Municipal Corporation: 8 resolved issues
    - etc.
    """
    
    try:
        # Query to get authorities with their resolved issue counts
        authority_stats = (
            db.query(
                Authority.id,
                Authority.name,
                Authority.district,
                Authority.category,
                Authority.contact_email,
                func.count(Issue.id).label('resolved_issues')
            )
            .join(Issue, Authority.id == Issue.authority_id)  # Inner join - only authorities with issues
            .filter(Issue.status == 3)  # Only resolved issues (status == 3)
            .group_by(Authority.id, Authority.name, Authority.district, Authority.category, Authority.contact_email)
            .having(func.count(Issue.id) > 0)  # Ensure at least 1 resolved issue
            .order_by(func.count(Issue.id).desc())  # Order by resolved count (highest first)
            .limit(limit)
            .all()
        )
        
        # Convert to response format
        leaderboard_authorities = []
        for stats in authority_stats:
            resolved_count = int(stats.resolved_issues)
            
            authority = LeaderboardAuthorityResponse(
                id=stats.id,
                name=stats.name,
                district=stats.district,
                category=stats.category,
                contact_email=stats.contact_email,
                total_issues=resolved_count,  # For leaderboard, we focus on resolved issues
                resolved_issues=resolved_count,
                pending_issues=0,  # Not relevant for this leaderboard
                success_rate=100.0,  # 100% since we only count resolved issues
                avg_resolution_time=None,  # Not calculated in this simple version
                last_activity_date=None   # Not calculated in this simple version
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
