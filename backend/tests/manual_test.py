"""
Manual Test Script - Run with server already running
Use this when you want to test endpoints manually with your own server
"""
from test_auth_endpoints import AuthTester

def main():
    print("🔧 MANUAL TESTING MODE")
    print("Make sure your server is running on http://localhost:8000")
    print("Start server with: python -m uvicorn app.main:app --reload")
    print()
    
    choice = input("Is your server running? (y/n): ").lower()
    if choice != 'y':
        print("Start your server first, then run this script again.")
        return
    
    # Run tests
    tester = AuthTester()
    results = tester.run_all_tests()
    
    # Detailed analysis
    print("\n" + "="*60)
    print("🔍 DETAILED ANALYSIS")
    print("="*60)
    
    failed_tests = [test for test, passed in results.items() if not passed]
    
    if failed_tests:
        print("❌ Failed tests:")
        for test in failed_tests:
            print(f"   - {test.replace('_', ' ').title()}")
        
        print("\n💡 Common fixes:")
        print("   - Make sure database is running (PostgreSQL)")
        print("   - Check if all tables are migrated (alembic upgrade head)")
        print("   - Verify .env file has correct DATABASE_URL")
        print("   - Ensure Google Client ID is set (for Google auth)")
    else:
        print("🎉 All tests passed! Your API is working perfectly!")

if __name__ == "__main__":
    main()
