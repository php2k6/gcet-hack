"""
Simple script to make a user admin for testing
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import User

def make_user_admin(email):
    """Make a user admin by email"""
    db = SessionLocal()
    
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.role = 2  # Admin role
            db.commit()
            print(f"SUCCESS: Made {email} an admin (role = 2)")
            return True
        else:
            print(f"ERROR: User {email} not found")
            return False
    except Exception as e:
        print(f"ERROR: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        email = sys.argv[1]
        make_user_admin(email)
    else:
        print("Usage: python make_admin.py <email>")
