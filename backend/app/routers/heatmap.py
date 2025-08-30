from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Issue
from app.schemas.issue_schemas import HeatmapIssueResponse

router = APIRouter(prefix="/heatmap", tags=["Heatmap"])

@router.get("/", response_model=List[HeatmapIssueResponse])
def get_heatmap_issues(db: Session = Depends(get_db)):
    """
    Get all issues for heatmap display.
    Returns a list of issues with title, location, priority, status, category, and radius.
    """
    issues = db.query(Issue).all()
    
    return [
        HeatmapIssueResponse(
            title=issue.title,
            location=issue.location,
            priority=issue.priority,
            status=issue.status,
            category=issue.category,
            radius=issue.radius
        )
        for issue in issues
    ]