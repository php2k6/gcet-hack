from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from pydantic import UUID4

class NotificationBase(BaseModel):
    message: str = Field(..., description="Notification message")
    is_citizen: bool = Field(True, description="Whether the user is a citizen or authority")

class NotificationCreate(NotificationBase):
    issue_id: UUID4 = Field(..., description="ID of the related issue")
    user_id: UUID4 = Field(..., description="ID of the user to notify")

class NotificationResponse(NotificationBase):
    id: UUID4
    issue_id: UUID4
    user_id: UUID4
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class NotificationListResponse(BaseModel):
    notifications: list[NotificationResponse]
    total_count: int
    unread_count: int

class NotificationMarkRead(BaseModel):
    notification_ids: list[UUID4] = Field(..., description="List of notification IDs to mark as read")
