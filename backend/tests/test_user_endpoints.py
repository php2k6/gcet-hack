"""
User Endpoints Test Script
Tests all user management endpoints
"""
import requests
import json
import time
from typing import Dict, Optional

class UserTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.session = requests.Session()
        self.access_token: Optional[str] = None
        self.user_id: Optional[str] = None
        
    def print_result(self, test_name: str, success: bool, details: str = ""):
        """Print test result with formatting"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        if details:
            print(f"     Details: {details}")
        print("-" * 60)
    
    def setup_auth(self) -> bool:
        """Setup authentication by creating a test user"""
        print("🔧 Setting up authentication...")
        
        try:
            # Create test user
            timestamp = str(int(time.time()))
            signup_data = {
                "name": "Test User",
                "email": f"testuser_{timestamp}@example.com",
                "password": "testpass123",
                "phone": "1234567890",
                "district": "Test District"
            }
            
            # Step 1: Signup (no tokens returned)
            signup_response = requests.post(f"{self.api_base}/auth/signup", json=signup_data)
            
            if signup_response.status_code != 201:
                print(f"❌ Signup failed: {signup_response.text}")
                return False
            
            signup_result = signup_response.json()
            self.user_id = signup_result["user"]["id"]
            
            # Step 2: Login to get tokens
            login_data = {
                "email": signup_data["email"],
                "password": signup_data["password"],
                "role": 0
            }
            
            login_response = requests.post(f"{self.api_base}/auth/login", json=login_data)
            
            if login_response.status_code == 200:
                data = login_response.json()
                self.access_token = data["access_token"]
                self.session.headers.update({"Authorization": f"Bearer {self.access_token}"})
                print("✅ Authentication setup successful")
                return True
            else:
                print(f"❌ Login failed: {login_response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Auth setup error: {str(e)}")
            return False
    
    def test_get_current_user(self) -> bool:
        """Test GET /user/me"""
        print("🧪 Testing GET /user/me...")
        
        try:
            response = self.session.get(f"{self.api_base}/user/me")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "name", "email", "role", "created_at"]
                
                if all(field in data for field in required_fields):
                    self.print_result("GET /user/me", True, f"User: {data['name']} ({data['email']})")
                    return True
                else:
                    self.print_result("GET /user/me", False, "Missing required fields in response")
                    return False
            else:
                self.print_result("GET /user/me", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.print_result("GET /user/me", False, f"Error: {str(e)}")
            return False
    
    def test_update_current_user(self) -> bool:
        """Test PATCH /user/me"""
        print("🧪 Testing PATCH /user/me...")
        
        try:
            update_data = {
                "name": "Updated Test User",
                "phone": "9876543210",
                "district": "Updated District"
            }
            
            response = self.session.patch(f"{self.api_base}/user/me", json=update_data)
            
            if response.status_code == 200:
                data = response.json()
                if (data["name"] == "Updated Test User" and 
                    data["phone"] == "9876543210" and 
                    data["district"] == "Updated District"):
                    self.print_result("PATCH /user/me", True, "User profile updated successfully")
                    return True
                else:
                    self.print_result("PATCH /user/me", False, "Update data not reflected")
                    return False
            else:
                self.print_result("PATCH /user/me", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.print_result("PATCH /user/me", False, f"Error: {str(e)}")
            return False
    
    def test_get_user_by_id(self) -> bool:
        """Test GET /user/{user_id}"""
        print("🧪 Testing GET /user/{user_id}...")
        
        try:
            response = self.session.get(f"{self.api_base}/user/{self.user_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data["id"] == self.user_id:
                    self.print_result("GET /user/{user_id}", True, f"Retrieved user: {data['name']}")
                    return True
                else:
                    self.print_result("GET /user/{user_id}", False, "Wrong user returned")
                    return False
            else:
                self.print_result("GET /user/{user_id}", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.print_result("GET /user/{user_id}", False, f"Error: {str(e)}")
            return False
    
    def test_get_all_users_unauthorized(self) -> bool:
        """Test GET /user/all (should fail for non-admin)"""
        print("🧪 Testing GET /user/all (unauthorized)...")
        
        try:
            response = self.session.get(f"{self.api_base}/user/all")
            
            if response.status_code == 403:
                self.print_result("GET /user/all (unauthorized)", True, "Correctly denied access for non-admin")
                return True
            else:
                self.print_result("GET /user/all (unauthorized)", False, f"Expected 403, got {response.status_code}. Response: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("GET /user/all (unauthorized)", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all user endpoint tests"""
        print("🚀 Starting User Endpoints Testing...")
        print("=" * 60)
        
        if not self.setup_auth():
            print("❌ Cannot proceed without authentication")
            return
        
        tests = [
            self.test_get_current_user,
            self.test_update_current_user,
            self.test_get_user_by_id,
            self.test_get_all_users_unauthorized,
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 60)
        print(f"🏁 User Endpoints Testing Complete!")
        print(f"📊 Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! User endpoints are working correctly!")
        else:
            print("⚠️  Some tests failed. Please check the implementation.")

if __name__ == "__main__":
    tester = UserTester()
    tester.run_all_tests()
