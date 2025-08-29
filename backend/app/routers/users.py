from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, asc
from typing import Optional, List
from uuid import UUID
from datetime import datetime
import math

from app.database import get_db
from app.models import User, Issue
from app.auth import get_current_user
from app.routers.issues import create_issue_response
from app.schemas.user_schemas import (
    UserResponse,
    UserUpdateRequest,
    UserListResponse,
    UserQueryParams
)
from app.schemas.issue_schemas import IssueResponse

router = APIRouter(
    prefix="/user",
    tags=["users"]
)

def create_user_response(user: User) -> UserResponse:
    """Helper function to create UserResponse from User model"""
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone or "",
        district=user.district or "",
        role=user.role,
        is_google=user.is_google,
        google_id=user.google_id,
        created_at=user.created_at
    )

def check_admin_permission(current_user: User):
    """Check if current user is admin (role=2)"""
    if current_user.role != 2:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get logged-in user profile"""
    return create_user_response(current_user)

@router.delete("/me", status_code=204)
def delete_current_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete logged-in user account"""
    db.delete(current_user)
    db.commit()
    return

@router.patch("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update logged-in user profile"""
    
    # Update only provided fields, exclude role for self-updates
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Remove role if present (users cannot update their own role)
    if 'role' in update_data:
        update_data.pop('role')
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return create_user_response(current_user)

@router.get("/all", response_model=UserListResponse)
def get_all_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    role: Optional[int] = Query(None, ge=0, le=2, description="Filter by user role"),
    district: Optional[str] = Query(None, description="Filter by district"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    created_after: Optional[datetime] = Query(None, description="Filter users created after this date"),
    created_before: Optional[datetime] = Query(None, description="Filter users created before this date"),
    limit: int = Query(10, ge=1, le=100, description="Number of results per page"),
    page: int = Query(1, ge=1, description="Page number"),
    sort_by: str = Query("created_at", description="Sort by field"),
    sort_order: str = Query("desc", description="Sort order (asc, desc)")
):
    """Get all users with filtering and pagination (admin only)"""
    check_admin_permission(current_user)
    
    # Build query
    query = db.query(User)
    
    # Apply filters
    if role is not None:
        query = query.filter(User.role == role)
    
    if district:
        query = query.filter(User.district.ilike(f"%{district}%"))
    
    if search:
        search_filter = or_(
            User.name.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if created_after:
        query = query.filter(User.created_at >= created_after)
    
    if created_before:
        query = query.filter(User.created_at <= created_before)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply sorting
    sort_column = getattr(User, sort_by, User.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))
    
    # Apply pagination
    offset = (page - 1) * limit
    users = query.offset(offset).limit(limit).all()
    
    # Calculate total pages
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    # Convert to response models
    user_responses = [create_user_response(user) for user in users]
    
    return UserListResponse(
        users=user_responses,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    """Get user information by UUID"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return create_user_response(user)

@router.delete("/{user_id}", status_code=204)
def delete_user_by_id(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user by UUID (admin only)"""
    check_admin_permission(current_user)
    
    # Prevent admin from deleting themselves
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    return

@router.patch("/{user_id}", response_model=UserResponse)
def update_user_by_id(
    user_id: UUID,
    user_update: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user by UUID (admin only)"""
    check_admin_permission(current_user)
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update provided fields
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return create_user_response(user)

@router.get("/issues/{user_id}", response_model=List[IssueResponse])
def get_user_issues(
    user_id: UUID = Path(..., description="The UUID of the user"),
    db: Session = Depends(get_db)
):
    """
    Get all issues posted by a specific user.
    Returns a list of issues with complete details including user, authority, votes, and media.
    """
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    # Get all issues by this user with related data
    issues = db.query(Issue).options(
        joinedload(Issue.user),
        joinedload(Issue.authority),
        joinedload(Issue.votes),
        joinedload(Issue.media)
    ).filter(Issue.user_id == user_id).order_by(desc(Issue.created_at)).all()
    
    return [create_issue_response(issue) for issue in issues]
