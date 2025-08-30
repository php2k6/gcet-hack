#!/usr/bin/env python3
"""
Test script to demonstrate the fixed POST endpoint for issue creation
Shows the complete input/output flow with AI-generated radius
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_issue_creation():
    """Test the fixed POST endpoint that auto-generates radius"""
    print("🧪 Testing Fixed POST /api/issues/ Endpoint")
    print("=" * 60)
    
    # Sample test data (no radius field)
    test_issue = {
        "title": "Large pothole on Highway 101 causing traffic issues",
        "description": "There is a massive pothole near the gas station that's affecting a wide area of traffic. Cars are swerving dangerously around it and it's becoming a safety hazard for the entire stretch of road.",
        "location": "40.7128,-74.0060",  # NYC coordinates
        "district": "Manhattan"
    }
    
    print("📝 Input Data (User Provides):")
    print(json.dumps(test_issue, indent=2))
    print()
    
    print("🤖 AI Processing:")
    print("- Radius: Auto-generated from description using AI")
    print("- Category: Auto-detected from description") 
    print("- Priority: Auto-determined from description")
    print("- Authority: Auto-selected based on category + district")
    print()
    
    # Make the request
    print("🌐 Making POST Request...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/issues/",
            json=test_issue,
            headers={
                "Content-Type": "application/json",
                # Note: In real usage, you'd need Authorization header
            },
            timeout=30
        )
        
        print(f"📊 Response Status: {response.status_code}")
        print()
        
        if response.status_code == 201:
            # Successful creation
            data = response.json()
            print("✅ SUCCESSFUL ISSUE CREATION")
            print("=" * 40)
            
            print("📋 Response Structure:")
            print(f"- Message: {data.get('message', 'N/A')}")
            print()
            
            if 'issue' in data:
                issue = data['issue']
                print("🎯 Created Issue Details:")
                print(f"   ID: {issue.get('id', 'N/A')}")
                print(f"   Title: {issue.get('title', 'N/A')}")
                print(f"   Status: {issue.get('status', 'N/A')}")
                print(f"   Location: {issue.get('location', 'N/A')}")
                print(f"   🤖 AI-Generated Radius: {issue.get('radius', 'N/A')} meters")
                print(f"   🤖 AI-Detected Category: {issue.get('category', 'N/A')}")
                print(f"   🤖 AI-Determined Priority: {issue.get('priority', 'N/A')}")
                print(f"   Created At: {issue.get('created_at', 'N/A')}")
                print()
                
                print("👤 User Information:")
                if 'user' in issue:
                    user = issue['user']
                    print(f"   Name: {user.get('name', 'N/A')}")
                    print(f"   Email: {user.get('email', 'N/A')}")
                    print(f"   District: {user.get('district', 'N/A')}")
                print()
                
                print("🏛️ Authority Information:")
                if 'authority' in issue:
                    authority = issue['authority']
                    print(f"   Name: {authority.get('name', 'N/A')}")
                    print(f"   District: {authority.get('district', 'N/A')}")
                    print(f"   Category: {authority.get('category', 'N/A')}")
                    print(f"   Contact: {authority.get('contact_email', 'N/A')}")
                print()
                
                print("📊 Engagement Metrics:")
                print(f"   Vote Count: {issue.get('vote_count', 0)}")
                print(f"   Media Files: {len(issue.get('media', []))}")
                
        elif response.status_code == 400:
            # Duplicate found or other issue
            data = response.json()
            print("🔄 DUPLICATE ISSUE DETECTED")
            print("=" * 40)
            
            print(f"📋 Message: {data.get('message', 'N/A')}")
            
            if 'existing_issue' in data:
                existing = data['existing_issue']
                print("\n🎯 Existing Issue Details:")
                print(f"   ID: {existing.get('id', 'N/A')}")
                print(f"   Title: {existing.get('title', 'N/A')}")
                print(f"   Radius: {existing.get('radius', 'N/A')} meters")
                print(f"   Vote Count: {existing.get('vote_count', 0)}")
                
            print(f"\n📏 Distance: {data.get('distance_meters', 'N/A')} meters")
            print(f"🗳️ Auto-upvoted: {data.get('auto_upvoted', False)}")
            
        else:
            # Error response
            print(f"❌ ERROR RESPONSE")
            print("=" * 40)
            try:
                error_data = response.json()
                print(f"Error Detail: {error_data.get('detail', 'Unknown error')}")
            except:
                print(f"Raw Response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Server not running on localhost:8000")
    except requests.exceptions.Timeout:
        print("❌ Timeout Error: Server took too long to respond")
    except Exception as e:
        print(f"❌ Unexpected Error: {str(e)}")
    
    print("\n" + "=" * 60)
    print("📋 COMPLETE RESPONSE SCHEMA:")
    print("""
    Success Response (201):
    {
      "message": "Issue created successfully",
      "issue": {
        "id": "uuid",
        "user_id": "uuid", 
        "authority_id": "uuid",
        "title": "string",
        "description": "string",
        "status": 0,
        "location": "lat,lon",
        "radius": 500,  // ← AI-GENERATED
        "created_at": "datetime",
        "updated_at": "datetime", 
        "priority": 2,  // ← AI-DETERMINED
        "category": "Road Authority",  // ← AI-DETECTED
        "user": { "id", "name", "email", "district" },
        "authority": { "id", "name", "district", "category", "contact_email" },
        "votes": [],
        "media": [],
        "vote_count": 0
      }
    }
    
    Duplicate Response (400):
    {
      "message": "Similar issue already exists within 500m radius...",
      "existing_issue": { /* same issue structure */ },
      "auto_upvoted": true,
      "distance_meters": 150.25
    }
    """)

if __name__ == "__main__":
    test_issue_creation()
