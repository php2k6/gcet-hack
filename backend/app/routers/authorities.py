from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from uuid import UUID
from passlib.context import CryptContext

from app.database import get_db
from app.models import Authority, User
from app.schemas.authority_schemas import (
    AuthorityCreateRequest,
    AuthorityUpdateRequest, 
    AuthorityResponse,
    AuthorityUserResponse
)
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
