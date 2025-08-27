"""
Performance Test Script
Tests the authentication endpoints under load
"""
import time
import threading
import requests
from concurrent.futures import ThreadPoolExecutor
from test_auth_endpoints import AuthTester

class PerformanceTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.results = []
        
    def single_signup_test(self, thread_id: int):
        """Single signup test for performance testing"""
        start_time = time.time()
        
        try:
            tester = AuthTester(self.base_url)
            success = tester.test_signup()
            
            end_time = time.time()
            duration = end_time - start_time
            
            return {
                "thread_id": thread_id,
                "success": success,
                "duration": duration,
                "error": None
            }
        except Exception as e:
            end_time = time.time()
            duration = end_time - start_time
            
            return {
                "thread_id": thread_id,
                "success": False,
                "duration": duration,
                "error": str(e)
            }
    
    def run_load_test(self, num_threads: int = 10, test_duration: int = 30):
        """Run load test with multiple concurrent requests"""
        print(f"🚀 Starting load test: {num_threads} threads for {test_duration} seconds")
        
        start_time = time.time()
        futures = []
        
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            thread_id = 0
            
            while time.time() - start_time < test_duration:
                future = executor.submit(self.single_signup_test, thread_id)
                futures.append(future)
                thread_id += 1
                time.sleep(0.1)  # Small delay between requests
            
            # Collect results
            for future in futures:
                result = future.result()
                self.results.append(result)
        
        self.analyze_results()
    
    def analyze_results(self):
        """Analyze performance test results"""
        if not self.results:
            print("❌ No results to analyze")
            return
        
        total_requests = len(self.results)
        successful_requests = sum(1 for r in self.results if r["success"])
        failed_requests = total_requests - successful_requests
        
        durations = [r["duration"] for r in self.results if r["success"]]
        
        if durations:
            avg_duration = sum(durations) / len(durations)
            min_duration = min(durations)
            max_duration = max(durations)
        else:
            avg_duration = min_duration = max_duration = 0
        
        print("\n" + "="*60)
        print("📊 PERFORMANCE TEST RESULTS")
        print("="*60)
        print(f"Total Requests: {total_requests}")
        print(f"Successful: {successful_requests} ({successful_requests/total_requests*100:.1f}%)")
        print(f"Failed: {failed_requests} ({failed_requests/total_requests*100:.1f}%)")
        print(f"Average Response Time: {avg_duration:.3f}s")
        print(f"Min Response Time: {min_duration:.3f}s")
        print(f"Max Response Time: {max_duration:.3f}s")
        
        if successful_requests > 0:
            requests_per_second = successful_requests / max(durations) if durations else 0
            print(f"Estimated RPS: {requests_per_second:.1f}")
        
        # Show errors
        errors = [r["error"] for r in self.results if r["error"]]
        if errors:
            print(f"\n❌ Common Errors:")
            error_counts = {}
            for error in errors:
                error_counts[error] = error_counts.get(error, 0) + 1
            
            for error, count in error_counts.items():
                print(f"   {count}x: {error}")
        
        print("="*60)

def main():
    print("⚡ AUTHENTICATION PERFORMANCE TESTER")
    print("Make sure your server is running on http://localhost:8000")
    print()
    
    choice = input("Is your server running? (y/n): ").lower()
    if choice != 'y':
        print("Start your server first, then run this script again.")
        return
    
    # Get test parameters
    try:
        num_threads = int(input("Number of concurrent threads (default 5): ") or "5")
        test_duration = int(input("Test duration in seconds (default 10): ") or "10")
    except ValueError:
        print("Using default values: 5 threads, 10 seconds")
        num_threads = 5
        test_duration = 10
    
    # Run performance test
    tester = PerformanceTester()
    tester.run_load_test(num_threads, test_duration)

if __name__ == "__main__":
    main()
