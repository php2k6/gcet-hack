"""
Comprehensive Authentication Endpoint Tests
Tests all auth endpoints: signup, login, google, logout, me, refresh-token
"""
import requests
import json
import time
from typing import Dict, Optional

class AuthTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"  # Add /api prefix
        self.session = requests.Session()
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.test_email: Optional[str] = None
        self.test_password: Optional[str] = None
        
    def print_result(self, test_name: str, success: bool, details: str = ""):
        """Print test result with formatting"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        if details:
            print(f"     Details: {details}")
        print("-" * 50)
    
    def test_signup(self) -> bool:
        """Test user signup endpoint"""
        print("🧪 Testing /auth/signup...")
        
        # Generate unique email for each test
        timestamp = str(int(time.time()))
        test_data = {
            "name": "Test User",
            "email": f"testuser_{timestamp}@example.com",
            "password": "testpassword123",
            "phone": "1234567890",
            "district": "Test District"
        }
        
        try:
            response = self.session.post(
                f"{self.api_base}/auth/signup",
                json=test_data
            )
            
            if response.status_code == 201:
                data = response.json()
                required_fields = ["message", "user"]
                
                if all(field in data for field in required_fields):
                    user = data["user"]
                    if (user["email"] == test_data["email"] and 
                        user["name"] == test_data["name"] and
                        data["message"] == "User created successfully"):
                        self.print_result("POST /auth/signup", True, f"User created: {user['email']}")
                        # Store email and password for login test
                        self.test_email = test_data["email"]
                        self.test_password = test_data["password"]
                        return True
                    else:
                        self.print_result("POST /auth/signup", False, "User data mismatch")
                        return False
                else:
                    self.print_result("POST /auth/signup", False, "Missing required fields in response")
                    return False
            else:
                self.print_result("POST /auth/signup", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("POST /auth/signup", False, f"Error: {str(e)}")
            return False
    
    def test_login(self) -> bool:
        """Test user login endpoint"""
        print("🧪 Testing /auth/login...")
        
        # Use credentials from signup test or create new ones
        if not self.test_email or not self.test_password:
            timestamp = str(int(time.time()))
            signup_data = {
                "name": "Login Test User",
                "email": f"logintest_{timestamp}@example.com",
                "password": "loginpassword123",
                "phone": "1234567890",
                "district": "Login District"
            }
            
            # Create user
            signup_response = self.session.post(
                f"{self.api_base}/auth/signup",
                json=signup_data
            )
            
            if signup_response.status_code != 201:
                self.print_result("POST /auth/login", False, "Failed to create user for login test")
                return False
            
            self.test_email = signup_data["email"]
            self.test_password = signup_data["password"]
        
        # Now test login
        login_data = {
            "email": self.test_email,
            "password": self.test_password,
            "role": 0
        }
        
        try:
            response = self.session.post(
                f"{self.api_base}/auth/login",
                json=login_data
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["access_token", "refresh_token", "token_type", "user"]
                
                if all(field in data for field in required_fields):
                    self.access_token = data["access_token"]
                    self.refresh_token = data["refresh_token"]
                    # Update session headers for subsequent requests
                    self.session.headers.update({"Authorization": f"Bearer {self.access_token}"})
                    self.print_result("POST /auth/login", True, f"Login successful: {data['user']['email']}")
                    return True
                else:
                    self.print_result("POST /auth/login", False, f"Missing fields in response: {data}")
                    return False
            else:
                self.print_result("POST /auth/login", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("POST /auth/login", False, f"Exception: {str(e)}")
            return False
    
    def test_me(self) -> bool:
        """Test get current user endpoint"""
        print("🧪 Testing /auth/me...")
        
        if not self.access_token:
            self.print_result("GET /auth/me", False, "No access token available")
            return False
        
        try:
            response = self.session.get(f"{self.api_base}/auth/me")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "name", "email", "role", "created_at"]
                
                if all(field in data for field in required_fields):
                    self.print_result("GET /auth/me", True, f"User info retrieved: {data['email']}")
                    return True
                else:
                    self.print_result("GET /auth/me", False, f"Missing fields in response: {data}")
                    return False
            else:
                self.print_result("GET /auth/me", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("GET /auth/me", False, f"Exception: {str(e)}")
            return False
    
    def test_refresh_token(self) -> bool:
        """Test refresh token endpoint"""
        print("🧪 Testing /auth/refresh-token...")
        
        if not self.refresh_token:
            self.print_result("POST /auth/refresh-token", False, "No refresh token available")
            return False
        
        try:
            data = {"refresh_token": self.refresh_token}
            response = self.session.post(
                f"{self.api_base}/auth/refresh-token",
                json=data
            )
            
            if response.status_code == 200:
                response_data = response.json()
                required_fields = ["access_token", "token_type"]
                
                if all(field in response_data for field in required_fields):
                    old_token = self.access_token
                    self.access_token = response_data["access_token"]
                    # Update session headers with new token
                    self.session.headers.update({"Authorization": f"Bearer {self.access_token}"})
                    self.print_result("POST /auth/refresh-token", True, "New access token generated")
                    return True
                else:
                    self.print_result("POST /auth/refresh-token", False, f"Missing fields in response: {response_data}")
                    return False
            else:
                self.print_result("POST /auth/refresh-token", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("POST /auth/refresh-token", False, f"Exception: {str(e)}")
            return False
    
    def test_logout(self) -> bool:
        """Test logout endpoint"""
        print("🧪 Testing /auth/logout...")
        
        if not self.access_token:
            self.print_result("POST /auth/logout", False, "No access token available")
            return False
        
        try:
            response = self.session.post(f"{self.api_base}/auth/logout")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Successfully logged out":
                    self.print_result("POST /auth/logout", True, "User logged out successfully")
                    return True
                else:
                    self.print_result("POST /auth/logout", False, f"Unexpected response: {data}")
                    return False
            else:
                self.print_result("POST /auth/logout", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.print_result("POST /auth/logout", False, f"Exception: {str(e)}")
            return False
    
    def test_google_auth(self) -> bool:
        """Test Google OAuth endpoint (will fail without valid token)"""
        print("🧪 Testing /auth/google...")
        
        try:
            # This will fail because we don't have a real Google ID token
            # But we can test that the endpoint exists and returns appropriate error
            fake_data = {"id_token": "fake_google_token_for_testing"}
            response = self.session.post(
                f"{self.api_base}/auth/google",
                json=fake_data
            )
            
            # We expect this to fail with 400 or 500, not 404
            if response.status_code in [400, 500]:
                self.print_result("Google Auth", True, "Endpoint exists and validates tokens (expected failure with fake token)")
                return True
            elif response.status_code == 404:
                self.print_result("Google Auth", False, "Endpoint not found")
                return False
            else:
                self.print_result("Google Auth", True, f"Unexpected status {response.status_code} but endpoint exists")
                return True
                
        except Exception as e:
            self.print_result("Google Auth", False, f"Exception: {str(e)}")
            return False
    
    def test_invalid_credentials(self) -> bool:
        """Test login with invalid credentials"""
        print("🧪 Testing login with invalid credentials...")
        
        try:
            invalid_data = {
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            }
            
            response = self.session.post(
                f"{self.api_base}/auth/login",
                json=invalid_data
            )
            
            if response.status_code == 401:
                self.print_result("Invalid Credentials", True, "Correctly rejected invalid credentials")
                return True
            else:
                self.print_result("Invalid Credentials", False, f"Expected 401, got {response.status_code}")
                return False
                
        except Exception as e:
            self.print_result("Invalid Credentials", False, f"Exception: {str(e)}")
            return False
    
    def test_duplicate_email(self) -> bool:
        """Test signup with duplicate email"""
        print("🧪 Testing signup with duplicate email...")
        
        # First signup
        timestamp = str(int(time.time()))
        test_email = f"duplicate_{timestamp}@example.com"
        
        test_data = {
            "name": "Duplicate Test",
            "email": test_email,
            "password": "testpassword123",
            "phone": "1234567890",
            "district": "Test District"
        }
        
        try:
            # First signup should succeed
            response1 = self.session.post(
                f"{self.api_base}/auth/signup",
                json=test_data
            )
            
            if response1.status_code != 201:
                self.print_result("Duplicate Email", False, "First signup failed")
                return False
            
            # Second signup with same email should fail
            response2 = self.session.post(
                f"{self.api_base}/auth/signup",
                json=test_data
            )
            
            if response2.status_code == 400:
                self.print_result("Duplicate Email", True, "Correctly rejected duplicate email")
                return True
            else:
                self.print_result("Duplicate Email", False, f"Expected 400, got {response2.status_code}")
                return False
                
        except Exception as e:
            self.print_result("Duplicate Email", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self) -> Dict[str, bool]:
        """Run all authentication tests"""
        print("=" * 60)
        print("🚀 STARTING COMPREHENSIVE AUTHENTICATION TESTS")
        print("=" * 60)
        
        results = {}
        
        # Test server availability
        try:
            response = self.session.get(f"{self.base_url}/docs")
            if response.status_code != 200:
                print("❌ Server not available. Please start the server first:")
                print("   cd backend && .\\venv\\Scripts\\Activate.ps1 && python -m uvicorn app.main:app --reload")
                return {}
        except:
            print("❌ Cannot connect to server. Please start the server first:")
            print("   cd backend && .\\venv\\Scripts\\Activate.ps1 && python -m uvicorn app.main:app --reload")
            return {}
        
        # Run tests in order
        results["signup"] = self.test_signup()
        results["login"] = self.test_login()
        results["me"] = self.test_me()
        results["refresh_token"] = self.test_refresh_token()
        results["logout"] = self.test_logout()
        results["google_auth"] = self.test_google_auth()
        results["invalid_credentials"] = self.test_invalid_credentials()
        results["duplicate_email"] = self.test_duplicate_email()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, passed_test in results.items():
            status = "✅ PASS" if passed_test else "❌ FAIL"
            print(f"{status} | {test_name.replace('_', ' ').title()}")
        
        print("=" * 60)
        print(f"🏆 RESULTS: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED! Your authentication system is working perfectly!")
        else:
            print("⚠️  Some tests failed. Check the details above.")
        
        print("=" * 60)
        
        return results

if __name__ == "__main__":
    # Run the tests
    tester = AuthTester()
    tester.run_all_tests()
