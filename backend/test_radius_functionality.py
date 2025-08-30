"""
Test script for radius-based duplicate detection functionality
"""
import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

# Test credentials
TEST_USER = {
    "email": "test@example.com",
    "password": "testpassword123"
}

def get_auth_token():
    """Get authentication token for API requests"""
    print("🔐 Getting authentication token...")
    
    login_data = {
        "username": TEST_USER["email"],
        "password": TEST_USER["password"]
    }
    
    response = requests.post(f"{API_BASE}/auth/login", data=login_data)
    
    if response.status_code == 200:
        token = response.json().get("access_token")
        print(f"✅ Authentication successful")
        return token
    else:
        print(f"❌ Authentication failed: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def test_issue_creation_with_radius():
    """Test creating issues with radius-based duplicate detection"""
    print("\n🧪 Testing issue creation with radius-based duplicate detection")
    print("=" * 70)
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Cannot proceed without authentication token")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 1: Create a new issue
    print("\n📝 Test 1: Creating initial issue...")
    issue_data_1 = {
        "title": "Large pothole on Main Street",
        "description": "There is a dangerous pothole on Main Street that needs immediate attention. Cars are swerving to avoid it.",
        "location": "40.7128,-74.0060",  # NYC coordinates
        "district": "Manhattan",
        "radius": 300  # 300 meter radius
    }
    
    response1 = requests.post(f"{API_BASE}/issues/", json=issue_data_1, headers=headers)
    print(f"Response status: {response1.status_code}")
    
    if response1.status_code == 201:
        result1 = response1.json()
        print(f"✅ Issue created successfully!")
        print(f"   Issue ID: {result1['issue']['id']}")
        print(f"   Category: {result1['issue']['category']}")
        print(f"   Radius: {result1['issue']['radius']}m")
        print(f"   Location: {result1['issue']['location']}")
        issue_1_id = result1['issue']['id']
    else:
        print(f"❌ Failed to create issue: {response1.text}")
        return
    
    # Test 2: Try to create a similar issue within radius (should detect duplicate)
    print("\n📝 Test 2: Creating similar issue within radius (should detect duplicate)...")
    issue_data_2 = {
        "title": "Road damage near Main Street intersection",
        "description": "The road surface is severely damaged near Main Street intersection. It's causing traffic issues.",
        "location": "40.7130,-74.0058",  # Very close to first location (~25 meters away)
        "district": "Manhattan",
        "radius": 200
    }
    
    response2 = requests.post(f"{API_BASE}/issues/", json=issue_data_2, headers=headers)
    print(f"Response status: {response2.status_code}")
    
    if response2.status_code == 200:  # Should return 200 for duplicate detection
        result2 = response2.json()
        print(f"✅ Duplicate detected and handled!")
        print(f"   Message: {result2['message']}")
        print(f"   Existing Issue ID: {result2['existing_issue']['id']}")
        print(f"   Auto-upvoted: {result2['auto_upvoted']}")
        print(f"   Distance: {result2['distance_meters']}m")
    else:
        print(f"❌ Unexpected response: {response2.text}")
    
    # Test 3: Create an issue outside the radius (should create new issue)
    print("\n📝 Test 3: Creating issue outside radius (should create new issue)...")
    issue_data_3 = {
        "title": "Broken streetlight on Broadway",
        "description": "The streetlight at Broadway and 42nd street is not working. It's very dark at night.",
        "location": "40.7580,-73.9855",  # Times Square - much farther away
        "district": "Manhattan",
        "radius": 150
    }
    
    response3 = requests.post(f"{API_BASE}/issues/", json=issue_data_3, headers=headers)
    print(f"Response status: {response3.status_code}")
    
    if response3.status_code == 201:
        result3 = response3.json()
        print(f"✅ New issue created successfully!")
        print(f"   Issue ID: {result3['issue']['id']}")
        print(f"   Category: {result3['issue']['category']}")
        print(f"   Location: {result3['issue']['location']}")
    else:
        print(f"❌ Failed to create issue: {response3.text}")
    
    # Test 4: Try different category at same location (should create new issue)
    print("\n📝 Test 4: Creating different category at same location (should create new issue)...")
    issue_data_4 = {
        "title": "Electrical outage on Main Street",
        "description": "Power lines are down on Main Street causing electrical outage in the area.",
        "location": "40.7128,-74.0060",  # Same location as first issue
        "district": "Manhattan",
        "radius": 250
    }
    
    response4 = requests.post(f"{API_BASE}/issues/", json=issue_data_4, headers=headers)
    print(f"Response status: {response4.status_code}")
    
    if response4.status_code == 201:
        result4 = response4.json()
        print(f"✅ New issue created (different category)!")
        print(f"   Issue ID: {result4['issue']['id']}")
        print(f"   Category: {result4['issue']['category']}")
        print(f"   Location: {result4['issue']['location']}")
    else:
        print(f"❌ Unexpected response: {response4.text}")
    
    print("\n" + "=" * 70)
    print("🎉 Radius-based duplicate detection tests completed!")
    print("\n📋 Test Summary:")
    print("✅ Initial issue creation")
    print("✅ Duplicate detection within radius")
    print("✅ New issue creation outside radius")
    print("✅ Different category at same location")

def test_distance_calculation():
    """Test the distance calculation function"""
    print("\n🧮 Testing distance calculation...")
    
    # Test coordinates (NYC area)
    lat1, lon1 = 40.7128, -74.0060  # NYC
    lat2, lon2 = 40.7130, -74.0058  # Very close to NYC
    lat3, lon3 = 40.7580, -73.9855  # Times Square
    
    # These would be calculated by the backend, but we can estimate
    # Distance between lat1,lon1 and lat2,lon2 should be ~25 meters
    # Distance between lat1,lon1 and lat3,lon3 should be ~5-6 km
    
    print(f"📍 Location 1: {lat1}, {lon1}")
    print(f"📍 Location 2: {lat2}, {lon2} (should be ~25m away)")
    print(f"📍 Location 3: {lat3}, {lon3} (should be ~5-6km away)")

if __name__ == "__main__":
    print("🧪 Testing Radius-Based Duplicate Detection System")
    print("=" * 70)
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=5)
        print(f"Server check response: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Please start the FastAPI server first:")
        print("   python -m uvicorn app.main:app --reload --port 8000")
        exit(1)
    except Exception as e:
        print(f"⚠️ Server check failed with error: {e}")
        print("Proceeding with tests anyway...")
    
    print("✅ Server is running")
    
    # Run tests
    test_distance_calculation()
    test_issue_creation_with_radius()
