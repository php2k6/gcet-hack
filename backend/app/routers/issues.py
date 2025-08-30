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
from app.util import get_query_response
from app.database import get_db
from app.models import Issue, User, Authority, Vote, Media, Notification
from app.services.azure_storage import get_azure_storage_service
from app.schemas.issue_schemas import (
    IssueCreateRequest, 
    IssueCreateData,  # Added the new schema
    IssueUpdateRequest, 
    IssueResponse, 
    IssueCreateResponse,
    IssueDuplicateResponse,
    IssueListResponse,
    IssueUserResponse,
    IssueAuthorityResponse,
    VoteResponse,
    MediaResponse
)
from app.auth import get_current_user
from transformers import RobertaTokenizer, RobertaModel
import torch
import tensorflow as tf
import numpy as np


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
            blob_name=media.blob_name,
            filename=media.filename,
            file_size=media.file_size,
            file_type=media.file_type,
            storage_type=media.storage_type,
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
        radius=issue.radius,
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

# gets the authority by distrcit name and category 

def get_authority(category: str, district: str, db: Session) -> str: 
    
    try:
        authority = db.query(Authority).filter(
            Authority.category == category,
            Authority.district == district
        ).first()
        
        if not authority:
            raise Exception(f"No authority found for category '{category}' in district '{district}'")
        
        return str(authority.id)
    
    except Exception as e:
        raise Exception(f"Error getting authority ID: {str(e)}")
    
def get_priority_from_text(description : str):
    """Get the priority from issue description"""
    try:
        result = get_query_response(description, "system_prompt1.txt")
        
        # Parse the AI response to extract integer priority
        # Expected format: "Priority: X" or just "X" where X is 0, 1, or 2
        result_lower = result.lower().strip()
        
        # Extract number from various formats
        if "priority:" in result_lower:
            # Format: "Priority: 2"
            priority_part = result_lower.split("priority:")[-1].strip()
            priority_num = ''.join(filter(str.isdigit, priority_part))
        elif result_lower in ['0', '1', '2']:
            # Direct number
            priority_num = result_lower
        else:
            # Extract first digit found
            priority_num = ''.join(filter(str.isdigit, result))
        
        # Convert to integer and validate
        if priority_num:
            priority = int(priority_num)
            # Map AI priority (0=normal, 1=urgent, 2=severe) to our scale (1-4)
            if priority == 0:
                return 1  # Normal
            elif priority == 1:
                return 2  # Urgent  
            elif priority == 2:
                return 3  # Severe
            else:
                return 1  # Default to normal
        else:
            return 1  # Default to normal priority
            
    except Exception as e:
        print(f"Priority detection failed: {e}")
        return 1  # Default to normal priority

def get_category_from_text(description: str):
    """Get the category from issue description"""
    try:
        # Suppress warnings for cleaner output
        import warnings
        warnings.filterwarnings("ignore", category=UserWarning)
        
        # Initialize models with warning suppression
        tokenizer = RobertaTokenizer.from_pretrained("roberta-base")
        roberta = RobertaModel.from_pretrained("roberta-base")
        
        tokenized = tokenizer(description, 
                       return_tensors="pt", 
                       truncation=True, 
                       padding=True, 
                       max_length=128)
        
        # Extract the embeddings using RoBERTa
        with torch.no_grad():
            outputs = roberta(**tokenized)
            # Use the [CLS] token embedding (first token)
            embeddings = outputs.last_hidden_state[:, 0, :].numpy()
        
        # Load the TensorFlow model with proper path
        model_path = os.path.join(os.path.dirname(__file__), 'model_new.h5')
        if not os.path.exists(model_path):
            print(f"Model file not found at: {model_path}")
            return "Road Authority"  # Default fallback
            
        model = tf.keras.models.load_model(model_path)
        pred = model.predict(embeddings, verbose=0)  # Suppress TF output
        pred_label = np.argmax(pred, axis=1)
        categories = ["Road Authority", "Dumping/Waste Authority","Public Amenities Authority","Electricity Company"]
        return categories[pred_label[0]]
    except Exception as e:
        # Fallback to default category if AI fails
        print(f"AI category detection failed: {str(e)}")
        return "Road Authority"
        print(f"AI category detection failed: {e}")
        return "Road Authority"
def get_radius_from_text(description : str):
    result = get_query_response(description,"system_prompt3.txt")
    return result;

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

def get_radius_from_text(description: str):
    """Get the radius from issue description"""
    try:
        result = get_query_response(description,"system_prompt3.txt")
        # Extract number from AI response, default to 500 if parsing fails
        import re
        numbers = re.findall(r'\d+', result)
        if numbers:
            radius = int(numbers[0])
            # Ensure radius is within reasonable bounds
            return max(50, min(5000, radius))
        return 500  # Default radius
    except Exception as e:
        print(f"Radius detection failed: {e}")
        return 500  # Default radius

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula (in meters)"""
    import math
    
    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of earth in meters
    r = 6371000
    
    return c * r

def parse_location_coordinates(location: str) -> tuple[float, float]:
    """Parse location string to extract latitude and longitude"""
    try:
        # Expected format: "latitude,longitude"
        parts = location.strip().split(',')
        if len(parts) == 2:
            lat = float(parts[0].strip())
            lon = float(parts[1].strip())
            return lat, lon
        else:
            raise ValueError("Invalid location format")
    except (ValueError, IndexError) as e:
        raise ValueError(f"Cannot parse location '{location}'. Expected format: 'latitude,longitude'")

def check_duplicate_issue(
    category: str, 
    district: str, 
    location: str, 
    radius: int, 
    current_user_id: UUID, 
    db: Session
) -> Optional[Issue]:
    """
    Check if there's already an existing issue of the same category and district 
    within the specified radius from the given location.
    Returns the existing issue if found, None otherwise.
    """
    try:
        # Parse the new issue location
        new_lat, new_lon = parse_location_coordinates(location)
        
        # Get all open issues of the same category in the same district
        existing_issues = db.query(Issue).join(Authority).filter(
            Issue.category == category,
            Authority.district == district,
            Issue.status.in_([0, 1])  # Only open and in-progress issues
        ).all()
        
        # Check distance for each existing issue
        for existing_issue in existing_issues:
            try:
                existing_lat, existing_lon = parse_location_coordinates(existing_issue.location)
                
                # Calculate distance between locations
                distance = calculate_distance(new_lat, new_lon, existing_lat, existing_lon)
                
                # Check if within either issue's radius (use the larger radius)
                max_radius = max(radius, existing_issue.radius)
                
                if distance <= max_radius:
                    return existing_issue
                    
            except ValueError:
                # Skip issues with invalid location format
                continue
                
        return None
        
    except ValueError as e:
        # If we can't parse the new location, we can't check for duplicates
        print(f"Location parsing error: {e}")
        return None

def auto_upvote_issue(issue: Issue, user_id: UUID, db: Session) -> bool:
    """
    Automatically upvote an existing issue if the user hasn't already voted.
    Returns True if vote was created, False if user already voted.
    """
    # Check if user has already voted for this issue
    existing_vote = db.query(Vote).filter(
        Vote.user_id == user_id,
        Vote.issue_id == issue.id
    ).first()
    
    if existing_vote:
        return False  # User already voted
    
    # Create new vote
    new_vote = Vote(
        user_id=user_id,
        issue_id=issue.id
    )
    
    db.add(new_vote)
    db.commit()
    return True
def is_spam_from_text(description: str):
    """Check if the issue description is spam"""
    result = get_query_response(description,"system_prompt4.txt")
    return result;

def create_issue_data(
    request: IssueCreateRequest, 
    user_id: UUID, 
    db: Session
) -> IssueCreateData:
    """Convert API request to internal issue data model with AI processing"""
    
    # Get AI-generated category first
    ai_category = get_category_from_text(request.description)
    
    # Get authority based on AI-detected category and user's district
    authority_id = get_authority(ai_category, request.district, db)
    
    # Get AI-generated priority
    ai_priority = get_priority_from_text(request.description)
    
    # Get AI-generated radius (always use AI, no user input)
    ai_radius = get_radius_from_text(request.description)
    
    # Create the internal data model
    return IssueCreateData(
        user_id=user_id,
        authority_id=UUID(authority_id),  # Convert string to UUID
        title=request.title,
        description=request.description,
        location=request.location,
        radius=ai_radius,
        district=request.district,
        category=ai_category,
        priority=ai_priority,
        status=0  # Default to open
    )

def create_notification_for_authority(issue: Issue, db: Session):
    """Create notification for authority when a new issue is created"""
    # Get the authority
    authority = db.query(Authority).filter(Authority.id == issue.authority_id).first()
    if authority:
        notification = Notification(
            issue_id=issue.id,
            user_id=authority.user_id,  # Use the authority's user_id
            message=f"New issue reported: '{issue.title}' in your jurisdiction. Please review and take action.",
            is_citizen=False,  # This is for authority
            is_read=False
        )
        db.add(notification)

def create_notification_for_user(issue: Issue, db: Session):
    """Create notification for user when their issue is updated"""
    notification = Notification(
        issue_id=issue.id,
        user_id=issue.user_id,
        message=f"Your issue '{issue.title}' has been updated. Check the latest status.",
        is_citizen=True,  # This is for citizen
        is_read=False
    )
    db.add(notification)

@router.post("/", response_model=IssueCreateResponse, status_code=201)
def create_issue(
    issue_data: IssueCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new issue with AI-powered category and priority detection, and duplicate checking"""
    
    # Check for spam first
    spam_result = is_spam_from_text(issue_data.description)
    if "SPAM" in spam_result.upper():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Issue rejected as spam: {spam_result}"
        )
    
    # Convert API request to internal data model with AI processing
    internal_issue_data = create_issue_data(issue_data, current_user.id, db)
    
    # Check for duplicate issues within radius
    duplicate_issue = check_duplicate_issue(
        category=internal_issue_data.category,
        district=internal_issue_data.district,
        location=internal_issue_data.location,
        radius=internal_issue_data.radius,
        current_user_id=current_user.id,
        db=db
    )
    
    if duplicate_issue:
        # Load relationships for the existing issue
        existing_issue_with_relations = db.query(Issue).options(
            joinedload(Issue.user),
            joinedload(Issue.authority),
            joinedload(Issue.votes),
            joinedload(Issue.media)
        ).filter(Issue.id == duplicate_issue.id).first()
        
        # Auto-upvote the existing issue
        auto_upvoted = auto_upvote_issue(duplicate_issue, current_user.id, db)
        
        # Calculate distance for response
        try:
            new_lat, new_lon = parse_location_coordinates(internal_issue_data.location)
            existing_lat, existing_lon = parse_location_coordinates(duplicate_issue.location)
            distance = calculate_distance(new_lat, new_lon, existing_lat, existing_lon)
        except ValueError:
            distance = 0.0
        
        # Return duplicate response
        return IssueDuplicateResponse(
            message=f"Similar issue already exists within {internal_issue_data.radius}m radius. Your vote has been {'added' if auto_upvoted else 'already recorded'}.",
            existing_issue=create_issue_response(existing_issue_with_relations),
            auto_upvoted=auto_upvoted,
            distance_meters=round(distance, 2)
        )
    
    # No duplicate found, create new issue
    new_issue = Issue(**internal_issue_data.to_issue_dict())
    
    db.add(new_issue)
    db.commit()
    db.refresh(new_issue)
    
    # Create notification for authority about new issue
    create_notification_for_authority(new_issue, db)
    db.commit()  # Commit the notification
    
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
    
    # Create notification for user about issue update
    create_notification_for_user(issue, db)
    db.commit()  # Commit the notification
    
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

@router.put("/media/{issue_id}", status_code=201)
async def upload_media_to_issue(
    issue_id: UUID,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload media files to Azure Blob Storage for an issue"""
    
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
    
    # Get Azure Storage Service
    azure_service = get_azure_storage_service()
    uploaded_files = []
    
    # Upload files and create Media records
    for file in files:
        try:
            # Read file content
            file_content = await file.read()
            
            # Upload to Azure Blob Storage
            blob_url, blob_name = await azure_service.upload_file(
                file_content=file_content,
                file_name=file.filename,
                issue_id=str(issue_id),
                content_type=file.content_type
            )
            
            # Create Media record with Azure Blob URL
            media_record = Media(
                issue_id=issue_id,
                path=blob_url,  # Azure Blob URL
                blob_name=blob_name,  # For deletion/management
                filename=file.filename,
                file_size=len(file_content),
                file_type=file.content_type,
                storage_type="azure_blob"
            )
            db.add(media_record)
            uploaded_files.append(file.filename)
            
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file {file.filename} to Azure Blob Storage: {str(e)}"
            )
    
    db.commit()
    
    return {
        "message": f"Uploaded {len(uploaded_files)} files to Azure Blob Storage",
        "uploaded_files": uploaded_files,
        "storage_type": "azure_blob"
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
async def delete_media(
    media_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific media file from Azure Blob Storage and database"""
    
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
    
    # Delete file based on storage type
    try:
        if media.storage_type == "azure_blob" and media.blob_name:
            # Delete from Azure Blob Storage
            azure_service = get_azure_storage_service()
            await azure_service.delete_file(media.blob_name)
        elif media.storage_type == "local" and os.path.exists(media.path):
            # Delete local file (fallback for existing files)
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
