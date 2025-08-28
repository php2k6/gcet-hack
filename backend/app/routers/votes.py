from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import uuid

from app.database import get_db
from app.models import User, Issue, Vote
from app.auth import get_current_user
from app.schemas.vote_schemas import (
    VoteCreateRequest,
    VoteResponse,
    VoteOperationResponse
)
from app.schemas.issue_schemas import IssueResponse

router = APIRouter(
    prefix="/vote",
    tags=["votes"]
)

@router.post("/{issue_id}", response_model=VoteOperationResponse, status_code=201)
def vote_on_issue(
    issue_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Vote on an issue (upvote). 
    If user already voted, this is a no-op.
    Returns the updated issue information.
    """
    # Check if issue exists
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    # Check if user already voted on this issue
    existing_vote = db.query(Vote).filter(
        Vote.user_id == current_user.id,
        Vote.issue_id == issue_id
    ).first()
    
    if existing_vote:
        # User already voted, return current state
        total_votes = db.query(Vote).filter(Vote.issue_id == issue_id).count()
        return VoteOperationResponse(
            message="You have already voted on this issue",
            vote=VoteResponse(
                id=existing_vote.id,
                user_id=existing_vote.user_id,
                issue_id=existing_vote.issue_id
            ),
            total_votes=total_votes,
            user_has_voted=True
        )
    
    # Create new vote
    new_vote = Vote(
        id=uuid.uuid4(),
        user_id=current_user.id,
        issue_id=issue_id
    )
    
    db.add(new_vote)
    db.commit()
    db.refresh(new_vote)
    
    # Get updated vote count
    total_votes = db.query(Vote).filter(Vote.issue_id == issue_id).count()
    
    return VoteOperationResponse(
        message="Vote added successfully",
        vote=VoteResponse(
            id=new_vote.id,
            user_id=new_vote.user_id,
            issue_id=new_vote.issue_id
        ),
        total_votes=total_votes,
        user_has_voted=True
    )

@router.delete("/{issue_id}", response_model=VoteOperationResponse)
def remove_vote_from_issue(
    issue_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove vote from an issue.
    Returns the updated issue information.
    """
    # Check if issue exists
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    # Check if user has voted on this issue
    existing_vote = db.query(Vote).filter(
        Vote.user_id == current_user.id,
        Vote.issue_id == issue_id
    ).first()
    
    if not existing_vote:
        # User hasn't voted, return current state
        total_votes = db.query(Vote).filter(Vote.issue_id == issue_id).count()
        return VoteOperationResponse(
            message="You haven't voted on this issue",
            vote=None,
            total_votes=total_votes,
            user_has_voted=False
        )
    
    # Delete the vote
    db.delete(existing_vote)
    db.commit()
    
    # Get updated vote count
    total_votes = db.query(Vote).filter(Vote.issue_id == issue_id).count()
    
    return VoteOperationResponse(
        message="Vote removed successfully",
        vote=None,
        total_votes=total_votes,
        user_has_voted=False
    )

@router.get("/issue/{issue_id}/count", response_model=dict)
def get_issue_vote_count(
    issue_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get vote count for a specific issue and check if current user has voted.
    """
    # Check if issue exists
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    # Get total vote count
    total_votes = db.query(Vote).filter(Vote.issue_id == issue_id).count()
    
    # Check if current user has voted
    user_vote = db.query(Vote).filter(
        Vote.user_id == current_user.id,
        Vote.issue_id == issue_id
    ).first()
    
    return {
        "issue_id": str(issue_id),
        "total_votes": total_votes,
        "user_has_voted": user_vote is not None,
        "user_vote_id": str(user_vote.id) if user_vote else None
    }
