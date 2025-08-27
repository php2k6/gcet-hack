"""
Test configuration and fixtures for authentication tests
"""
import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import get_db, Base
from app.models import User
import uuid
from app.auth import AuthHandler

# Test database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def client():
    """Create test client"""
    # Create the database tables
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client
    # Drop the database tables after tests
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test"""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def auth_handler():
    """Create auth handler instance"""
    return AuthHandler()

@pytest.fixture
def sample_user_data():
    """Sample user registration data"""
    return {
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpassword123",
        "phone": "1234567890",
        "district": "Test District"
    }

@pytest.fixture
def create_test_user(db_session, auth_handler):
    """Create a test user in the database"""
    def _create_user(email="testuser@example.com", password="testpass123"):
        hashed_password = auth_handler.hash_password(password)
        user = User(
            id=uuid.uuid4(),
            name="Test User",
            email=email,
            password=hashed_password,
            phone="1234567890",
            district="Test District",
            role=0
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user
    return _create_user
