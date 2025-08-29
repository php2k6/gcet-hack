from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func
from typing import Optional, List
from datetime import datetime

from app.database import get_db
from app.models import Notification, User, Issue
from app.schemas.notification_schemas import (
    NotificationCreate,
    NotificationResponse,
    NotificationListResponse,
    NotificationMarkRead
)
from app.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])

def create_notification(notification_data: NotificationCreate, db: Session) -> Notification:
    """Helper function to create a notification"""
    new_notification = Notification(
        issue_id=notification_data.issue_id,
        user_id=notification_data.user_id,
        message=notification_data.message,
        is_citizen=notification_data.is_citizen,
        is_read=False
    )
    
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    return new_notification

@router.get("/", response_model=NotificationListResponse)
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of notifications to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of notifications to return"),
    unread_only: bool = Query(False, description="Return only unread notifications")
):
    """Get notifications for the current user"""
    
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    # Get total count
    total_count = query.count()
    
    # Get unread count
    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    # Get notifications with pagination
    notifications = query.options(
        joinedload(Notification.issue),
        joinedload(Notification.user)
    ).order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()
    
    return NotificationListResponse(
        notifications=[NotificationResponse.from_orm(notif) for notif in notifications],
        total_count=total_count,
        unread_count=unread_count
    )

@router.put("/mark-read")
def mark_notifications_read(
    mark_read_data: NotificationMarkRead,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark specific notifications as read"""
    
    # Verify all notifications belong to the current user
    notifications = db.query(Notification).filter(
        Notification.id.in_(mark_read_data.notification_ids),
        Notification.user_id == current_user.id
    ).all()
    
    if len(notifications) != len(mark_read_data.notification_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more notifications not found or don't belong to you"
        )
    
    # Mark as read
    for notification in notifications:
        notification.is_read = True
    
    db.commit()
    
    return {"message": f"Marked {len(notifications)} notifications as read"}

@router.put("/mark-all-read")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read for the current user"""
    
    updated_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    
    return {"message": f"Marked {updated_count} notifications as read"}

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific notification"""
    
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted successfully"}
