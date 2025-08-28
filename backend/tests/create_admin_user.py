"""
Create the admin user for testing
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import User
from app.auth import AuthHandler

def create_admin_user():
    """Create admin user with email admin@admin.com and password admin"""
    db = SessionLocal()
    auth_handler = AuthHandler()
    
    try:
        # Check if admin user already exists
        existing_admin = db.query(User).filter(User.email == "admin@admin.com").first()
        if existing_admin:
            print("Admin user already exists, updating password and role...")
            existing_admin.password = auth_handler.hash_password("admin")
            existing_admin.role = 2  # Admin role
            db.commit()
            print("SUCCESS: Updated admin user (admin@admin.com / admin)")
            return True
        
        # Create new admin user
        admin_user = User(
            name="Admin User",
            email="admin@admin.com",
            password=auth_handler.hash_password("admin"),
            role=2,  # Admin role
            phone="0000000000",
            district="Admin District"
        )
        
        db.add(admin_user)
        db.commit()
        print("SUCCESS: Created admin user (admin@admin.com / admin)")
        return True
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
