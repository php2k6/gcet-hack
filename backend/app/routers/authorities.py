from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, or_
from uuid import UUID
from passlib.context import CryptContext
from typing import Optional, List
from datetime import datetime
import math

from app.database import get_db
from app.models import Authority, User, Issue
from app.schemas.authority_schemas import (
    AuthorityCreateRequest,
    AuthorityUpdateRequest, 
    AuthorityResponse,
    AuthorityUserResponse
)
from app.schemas.issue_schemas import IssueResponse, IssueListResponse
from app.auth import get_current_user

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/authority", tags=["Authorities"])

def create_authority_response(authority: Authority) -> AuthorityResponse:
    """Helper function to create AuthorityResponse"""
    
    # Create user response
    user_response = AuthorityUserResponse(
        id=authority.user.id,
        name=authority.user.name,
        email=authority.user.email,
        role=authority.user.role
    )
    
    return AuthorityResponse(
        id=authority.id,
        name=authority.name,
        district=authority.district,
        contact_email=authority.contact_email,
        contact_phone=authority.contact_phone,
        category=authority.category,
        user_id=authority.user_id,
        user=user_response
    )

def check_authority_access_permission(current_user: User, authority: Authority):
    """Check if user has permission to access authority details"""
    # Admin can access any authority
    if current_user.role == 2:
        return True
    
    # Authority users can access their own authority
    if current_user.role == 1 and current_user.id == authority.user_id:
        return True
    
    return False

def check_authority_edit_permission(current_user: User, authority: Authority):
    """Check if user has permission to edit authority"""
    # Admin can edit any authority
    if current_user.role == 2:
        return True
    
    # Authority users can edit their own authority
    if current_user.role == 1 and current_user.id == authority.user_id:
        return True
    
    return False

@router.get("/{authority_id}", response_model=AuthorityResponse)
def get_authority_by_id(
    authority_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get authority details by UUID (requires authentication)"""
    
    authority = db.query(Authority).options(
        joinedload(Authority.user)
    ).filter(Authority.id == authority_id).first()
    
    if not authority:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authority not found"
        )
    
    # Check permissions
    if not check_authority_access_permission(current_user, authority):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this authority"
        )
    
    return create_authority_response(authority)

@router.patch("/{authority_id}", response_model=AuthorityResponse)
def update_authority(
    authority_id: UUID,
    authority_update: AuthorityUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update authority by UUID (admin or authority user only)"""
    
    authority = db.query(Authority).options(
        joinedload(Authority.user)
    ).filter(Authority.id == authority_id).first()
    
    if not authority:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authority not found"
        )
    
    # Check permissions
    if not check_authority_edit_permission(current_user, authority):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this authority"
        )
    
    # Update fields if provided
    update_data = authority_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(authority, field, value)
    
    db.commit()
    db.refresh(authority)
    
    return create_authority_response(authority)

@router.delete("/{authority_id}", status_code=204)
def delete_authority(
    authority_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete authority by UUID (admin only)"""
    
    # Only admin can delete authorities
    if current_user.role != 2:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete authorities"
        )
    
    authority = db.query(Authority).filter(Authority.id == authority_id).first()
    
    if not authority:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authority not found"
        )
    
    # Check if authority has associated issues
    from app.models import Issue
    issue_count = db.query(Issue).filter(Issue.authority_id == authority_id).count()
    
    if issue_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete authority with {issue_count} associated issues. Please reassign or delete issues first."
        )
    
    # Delete the authority
    db.delete(authority)
    db.commit()
    
    return

@router.post("/create-authority", response_model=AuthorityResponse, status_code=status.HTTP_201_CREATED)
def create_authority(
    authority_data: AuthorityCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # This validates the token and gets user
):
    """
    Create a new authority user and authority record.
    Creates both user account and authority in one request.
    Only admins can create authorities.
    """
    # 🔒 ADMIN VALIDATION: Check if current user is admin (role = 2)
    if current_user.role != 2:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create authorities"
        )
    
    # Check if user email already exists
    existing_user = db.query(User).filter(User.email == authority_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
        # Create user account
        hashed_password = pwd_context.hash(authority_data.password)
        
        new_user = User(
            name=authority_data.user_name,
            email=authority_data.email,
            password=hashed_password,
            role=1,  # Authority role
            phone=authority_data.contact_phone,
            is_google=False,
            district=authority_data.district
        )
        
        db.add(new_user)
        db.flush()  # Flush to get the user ID
        
        # Create authority record (using same email)
        new_authority = Authority(
            name=authority_data.authority_name,
            district=authority_data.district,
            contact_email=authority_data.email,  # ✅ Same email as user
            contact_phone=authority_data.contact_phone,
            category=authority_data.category,
            user_id=new_user.id
        )
        
        db.add(new_authority)
        db.commit()
        
        # Refresh to get all data with relationships
        db.refresh(new_authority)
        
        return create_authority_response(new_authority)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create authority: {str(e)}"
        )

@router.get("/{authority_id}/issues", response_model=IssueListResponse)
def get_authority_issues(
    authority_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    status: Optional[int] = Query(None, ge=0, le=3, description="Filter by status"),
    min_radius: Optional[int] = Query(None, ge=50, le=5000, description="Filter by minimum radius"),
    max_radius: Optional[int] = Query(None, ge=50, le=5000, description="Filter by maximum radius"),
    search: Optional[str] = Query(None, description="Search by title or description"),
    created_after: Optional[datetime] = Query(None, description="Filter issues created after this date"),
    created_before: Optional[datetime] = Query(None, description="Filter issues created before this date"),
    limit: int = Query(10, ge=1, le=100, description="Number of results per page"),
    page: int = Query(1, ge=1, description="Page number"),
    sort_by: str = Query("created_at", description="Sort by field"),
    sort_order: str = Query("desc", description="Sort order (asc, desc)")
):
    """
    Get all issues for a specific authority with filtering and pagination.
    Authority users can only access their own authority's issues.
    Admins can access any authority's issues.
    """
    
    # Check if authority exists
    authority = db.query(Authority).options(
        joinedload(Authority.user)
    ).filter(Authority.id == authority_id).first()
    
    if not authority:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authority not found"
        )
    
    # Check permissions
    if not check_authority_access_permission(current_user, authority):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this authority's issues"
        )
    
    # Import here to avoid circular import
    from app.routers.issues import create_issue_response
    
    # Build query with relationships
    query = db.query(Issue).options(
        joinedload(Issue.user),
        joinedload(Issue.authority),
        joinedload(Issue.votes),
        joinedload(Issue.media)
    ).filter(Issue.authority_id == authority_id)
    
    # Apply filters
    if status is not None:
        query = query.filter(Issue.status == status)
    
    if min_radius:
        query = query.filter(Issue.radius >= min_radius)
    
    if max_radius:
        query = query.filter(Issue.radius <= max_radius)
    
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
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())
    
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
