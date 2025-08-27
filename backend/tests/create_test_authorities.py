"""
Script to create test authorities in the database
Run this once to populate the database with sample authorities
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Authority, User
import uuid

def create_test_authorities():
    """Create sample authorities for testing"""
    db = SessionLocal()
    
    try:
        # Create test authority users first
        authority_users = [
            {
                "name": "Water Department Admin",
                "email": "water.dept@testcity.gov",
                "password": "$2b$12$LQv3c1yqBwEHr6.WBd4g3uLV3kk7i6bOrNcE8O8qE8qE8qE8qE8qE8qE",  # hashed "password"
                "role": 1,  # Authority role
                "phone": "555-0101",
                "district": "Central District"
            },
            {
                "name": "Roads Department Admin", 
                "email": "roads.dept@testcity.gov",
                "password": "$2b$12$LQv3c1yqBwEHr6.WBd4g3uLV3kk7i6bOrNcE8O8qE8qE8qE8qE8qE8qE",
                "role": 1,
                "phone": "555-0102", 
                "district": "Central District"
            },
            {
                "name": "Electricity Department Admin",
                "email": "power.dept@testcity.gov", 
                "password": "$2b$12$LQv3c1yqBwEHr6.WBd4g3uLV3kk7i6bOrNcE8O8qE8qE8qE8qE8qE8qE",
                "role": 1,
                "phone": "555-0103",
                "district": "North District"
            }
        ]
        
        created_users = []
        
        # Create authority users
        for user_data in authority_users:
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            if not existing_user:
                user = User(**user_data)
                db.add(user)
                db.flush()  # Get the ID without committing
                created_users.append(user)
                print(f"✅ Created authority user: {user.name}")
            else:
                created_users.append(existing_user)
                print(f"⚠️ Authority user already exists: {existing_user.name}")
        
        # Create authorities
        authorities_data = [
            {
                "name": "Municipal Water Department",
                "district": "Central District", 
                "contact_email": "water.dept@testcity.gov",
                "contact_phone": "555-0101",
                "category": "Water",
                "user_id": created_users[0].id
            },
            {
                "name": "Public Works - Roads Division",
                "district": "Central District",
                "contact_email": "roads.dept@testcity.gov", 
                "contact_phone": "555-0102",
                "category": "Roads",
                "user_id": created_users[1].id
            },
            {
                "name": "City Power & Light Department",
                "district": "North District",
                "contact_email": "power.dept@testcity.gov",
                "contact_phone": "555-0103", 
                "category": "Electricity",
                "user_id": created_users[2].id
            }
        ]
        
        for auth_data in authorities_data:
            # Check if authority already exists
            existing_auth = db.query(Authority).filter(
                Authority.name == auth_data["name"]
            ).first()
            
            if not existing_auth:
                authority = Authority(**auth_data)
                db.add(authority)
                print(f"✅ Created authority: {authority.name}")
            else:
                print(f"⚠️ Authority already exists: {existing_auth.name}")
        
        # Commit all changes
        db.commit()
        print("\n🎉 Test authorities setup complete!")
        
        # Print authority IDs for testing
        print("\n📋 Available Authorities for Testing:")
        authorities = db.query(Authority).all()
        for auth in authorities:
            print(f"   • {auth.name} (ID: {auth.id}) - Category: {auth.category}")
        
    except Exception as e:
        print(f"❌ Error creating test authorities: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Creating test authorities...")
    create_test_authorities()
