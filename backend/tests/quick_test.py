"""
Quick Test Runner
Run this to quickly test all auth endpoints
"""
import os
import sys
import subprocess
import time

def run_server_and_test():
    """Start server and run tests"""
    print("🚀 Starting FastAPI server...")
    
    # Start server in background
    server_process = subprocess.Popen([
        "python", "-m", "uvicorn", "app.main:app", 
        "--host", "0.0.0.0", "--port", "8000"
    ], cwd=".", stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    # Wait for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(3)
    
    try:
        # Import and run tests
        from test_auth_endpoints import AuthTester
        
        print("🧪 Running authentication tests...")
        tester = AuthTester()
        results = tester.run_all_tests()
        
        return results
        
    finally:
        # Stop server
        print("🛑 Stopping server...")
        server_process.terminate()
        server_process.wait()

if __name__ == "__main__":
    # Change to backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    os.chdir("..")  # Go to backend root
    
    print("📁 Current directory:", os.getcwd())
    
    # Check if virtual environment is activated
    if "venv" not in sys.executable and "venv" not in os.environ.get("VIRTUAL_ENV", ""):
        print("⚠️  Virtual environment not detected!")
        print("Please activate it first:")
        print("   .\\venv\\Scripts\\Activate.ps1")
        print("   python tests/quick_test.py")
        sys.exit(1)
    
    results = run_server_and_test()
