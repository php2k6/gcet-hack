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
            response = self.session.delete(f"{BASE_URL}/issues/{self.test_issue_id}")
            
            if response.status_code == 204:
                self.print_result("DELETE /issues/{issue_id}", True, "Issue deleted successfully")
                return True
            else:
                self.print_result("DELETE /issues/{issue_id}", False, f"Status: {response.status_code}, Error: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("DELETE /issues/{issue_id}", False, f"Exception: {str(e)}")
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
            self.test_delete_issue
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 60)
        print("🏁 Issues API Testing Complete!")
        print(f"📊 Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Issues API is working correctly!")
        else:
            print("⚠️ Some tests failed. Please check the implementation.")

if __name__ == "__main__":
    tester = IssuesTester()
    tester.run_all_tests()
