# Enhanced Media Model - Recommended Approach

class Media(Base):
    __tablename__ = "media"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    issue_id = Column(UUID(as_uuid=True), ForeignKey("issues.id"), nullable=False)
    
    # File Information
    filename = Column(String(255), nullable=False)  # Original filename
    file_path = Column(String(500), nullable=False)  # Storage path/URL
    file_type = Column(String(50), nullable=False)   # image/jpeg, image/png, video/mp4, etc.
    file_size = Column(BigInteger, nullable=False)   # Size in bytes
    
    # Storage Information  
    storage_type = Column(String(20), default="local")  # local, s3, cloudinary, etc.
    
    # Metadata
    alt_text = Column(String(255), nullable=True)    # Accessibility
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    issue = relationship("Issue", back_populates="media")
    uploader = relationship("User")
