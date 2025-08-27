
from app.database import Base
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(Text, nullable=False)
    role = Column(Integer, default=0)  # 0: user, 1: admin, etc.
    phone = Column(String(20), nullable=True)
    is_google = Column(Boolean, default=False)
    google_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=func.now())
    district = Column(String(100), nullable=True)
    
    # Relationships
    issues = relationship("Issue", back_populates="user")
    votes = relationship("Vote", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    awards = relationship("Award", back_populates="winner")

class Authority(Base):
    __tablename__ = "authorities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    district = Column(String(100), nullable=False)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(20), nullable=True)
    category = Column(String(100), nullable=False)  # e.g., "Water", "Roads", "Electricity"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    issues = relationship("Issue", back_populates="authority")
    user = relationship("User")

class Issue(Base):
    __tablename__ = "issues"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    authority_id = Column(UUID(as_uuid=True), ForeignKey("authorities.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Integer, default=0)  # 0: open, 1: in progress, 2: resolved, 3: closed
    location = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    priority = Column(Integer, default=1)  # 1: low, 2: medium, 3: high, 4: urgent
    category = Column(String(100), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="issues")
    authority = relationship("Authority", back_populates="issues")
    votes = relationship("Vote", back_populates="issue")
    media = relationship("Media", back_populates="issue")
    notifications = relationship("Notification", back_populates="issue")

class Vote(Base):
    __tablename__ = "votes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    issue_id = Column(UUID(as_uuid=True), ForeignKey("issues.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="votes")
    issue = relationship("Issue", back_populates="votes")

class Media(Base):
    __tablename__ = "media"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    issue_id = Column(UUID(as_uuid=True), ForeignKey("issues.id"), nullable=False)
    path = Column(String(500), nullable=False)  # File path or URL
    
    # Relationships
    issue = relationship("Issue", back_populates="media")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    issue_id = Column(UUID(as_uuid=True), ForeignKey("issues.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    is_citizen = Column(Boolean, default=True)
    message = Column(Text, nullable=False)
    
    # Relationships
    issue = relationship("Issue", back_populates="notifications")
    user = relationship("User", back_populates="notifications")

class Award(Base):
    __tablename__ = "awards"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    is_citizen = Column(Boolean, default=True)
    winner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    description = Column(Text, nullable=False)
    
    # Relationships
    winner = relationship("User", back_populates="awards")
