"""
Quick test script for Authority API
Tests authority endpoints with existing test data
"""
import requests
import json
from datetime import datetime
import time

BASE_URL = "http://localhost:8000/api"

class AuthorityTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.admin_token = None
        self.authority_token = None
        self.test_authority_id = None
        
    def print_result(self, test_name, success, details=""):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        if details:
            print(f"     Details: {details}")
        print("-" * 60)
    
    def setup_auth(self):
        """Set up authentication with existing admin user"""
        print("🔧 Setting up authentication...")
        
        # Use existing admin user
        admin_login_data = {
            "email": "admin@admin.com",
            "password": "admin",
            "role": 2  # Admin role
        }
        
        login_response = self.session.post(f"{BASE_URL}/auth/login", json=admin_login_data)
        if login_response.status_code != 200:
            self.print_result("Admin Login", False, f"Status: {login_response.status_code}, Error: {login_response.text}")
            return False
        
        login_result = login_response.json()
        self.authority_token = login_result["access_token"]
        
        # Set auth header
        self.session.headers.update({"Authorization": f"Bearer {self.authority_token}"})
        
        print("✅ Admin authentication setup successful")
        return True
    
    def get_test_authority_id(self):
        """Get a test authority ID from the database"""
        # We'll use a simple approach - try to get authorities from the database
        # For now, we'll use the authority ID that was created by our test script
        # This would be better if we had a GET /authorities endpoint
        self.test_authority_id = "886617f2-441d-4ac4-8336-7c45827dc83e"  # Water Department ID from test creation
        return True
    
    def test_get_authority_by_id(self):
        """Test GET /authority/{authority_id}"""
        print("🧪 Testing GET /authority/{authority_id}...")
        
        if not self.get_test_authority_id():
            self.print_result("GET /authority/{authority_id}", False, "No test authority ID available")
            return False
        
        try:
            response = self.session.get(f"{BASE_URL}/authority/{self.test_authority_id}")
            
            if response.status_code == 200:
                result = response.json()
                self.print_result("GET /authority/{authority_id}", True, f"Retrieved authority: {result['name']}")
                return True
            else:
                self.print_result("GET /authority/{authority_id}", False, f"Status: {response.status_code}, Error: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("GET /authority/{authority_id}", False, f"Exception: {str(e)}")
            return False
    
    def test_update_authority(self):
        """Test PATCH /authority/{authority_id}"""
        print("🧪 Testing PATCH /authority/{authority_id}...")
        
        if not self.test_authority_id:
            self.print_result("PATCH /authority/{authority_id}", False, "No test authority ID available")
            return False
        
        try:
            update_data = {
                "name": "Updated Municipal Water Department",
                "contact_phone": "555-0199"
            }
            
            response = self.session.patch(f"{BASE_URL}/authority/{self.test_authority_id}", json=update_data)
            
            if response.status_code == 200:
                result = response.json()
                self.print_result("PATCH /authority/{authority_id}", True, f"Updated authority: {result['name']}")
                return True
            else:
                self.print_result("PATCH /authority/{authority_id}", False, f"Status: {response.status_code}, Error: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("PATCH /authority/{authority_id}", False, f"Exception: {str(e)}")
            return False
    
    def test_unauthorized_access(self):
        """Test access control - citizen user trying to access authority"""
        print("🧪 Testing unauthorized access...")
        
        try:
            # Create a regular citizen user
            timestamp = int(time.time())
            citizen_email = f"citizen_{timestamp}@example.com"
            
            citizen_signup = {
                "name": "Test Citizen",
                "email": citizen_email,
                "password": "citizenpass123",
                "phone": "1111111111",
                "district": "Test District"
            }
            
            signup_response = self.session.post(f"{BASE_URL}/auth/signup", json=citizen_signup)
            
            citizen_login = {
                "email": citizen_email,
                "password": "citizenpass123",
                "role": 0  # Citizen role
            }
            
            login_response = self.session.post(f"{BASE_URL}/auth/login", json=citizen_login)
            
            if login_response.status_code == 200:
                citizen_token = login_response.json()["access_token"]
                
                # Try to access authority with citizen token
                headers = {"Authorization": f"Bearer {citizen_token}"}
                response = requests.get(f"{BASE_URL}/authority/{self.test_authority_id}", headers=headers)
                
                if response.status_code == 403:
                    self.print_result("Unauthorized Access Control", True, "Correctly denied citizen access to authority")
                    return True
                else:
                    self.print_result("Unauthorized Access Control", False, f"Expected 403, got {response.status_code}")
                    return False
            else:
                self.print_result("Unauthorized Access Control", False, "Failed to create test citizen")
                return False
                
        except Exception as e:
            self.print_result("Unauthorized Access Control", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all authority tests"""
        print("🚀 Starting Authority API Testing...")
        print("=" * 60)
        
        if not self.setup_auth():
            print("❌ Authentication setup failed")
            return
        
        tests = [
            self.test_get_authority_by_id,
            self.test_update_authority,
            self.test_unauthorized_access
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 60)
        print("🏁 Authority API Testing Complete!")
        print(f"📊 Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Authority API is working correctly!")
        else:
            print("⚠️ Some tests failed. Please check the implementation.")

if __name__ == "__main__":
    tester = AuthorityTester()
    tester.run_all_tests()
