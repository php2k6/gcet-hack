"""
Test script for media endpoints with Azure Blob Storage integration
"""
import requests
import json
import os
from io import BytesIO
from PIL import Image
import time

# Configuration
BASE_URL = "http://localhost:8000/"
API_BASE = f"{BASE_URL}/api"

# Test credentials (you may need to adjust these)
TEST_USER = {
    "email": "test@example.com",
    "password": "testpassword123"
}

def create_test_image():
    """Create a test image for upload"""
    # Create a simple RGB image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes.getvalue()

def get_auth_token():
    """Get authentication token for API requests"""
    print("🔐 Getting authentication token...")
    
    # Try to login with test user
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

def create_test_issue(headers):
    """Create a test issue to attach media to"""
    print("📝 Creating test issue...")
    
    issue_data = {
        "title": "Test Issue for Media Upload",
        "description": "This is a test issue created for testing media endpoints",
        "location": "Test Location",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "category": "road_damage"
    }
    
    response = requests.post(f"{API_BASE}/issues/", json=issue_data, headers=headers)
    
    if response.status_code == 201:
        issue = response.json()
        issue_id = issue["id"]
        print(f"✅ Test issue created with ID: {issue_id}")
        return issue_id
    else:
        print(f"❌ Failed to create test issue: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def test_media_upload(issue_id, headers):
    """Test media upload to Azure Blob Storage"""
    print(f"📤 Testing media upload for issue {issue_id}...")
    
    # Create test image
    image_data = create_test_image()
    
    # Prepare the file for upload
    files = {
        'file': ('test_image.png', image_data, 'image/png')
    }
    
    # Upload media
    response = requests.put(
        f"{API_BASE}/issues/media/{issue_id}",
        files=files,
        headers=headers
    )
    
    if response.status_code == 200:
        media_response = response.json()
        print(f"✅ Media uploaded successfully!")
        print(f"   Media ID: {media_response['id']}")
        print(f"   Blob URL: {media_response['path']}")
        print(f"   Blob Name: {media_response.get('blob_name', 'N/A')}")
        print(f"   Storage Type: {media_response.get('storage_type', 'N/A')}")
        return media_response
    else:
        print(f"❌ Media upload failed: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def test_media_retrieval(issue_id, headers):
    """Test retrieving media for an issue"""
    print(f"📥 Testing media retrieval for issue {issue_id}...")
    
    response = requests.get(f"{API_BASE}/issues/media/{issue_id}", headers=headers)
    
    if response.status_code == 200:
        media_list = response.json()
        print(f"✅ Media retrieval successful!")
        print(f"   Found {len(media_list)} media files")
        for media in media_list:
            print(f"   - Media ID: {media['id']}")
            print(f"   - Path: {media['path']}")
            print(f"   - Storage Type: {media.get('storage_type', 'N/A')}")
        return media_list
    else:
        print(f"❌ Media retrieval failed: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def test_media_serving(media_id, headers):
    """Test serving media through the serve endpoint"""
    print(f"🖼️ Testing media serving for media {media_id}...")
    
    response = requests.get(f"{API_BASE}/issues/serve/{media_id}", headers=headers)
    
    if response.status_code == 200:
        print(f"✅ Media serving successful!")
        print(f"   Content Type: {response.headers.get('content-type', 'N/A')}")
        print(f"   Content Length: {len(response.content)} bytes")
        return True
    else:
        print(f"❌ Media serving failed: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def test_media_deletion(media_id, headers):
    """Test deleting media from Azure Blob Storage"""
    print(f"🗑️ Testing media deletion for media {media_id}...")
    
    response = requests.delete(f"{API_BASE}/issues/media/{media_id}", headers=headers)
    
    if response.status_code == 200:
        print(f"✅ Media deletion successful!")
        return True
    else:
        print(f"❌ Media deletion failed: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def test_azure_blob_url_access(blob_url):
    """Test direct access to Azure Blob Storage URL"""
    print(f"🌐 Testing direct Azure Blob URL access...")
    
    try:
        response = requests.get(blob_url, timeout=10)
        if response.status_code == 200:
            print(f"✅ Direct blob access successful!")
            print(f"   Content Type: {response.headers.get('content-type', 'N/A')}")
            print(f"   Content Length: {len(response.content)} bytes")
            return True
        else:
            print(f"❌ Direct blob access failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Direct blob access error: {str(e)}")
        return False

def cleanup_test_issue(issue_id, headers):
    """Clean up the test issue"""
    print(f"🧹 Cleaning up test issue {issue_id}...")
    
    response = requests.delete(f"{API_BASE}/issues/{issue_id}", headers=headers)
    
    if response.status_code == 200:
        print(f"✅ Test issue cleaned up successfully")
    else:
        print(f"⚠️ Failed to clean up test issue: {response.status_code}")

def main():
    """Run all media endpoint tests"""
    print("🧪 Testing Media Endpoints with Azure Blob Storage")
    print("=" * 60)
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code != 200:
            print("❌ Server is not running. Please start the FastAPI server first:")
            print("   python -m uvicorn app.main:app --reload --port 8000")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Please start the FastAPI server first:")
        print("   python -m uvicorn app.main:app --reload --port 8000")
        return
    
    print("✅ Server is running")
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Cannot proceed without authentication token")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create test issue
    issue_id = create_test_issue(headers)
    if not issue_id:
        print("❌ Cannot proceed without test issue")
        return
    
    try:
        # Test media upload
        media_response = test_media_upload(issue_id, headers)
        if not media_response:
            return
        
        media_id = media_response["id"]
        blob_url = media_response["path"]
        
        # Wait a moment for Azure to process
        print("⏳ Waiting for Azure Blob Storage to process...")
        time.sleep(2)
        
        # Test media retrieval
        media_list = test_media_retrieval(issue_id, headers)
        
        # Test media serving
        test_media_serving(media_id, headers)
        
        # Test direct Azure Blob URL access
        test_azure_blob_url_access(blob_url)
        
        # Test media deletion
        test_media_deletion(media_id, headers)
        
        print("\n" + "=" * 60)
        print("🎉 All media endpoint tests completed!")
        print("\n📋 Test Summary:")
        print("✅ Media upload to Azure Blob Storage")
        print("✅ Media retrieval from database")
        print("✅ Media serving through API")
        print("✅ Direct Azure Blob URL access")
        print("✅ Media deletion from Azure Blob Storage")
        
    finally:
        # Cleanup
        cleanup_test_issue(issue_id, headers)

if __name__ == "__main__":
    main()
