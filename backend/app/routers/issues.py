from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc, or_, and_, func
from typing import Optional, List
from datetime import datetime
import math
import os
import pathlib
import uuid as uuid_lib
from uuid import UUID

from app.database import get_db
from app.models import Issue, User, Authority, Vote, Media
from app.schemas.issue_schemas import (
    IssueCreateRequest, 
    IssueUpdateRequest, 
    IssueResponse, 
    IssueCreateResponse,
    IssueListResponse,
    IssueUserResponse,
    IssueAuthorityResponse,
    VoteResponse,
    MediaResponse
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
    
    # Create media responses
    media_responses = [
        MediaResponse(
            id=media.id,
            issue_id=media.issue_id,
            path=media.path,
            filename=media.filename,
            file_size=media.file_size,
            file_type=media.file_type,
            created_at=media.created_at
        ) for media in issue.media
    ] if issue.media else []
    
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
        media=media_responses,
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
        joinedload(Issue.votes),
        joinedload(Issue.media)
    ).filter(Issue.id == new_issue.id).first()
    
    return IssueCreateResponse(
        message="Issue created successfully",
        issue=create_issue_response(issue_with_relations)
    )

# File upload configuration
UPLOAD_DIRECTORY = "uploads"
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.pdf'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_file(file: UploadFile) -> bool:
    """Validate uploaded file"""
    # Check file extension
    file_extension = pathlib.Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        return False
    
    # Check file size (this is approximate, actual size checked during read)
    if file.size and file.size > MAX_FILE_SIZE:
        return False
    
    return True

def save_uploaded_file(file: UploadFile, issue_id: UUID) -> tuple[str, str, int]:
    """Save uploaded file and return (file_path, original_filename, file_size)"""
    # Create directory structure: uploads/2025/08/issues/
    date_path = datetime.now().strftime("%Y/%m")
    upload_dir = pathlib.Path(UPLOAD_DIRECTORY) / date_path / "issues"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_extension = pathlib.Path(file.filename).suffix
    unique_filename = f"{uuid_lib.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Save file and get size
    with open(file_path, "wb") as buffer:
        content = file.file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")
        buffer.write(content)
        file_size = len(content)
    
    return str(file_path), file.filename, file_size

@router.post("/with-files/", response_model=IssueCreateResponse, status_code=201)
async def create_issue_with_files(
    title: str = Form(...),
    description: str = Form(...),
    authority_id: UUID = Form(...),
    location: str = Form(...),
    category: str = Form(...),
    priority: int = Form(1),
    files: List[UploadFile] = File(default=[]),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new issue with optional file attachments"""
    
    # Verify authority exists
    authority = db.query(Authority).filter(Authority.id == authority_id).first()
    if not authority:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authority not found"
        )
    
    # Validate files
    for file in files:
        if file.filename:  # Only validate if file is actually uploaded
            if not validate_file(file):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid file: {file.filename}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
                )
    
    # Create new issue
    new_issue = Issue(
        user_id=current_user.id,
        authority_id=authority_id,
        title=title,
        description=description,
        location=location,
        category=category,
        priority=priority,
        status=0  # Default to open
    )
    
    db.add(new_issue)
    db.commit()
    db.refresh(new_issue)
    
    # Handle file uploads
    uploaded_files = []
    for file in files:
        if file.filename:  # Only process if file is actually uploaded
            try:
                # Save file to disk
                file_path, original_filename, file_size = save_uploaded_file(file, new_issue.id)
                
                # Create Media record
                media_record = Media(
                    issue_id=new_issue.id,
                    path=file_path,
                    filename=original_filename,
                    file_size=file_size,
                    file_type=file.content_type
                )
                db.add(media_record)
                uploaded_files.append(original_filename)
                
            except Exception as e:
                # Clean up on error
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to upload file {file.filename}: {str(e)}"
                )
    
    db.commit()
    
    # Load relationships for response
    issue_with_relations = db.query(Issue).options(
        joinedload(Issue.user),
        joinedload(Issue.authority),
        joinedload(Issue.votes),
        joinedload(Issue.media)
    ).filter(Issue.id == new_issue.id).first()
    
    return IssueCreateResponse(
        message=f"Issue created successfully with {len(uploaded_files)} files",
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
        joinedload(Issue.votes),
        joinedload(Issue.media)
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
        joinedload(Issue.votes),
        joinedload(Issue.media)
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
        joinedload(Issue.votes),
        joinedload(Issue.media)
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

@router.post("/media/{issue_id}", status_code=201)
async def add_media_to_issue(
    issue_id: UUID,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add media files to an existing issue"""
    
    # Verify issue exists and user has permission
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    # Check if user can add media (issue creator, authority, or admin)
    if not check_issue_edit_permission(current_user, issue):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add media to this issue"
        )
    
    # Validate files
    for file in files:
        if not validate_file(file):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file: {file.filename}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
    
    # Save files and create Media records
    uploaded_files = []
    for file in files:
        try:
            # Save file to disk
            file_path, original_filename, file_size = save_uploaded_file(file, issue_id)
            
            # Create Media record
            media_record = Media(
                issue_id=issue_id,
                path=file_path,
                filename=original_filename,
                file_size=file_size,
                file_type=file.content_type
            )
            db.add(media_record)
            uploaded_files.append(original_filename)
            
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file {file.filename}: {str(e)}"
            )
    
    db.commit()
    
    return {
        "message": f"Added {len(uploaded_files)} media files to issue",
        "uploaded_files": uploaded_files
    }

@router.get("/media/{issue_id}", response_model=List[MediaResponse])
def get_issue_media(
    issue_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all media files for an issue"""
    
    # Verify issue exists
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    # Get all media for this issue
    media_files = db.query(Media).filter(Media.issue_id == issue_id).all()
    
    return [
        MediaResponse(
            id=media.id,
            issue_id=media.issue_id,
            path=media.path,
            filename=media.filename,
            file_size=media.file_size,
            file_type=media.file_type,
            created_at=media.created_at
        ) for media in media_files
    ]

@router.delete("/media/{media_id}", status_code=204)
def delete_media(
    media_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific media file"""
    
    # Find media record
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found"
        )
    
    # Get the issue to check permissions
    issue = db.query(Issue).filter(Issue.id == media.issue_id).first()
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated issue not found"
        )
    
    # Check permissions (same as editing issue)
    if not check_issue_edit_permission(current_user, issue):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this media"
        )
    
    # Delete file from disk
    try:
        if os.path.exists(media.path):
            os.remove(media.path)
    except Exception as e:
        # Log error but continue with database deletion
        print(f"Warning: Could not delete file {media.path}: {e}")
    
    # Delete from database
    db.delete(media)
    db.commit()
    
    return

@router.get("/serve/{media_id}")
async def get_media_file(
    media_id: UUID,
    db: Session = Depends(get_db)
):
    """Serve uploaded media file"""
    
    # Find media record
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media file not found"
        )
    
    # Check if file exists on disk
    if not os.path.exists(media.path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk"
        )
    
    # Return file
    return FileResponse(
        path=media.path,
        filename=pathlib.Path(media.path).name,
        media_type='application/octet-stream'
    )
