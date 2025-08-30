#!/usr/bin/env python3
"""
Test script to verify that radius functionality is properly implemented across all endpoints
"""
import requests
import sys

BASE_URL = "http://localhost:8000"

def test_radius_endpoints():
    """Test all endpoints that should include radius support"""
    print("🧪 Testing Radius Functionality Across All Endpoints\n")
    
    # Test cases
    tests = [
        {
            "name": "Issues List - Radius Filtering",
            "endpoint": f"{BASE_URL}/api/issues/",
            "params": {"min_radius": 100, "max_radius": 1000, "limit": 5},
            "expected_field": "radius"
        },
        {
            "name": "Individual Issue - Radius Included",
            "endpoint": f"{BASE_URL}/api/issues/123e4567-e89b-12d3-a456-426614174000",
            "params": {},
            "expected_field": "radius"
        },
        {
            "name": "Heatmap - Radius Included",
            "endpoint": f"{BASE_URL}/api/heatmap/",
            "params": {},
            "expected_field": "radius"
        },
        {
            "name": "Stats - Radius Statistics",
            "endpoint": f"{BASE_URL}/api/stats/radius",
            "params": {},
            "expected_field": "avg_radius"
        },
        {
            "name": "Authority Issues - Radius Filtering",
            "endpoint": f"{BASE_URL}/api/authority/123e4567-e89b-12d3-a456-426614174000/issues",
            "params": {"min_radius": 200, "max_radius": 800},
            "expected_field": "radius"
        }
    ]
    
    for test in tests:
        print(f"📋 Testing: {test['name']}")
        print(f"   URL: {test['endpoint']}")
        
        try:
            # Make request
            response = requests.get(test['endpoint'], params=test['params'], timeout=10)
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if expected field exists
                if isinstance(data, list):
                    # List response (like heatmap)
                    if data and test['expected_field'] in data[0]:
                        print(f"   ✅ Field '{test['expected_field']}' found in response")
                    elif not data:
                        print(f"   ⚠️  Empty response (no data to verify)")
                    else:
                        print(f"   ❌ Field '{test['expected_field']}' missing from response")
                
                elif isinstance(data, dict):
                    # Dict response
                    if test['expected_field'] in data:
                        print(f"   ✅ Field '{test['expected_field']}' found in response")
                    elif 'issues' in data and data['issues']:
                        # Issue list response
                        if test['expected_field'] in data['issues'][0]:
                            print(f"   ✅ Field '{test['expected_field']}' found in issues")
                        else:
                            print(f"   ❌ Field '{test['expected_field']}' missing from issues")
                    else:
                        print(f"   ❌ Field '{test['expected_field']}' missing from response")
                
                print(f"   📊 Response preview: {str(data)[:200]}...")
                
            elif response.status_code == 404:
                print(f"   ⚠️  404 Not Found - endpoint may not exist or test data missing")
            elif response.status_code == 401:
                print(f"   ⚠️  401 Unauthorized - authentication required")
            elif response.status_code == 403:
                print(f"   ⚠️  403 Forbidden - insufficient permissions")
            else:
                print(f"   ❌ HTTP {response.status_code}: {response.text[:200]}...")
                
        except requests.exceptions.ConnectionError:
            print(f"   ❌ Connection failed - server may not be running")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
        
        print()
    
    print("🎯 Radius endpoint testing completed!")
    print("\n💡 Note: Some endpoints may require authentication or test data to be fully verified.")

if __name__ == "__main__":
    test_radius_endpoints()
