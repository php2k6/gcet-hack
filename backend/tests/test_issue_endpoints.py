"""
Quick test script for Issues API
Tests all issue endpoints with sample data
"""
import requests
import json
from datetime import datetime
import time

BASE_URL = "http://localhost:8000/api"

class IssuesTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.admin_token = None
        self.test_user_id = None
        self.test_authority_id = None
        self.test_issue_id = None
        self.test_media_id = None
        self.test_media_files = []
        
    def print_result(self, test_name, success, details=""):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        if details:
            print(f"     Details: {details}")
        print("-" * 60)
    
    def setup_auth(self):
        """Set up authentication and create test authority"""
        print("🔧 Setting up authentication and test data...")
        
        # Create unique test user
        timestamp = int(time.time())
        test_email = f"issueuser_{timestamp}@example.com"
        
        # Signup
        signup_data = {
            "name": "Issue Test User",
            "email": test_email,
            "password": "testpass123",
            "phone": "1234567890",
            "district": "Test District"
        }
        
        signup_response = self.session.post(f"{BASE_URL}/auth/signup", json=signup_data)
        if signup_response.status_code != 201:
            print(f"❌ Signup failed: {signup_response.text}")
            return False
        
        # Login to get tokens
        login_data = {
            "email": test_email,
            "password": "testpass123",
            "role": 0
        }
        
        login_response = self.session.post(f"{BASE_URL}/auth/login", json=login_data)
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return False
        
        login_result = login_response.json()
        self.auth_token = login_result["access_token"]
        self.test_user_id = login_result["user"]["id"]
        
        # Set auth header
        self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
        
        # Create admin user for admin tests
        admin_email = f"admin_{timestamp}@example.com"
        admin_signup = {
            "name": "Admin User",
            "email": admin_email,
            "password": "adminpass123",
            "phone": "9876543210",
            "district": "Admin District"
        }
        
        admin_signup_response = self.session.post(f"{BASE_URL}/auth/signup", json=admin_signup)
        admin_login = {
            "email": admin_email,
            "password": "adminpass123",
            "role": 0
        }
        
        admin_login_response = self.session.post(f"{BASE_URL}/auth/login", json=admin_login)
        if admin_login_response.status_code == 200:
            self.admin_token = admin_login_response.json()["access_token"]
        
        print("✅ Authentication setup successful")
        return True
    
    def test_create_issue(self):
        """Test POST /issues"""
        print("🧪 Testing POST /issues...")
        
        try:
            # Use existing authority ID from our test authorities
            # We know we have Municipal Water Department with this ID
            self.test_authority_id = "886617f2-441d-4ac4-8336-7c45827dc83e"
            
            issue_data = {
                "authority_id": self.test_authority_id,
                "title": "Test Road Pothole Issue",
                "description": "There is a large pothole on Main Street that needs immediate attention. It's causing damage to vehicles and is a safety hazard.",
                "location": "Main Street, Test District",
                "category": "Roads",
                "priority": 3
            }
            
            response = self.session.post(f"{BASE_URL}/issues/", json=issue_data)
            
            if response.status_code == 201:
                result = response.json()
                self.test_issue_id = result["issue"]["id"]
                self.print_result("POST /issues", True, f"Issue created: {result['issue']['title']}")
                return True
            else:
                self.print_result("POST /issues", False, f"Status: {response.status_code}, Error: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("POST /issues", False, f"Exception: {str(e)}")
            return False
    
    def test_get_all_issues(self):
        """Test GET /issues"""
        print("🧪 Testing GET /issues...")
        
        try:
            # Remove auth header temporarily for public endpoint
            headers = self.session.headers.copy()
            if "Authorization" in self.session.headers:
                del self.session.headers["Authorization"]
            
            response = self.session.get(f"{BASE_URL}/issues/")
            
            # Restore headers
            self.session.headers.update(headers)
            
            if response.status_code == 200:
                result = response.json()
                issue_count = len(result["issues"])
                self.print_result("GET /issues", True, f"Retrieved {issue_count} issues")
                return True
            else:
                self.print_result("GET /issues", False, f"Status: {response.status_code}, Error: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("GET /issues", False, f"Exception: {str(e)}")
            return False
    
    def test_get_issue_by_id(self):
        """Test GET /issues/{issue_id}"""
        print("🧪 Testing GET /issues/{issue_id}...")
        
        if not self.test_issue_id:
            self.print_result("GET /issues/{issue_id}", False, "No test issue ID available")
            return False
        
        try:
            # Remove auth header temporarily for public endpoint
            headers = self.session.headers.copy()
            if "Authorization" in self.session.headers:
                del self.session.headers["Authorization"]
            
            response = self.session.get(f"{BASE_URL}/issues/{self.test_issue_id}")
            
            # Restore headers
            self.session.headers.update(headers)
            
            if response.status_code == 200:
                result = response.json()
                self.print_result("GET /issues/{issue_id}", True, f"Retrieved issue: {result['title']}")
                return True
            else:
                self.print_result("GET /issues/{issue_id}", False, f"Status: {response.status_code}, Error: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("GET /issues/{issue_id}", False, f"Exception: {str(e)}")
            return False
    
    def test_update_issue(self):
        """Test PATCH /issues/{issue_id}"""
        print("🧪 Testing PATCH /issues/{issue_id}...")
        
        if not self.test_issue_id:
            self.print_result("PATCH /issues/{issue_id}", False, "No test issue ID available")
            return False
        
        try:
            update_data = {
                "title": "Updated Road Pothole Issue",
                "priority": 4,
                "status": 1  # In progress
            }
            
            response = self.session.patch(f"{BASE_URL}/issues/{self.test_issue_id}", json=update_data)
            
            if response.status_code == 200:
                result = response.json()
                self.print_result("PATCH /issues/{issue_id}", True, f"Updated issue: {result['title']}")
                return True
            else:
                self.print_result("PATCH /issues/{issue_id}", False, f"Status: {response.status_code}, Error: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("PATCH /issues/{issue_id}", False, f"Exception: {str(e)}")
            return False
    
    def test_delete_issue(self):
        """Test DELETE /issues/{issue_id}"""
        print("🧪 Testing DELETE /issues/{issue_id}...")
        
        if not self.test_issue_id:
            self.print_result("DELETE /issues/{issue_id}", False, "No test issue ID available")
            return False
        
        try:
            # First, clean up any remaining media files
            try:
                headers = {"Authorization": f"Bearer {self.auth_token}"}
                media_response = self.session.get(
                    f"{BASE_URL}/issues/media/{self.test_issue_id}",
                    headers=headers
                )
                if media_response.status_code == 200:
                    media_list = media_response.json()
                    for media in media_list:
                        self.session.delete(
                            f"{BASE_URL}/issues/media/{media['id']}",
                            headers=headers
                        )
            except:
                pass  # Ignore cleanup errors
                
            # Now delete the issue with proper authorization
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.delete(f"{BASE_URL}/issues/{self.test_issue_id}", headers=headers)
            
            if response.status_code == 204:
                self.print_result("DELETE /issues/{issue_id}", True, "Issue deleted successfully")
                return True
            else:
                self.print_result("DELETE /issues/{issue_id}", False, f"Status: {response.status_code}, Error: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("DELETE /issues/{issue_id}", False, f"Exception: {str(e)}")
            return False
    
    def test_upload_media_to_issue(self):
        """Test uploading media files to an issue"""
        try:
            # Create a test file in memory
            test_file_content = b"This is a test image file content"
            
            # Prepare files for upload
            files = {
                'files': ('test_image.jpg', test_file_content, 'image/jpeg'),
            }
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            response = self.session.post(
                f"{BASE_URL}/issues/media/{self.test_issue_id}",
                files=files,
                headers=headers
            )
            
            if response.status_code == 201:
                data = response.json()
                if "message" in data and "uploaded_files" in data:
                    # Store media info for later tests
                    self.test_media_files = data.get("uploaded_files", [])
                    self.print_result("POST /issues/media/{issue_id}", True, f"Uploaded {len(self.test_media_files)} files")
                    return True
                else:
                    self.print_result("POST /issues/media/{issue_id}", False, "Invalid response format")
                    return False
            else:
                self.print_result("POST /issues/media/{issue_id}", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("POST /issues/media/{issue_id}", False, f"Exception: {str(e)}")
            return False
    
    def test_get_issue_media(self):
        """Test getting all media files for an issue"""
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            response = self.session.get(
                f"{BASE_URL}/issues/media/{self.test_issue_id}",
                headers=headers
            )
            
            if response.status_code == 200:
                media_list = response.json()
                if isinstance(media_list, list):
                    # Store first media ID for deletion test
                    if media_list:
                        self.test_media_id = media_list[0]["id"]
                        self.print_result("GET /issues/media/{issue_id}", True, f"Retrieved {len(media_list)} media files")
                        
                        # Validate media structure
                        media = media_list[0]
                        required_fields = ["id", "issue_id", "path", "filename", "file_size", "file_type", "created_at"]
                        if all(field in media for field in required_fields):
                            self.print_result("Media Response Structure", True, "All required fields present")
                        else:
                            self.print_result("Media Response Structure", False, "Missing required fields")
                            
                        return True
                    else:
                        self.print_result("GET /issues/media/{issue_id}", False, "No media files found")
                        return False
                else:
                    self.print_result("GET /issues/media/{issue_id}", False, "Response is not a list")
                    return False
            else:
                self.print_result("GET /issues/media/{issue_id}", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("GET /issues/media/{issue_id}", False, f"Exception: {str(e)}")
            return False
    
    def test_serve_media_file(self):
        """Test serving/downloading a media file"""
        try:
            if not hasattr(self, 'test_media_id'):
                self.print_result("GET /issues/serve/{media_id}", False, "No media ID available for testing")
                return False
            
            response = self.session.get(f"{BASE_URL}/issues/serve/{self.test_media_id}")
            
            if response.status_code == 200:
                # Check if response has file content
                if len(response.content) > 0:
                    self.print_result("GET /issues/serve/{media_id}", True, f"File served successfully ({len(response.content)} bytes)")
                    return True
                else:
                    self.print_result("GET /issues/serve/{media_id}", False, "Empty file content")
                    return False
            else:
                self.print_result("GET /issues/serve/{media_id}", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("GET /issues/serve/{media_id}", False, f"Exception: {str(e)}")
            return False
    
    def test_upload_multiple_media_files(self):
        """Test uploading multiple media files at once"""
        try:
            # Create multiple test files
            files = [
                ('files', ('test_image1.jpg', b"Test image 1 content", 'image/jpeg')),
                ('files', ('test_image2.png', b"Test image 2 content", 'image/png')),
                ('files', ('test_document.pdf', b"Test PDF content", 'application/pdf')),
            ]
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            response = self.session.post(
                f"{BASE_URL}/issues/media/{self.test_issue_id}",
                files=files,
                headers=headers
            )
            
            if response.status_code == 201:
                data = response.json()
                uploaded_files = data.get("uploaded_files", [])
                if len(uploaded_files) == 3:
                    self.print_result("Upload Multiple Media Files", True, f"Successfully uploaded {len(uploaded_files)} files")
                    return True
                else:
                    self.print_result("Upload Multiple Media Files", False, f"Expected 3 files, got {len(uploaded_files)}")
                    return False
            else:
                self.print_result("Upload Multiple Media Files", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("Upload Multiple Media Files", False, f"Exception: {str(e)}")
            return False
    
    def test_upload_invalid_media_file(self):
        """Test uploading invalid file type"""
        try:
            # Try to upload a .txt file (not allowed)
            files = {
                'files': ('test_file.txt', b"This is a text file", 'text/plain'),
            }
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            response = self.session.post(
                f"{BASE_URL}/issues/media/{self.test_issue_id}",
                files=files,
                headers=headers
            )
            
            if response.status_code == 400:
                self.print_result("Upload Invalid Media File", True, "Invalid file type correctly rejected")
                return True
            else:
                self.print_result("Upload Invalid Media File", False, f"Expected 400, got {response.status_code}")
                return False
                
        except Exception as e:
            self.print_result("Upload Invalid Media File", False, f"Exception: {str(e)}")
            return False
    
    def test_delete_media_file(self):
        """Test deleting a specific media file"""
        try:
            if not hasattr(self, 'test_media_id'):
                self.print_result("DELETE /issues/media/{media_id}", False, "No media ID available for testing")
                return False
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            response = self.session.delete(
                f"{BASE_URL}/issues/media/{self.test_media_id}",
                headers=headers
            )
            
            if response.status_code == 204:
                self.print_result("DELETE /issues/media/{media_id}", True, "Media file deleted successfully")
                return True
            else:
                self.print_result("DELETE /issues/media/{media_id}", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("DELETE /issues/media/{media_id}", False, f"Exception: {str(e)}")
            return False
    
    def test_media_authorization(self):
        """Test media operations require proper authorization"""
        try:
            # Create a separate session without auth headers
            unauth_session = requests.Session()
            
            # Test without auth token
            test_file_content = b"Test content"
            files = {
                'files': ('test.jpg', test_file_content, 'image/jpeg'),
            }
            
            response = unauth_session.post(
                f"{BASE_URL}/issues/media/{self.test_issue_id}",
                files=files
                # No authorization header
            )
            
            if response.status_code == 401:
                self.print_result("Media Authorization Check", True, "Unauthorized access correctly blocked (401)")
                return True
            elif response.status_code == 422:
                # FastAPI returns 422 for missing dependencies sometimes
                self.print_result("Media Authorization Check", True, "Unauthorized access correctly blocked (422)")
                return True
            elif response.status_code == 403:
                # FastAPI returns 403 for forbidden access
                self.print_result("Media Authorization Check", True, "Unauthorized access correctly blocked (403)")
                return True
            else:
                self.print_result("Media Authorization Check", False, f"Expected 401/422/403, got {response.status_code}")
                return False
                
        except Exception as e:
            self.print_result("Media Authorization Check", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all issue tests"""
        print("🚀 Starting Issues API Testing...")
        print("=" * 60)
        
        if not self.setup_auth():
            print("❌ Authentication setup failed")
            return
        
        tests = [
            self.test_create_issue,
            self.test_get_all_issues,
            self.test_get_issue_by_id,
            self.test_update_issue,
            self.test_upload_media_to_issue,
            self.test_get_issue_media,
            self.test_serve_media_file,
            self.test_upload_multiple_media_files,
            self.test_upload_invalid_media_file,
            self.test_media_authorization,
            self.test_delete_media_file,
            self.test_delete_issue
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 60)
        print("🏁 Issues & Media API Testing Complete!")
        print(f"📊 Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Issues & Media APIs are working correctly!")
        else:
            print("⚠️ Some tests failed. Please check the implementation.")

if __name__ == "__main__":
    tester = IssuesTester()
    tester.run_all_tests()
