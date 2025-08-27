from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc, or_, and_, func
from typing import Optional, List
from datetime import datetime
import math
from uuid import UUID

from app.database import get_db
from app.models import Issue, User, Authority, Vote
from app.schemas.issue_schemas import (
    IssueCreateRequest, 
    IssueUpdateRequest, 
    IssueResponse, 
    IssueCreateResponse,
    IssueListResponse,
    IssueUserResponse,
    IssueAuthorityResponse,
    VoteResponse
)
from app.auth import get_current_user

router = APIRouter(prefix="/issues", tags=["Issues"])

def create_issue_response(issue: Issue) -> IssueResponse:
    """Helper function to create IssueResponse with vote count"""
    vote_count = len(issue.votes) if issue.votes else 0
    
    # Create user response
    user_response = IssueUserResponse(
        id=issue.user.id,
        name=issue.user.name,
        email=issue.user.email,
        district=issue.user.district
    )
    
    # Create authority response
    authority_response = IssueAuthorityResponse(
        id=issue.authority.id,
        name=issue.authority.name,
        district=issue.authority.district,
        contact_email=issue.authority.contact_email,
        contact_phone=issue.authority.contact_phone,
        category=issue.authority.category
    )
    
    # Create vote responses
    vote_responses = [
        VoteResponse(
            id=vote.id,
            user_id=vote.user_id,
            issue_id=vote.issue_id
        ) for vote in issue.votes
    ] if issue.votes else []
    
    return IssueResponse(
        id=issue.id,
        user_id=issue.user_id,
        authority_id=issue.authority_id,
        title=issue.title,
        description=issue.description,
        status=issue.status,
        location=issue.location,
        created_at=issue.created_at,
        updated_at=issue.updated_at,
        priority=issue.priority,
        category=issue.category,
        user=user_response,
        authority=authority_response,
        votes=vote_responses,
        vote_count=vote_count
    )

def check_issue_edit_permission(current_user: User, issue: Issue):
    """Check if user has permission to edit/delete issue"""
    # Admin can edit any issue
    if current_user.role == 2:
        return True
    
    # Authority users can edit issues in their authority
    if current_user.role == 1:
        # Find authority for this user
        from sqlalchemy.orm import object_session
        session = object_session(current_user)
        authority = session.query(Authority).filter(Authority.user_id == current_user.id).first()
        if authority and authority.id == issue.authority_id:
            return True
    
    # Issue creator can edit their own issue
    if current_user.id == issue.user_id:
        return True
    
    return False

@router.post("/", response_model=IssueCreateResponse, status_code=201)
def create_issue(
    issue_data: IssueCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new issue"""
    
    # Verify authority exists
    authority = db.query(Authority).filter(Authority.id == issue_data.authority_id).first()
    if not authority:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authority not found"
        )
    
    # Create new issue
    new_issue = Issue(
        user_id=current_user.id,
        authority_id=issue_data.authority_id,
        title=issue_data.title,
        description=issue_data.description,
        location=issue_data.location,
        category=issue_data.category,
        priority=issue_data.priority or 1,
        status=0  # Default to open
    )
    
    db.add(new_issue)
    db.commit()
    db.refresh(new_issue)
    
    # Load relationships for response
    issue_with_relations = db.query(Issue).options(
        joinedload(Issue.user),
        joinedload(Issue.authority),
        joinedload(Issue.votes)
    ).filter(Issue.id == new_issue.id).first()
    
    return IssueCreateResponse(
        message="Issue created successfully",
        issue=create_issue_response(issue_with_relations)
    )

@router.get("/", response_model=IssueListResponse)
def get_all_issues(
    db: Session = Depends(get_db),
    district: Optional[str] = Query(None, description="Filter by district"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[int] = Query(None, ge=0, le=3, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by title or description"),
    created_after: Optional[datetime] = Query(None, description="Filter issues created after this date"),
    created_before: Optional[datetime] = Query(None, description="Filter issues created before this date"),
    limit: int = Query(10, ge=1, le=100, description="Number of results per page"),
    page: int = Query(1, ge=1, description="Page number"),
    sort_by: str = Query("created_at", description="Sort by field"),
    sort_order: str = Query("desc", description="Sort order (asc, desc)")
):
    """Get all issues with filtering and pagination"""
    
    # Build query with relationships
    query = db.query(Issue).options(
        joinedload(Issue.user),
        joinedload(Issue.authority),
        joinedload(Issue.votes)
    )
    
    # Apply filters
    if district:
        query = query.join(Authority).filter(Authority.district.ilike(f"%{district}%"))
    
    if category:
        query = query.filter(Issue.category.ilike(f"%{category}%"))
    
    if status is not None:
        query = query.filter(Issue.status == status)
    
    if search:
        search_filter = or_(
            Issue.title.ilike(f"%{search}%"),
            Issue.description.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if created_after:
        query = query.filter(Issue.created_at >= created_after)
    
    if created_before:
        query = query.filter(Issue.created_at <= created_before)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply sorting
    sort_column = getattr(Issue, sort_by, Issue.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))
    
    # Apply pagination
    offset = (page - 1) * limit
    issues = query.offset(offset).limit(limit).all()
    
    # Calculate total pages
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    # Convert to response models
    issue_responses = [create_issue_response(issue) for issue in issues]
    
    return IssueListResponse(
        issues=issue_responses,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/{issue_id}", response_model=IssueResponse)
def get_issue_by_id(
    issue_id: UUID,
    db: Session = Depends(get_db)
):
    """Get issue details by UUID"""
    issue = db.query(Issue).options(
        joinedload(Issue.user),
        joinedload(Issue.authority),
        joinedload(Issue.votes)
    ).filter(Issue.id == issue_id).first()
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    return create_issue_response(issue)

@router.patch("/{issue_id}", response_model=IssueResponse)
def update_issue(
    issue_id: UUID,
    issue_update: IssueUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update issue by UUID (admin, authority, or issue creator only)"""
    
    issue = db.query(Issue).options(
        joinedload(Issue.user),
        joinedload(Issue.authority),
        joinedload(Issue.votes)
    ).filter(Issue.id == issue_id).first()
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    # Check permissions
    if not check_issue_edit_permission(current_user, issue):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this issue"
        )
    
    # Update fields if provided
    update_data = issue_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(issue, field, value)
    
    # Update the updated_at timestamp
    issue.updated_at = datetime.now()
    
    db.commit()
    db.refresh(issue)
    
    return create_issue_response(issue)

@router.delete("/{issue_id}", status_code=204)
def delete_issue(
    issue_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete issue by UUID (admin or issue creator only)"""
    
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    # Check permissions (only admin or issue creator can delete)
    if current_user.role != 2 and current_user.id != issue.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this issue"
        )
    
    db.delete(issue)
    db.commit()
    
    return
