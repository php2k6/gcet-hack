#!/usr/bin/env python3
"""
Test Runner Script
Runs all endpoint tests in sequence
"""
import subprocess
import sys
import os

def run_test(test_file, test_name):
    """Run a single test file and return success status"""
    print(f"\n{'='*60}")
    print(f"🧪 RUNNING {test_name}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run([sys.executable, test_file], 
                              capture_output=False, 
                              text=True, 
                              cwd=os.getcwd())
        
        if result.returncode == 0:
            print(f"\n✅ {test_name} PASSED")
            return True
        else:
            print(f"\n❌ {test_name} FAILED")
            return False
            
    except Exception as e:
        print(f"\n❌ {test_name} ERROR: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🚀 STARTING FULL TEST SUITE")
    print("🔧 Make sure the server is running on http://localhost:8000")
    
    tests = [
        ("tests/test_auth_endpoints.py", "AUTHENTICATION ENDPOINTS"),
        ("tests/test_user_endpoints.py", "USER MANAGEMENT ENDPOINTS"),
        ("tests/test_issue_endpoints.py", "ISSUES MANAGEMENT ENDPOINTS"),
        ("tests/test_authority_endpoints.py", "AUTHORITY MANAGEMENT ENDPOINTS"),
        ("tests/test_vote_endpoints.py", "VOTE MANAGEMENT ENDPOINTS"),
        ("tests/test_stats_endpoints.py", "STATS & LEADERBOARDS ENDPOINTS")
    ]
    
    passed = 0
    total = len(tests)
    
    for test_file, test_name in tests:
        if run_test(test_file, test_name):
            passed += 1
    
    print(f"\n{'='*60}")
    print(f"🏆 FINAL RESULTS")
    print(f"{'='*60}")
    print(f"📊 Tests Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Your API is working perfectly!")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed. Please check the implementation.")
        sys.exit(1)

if __name__ == "__main__":
    main()
