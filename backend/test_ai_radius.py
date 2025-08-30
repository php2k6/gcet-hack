#!/usr/bin/env python3
"""
Test the AI radius detection function directly
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.util import get_query_response

def test_radius_function():
    """Test the AI radius detection with various descriptions"""
    
    test_cases = [
        {
            "description": "Small pothole on 5th street near the bus stop",
            "expected_range": "5-20m",
            "reason": "Specific pothole - highly localized"
        },
        {
            "description": "Power outage affecting entire Green Valley residential complex",
            "expected_range": "50-100m", 
            "reason": "Building complex issue"
        },
        {
            "description": "Major road construction blocking Highway 101 causing traffic for miles",
            "expected_range": "100m",
            "reason": "Large infrastructure impact"
        },
        {
            "description": "Broken streetlight on Main Street corner",
            "expected_range": "5m",
            "reason": "Specific fixture issue"
        },
        {
            "description": "Water pipeline burst affecting multiple buildings in the area",
            "expected_range": "50-100m",
            "reason": "Infrastructure affecting wider area"
        }
    ]
    
    print("🤖 AI Radius Detection Function Test")
    print("=" * 60)
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n🧪 Test Case {i}:")
        print(f"Description: {test['description']}")
        print(f"Expected: {test['expected_range']} ({test['reason']})")
        
        try:
            # This calls the same function used in the POST endpoint
            result = get_query_response(test['description'], "routers/system_prompt3.txt")
            print(f"🤖 AI Result: {result}")
            
            # Try to extract just the number
            import re
            numbers = re.findall(r'\b(5|20|50|100)\b', str(result))
            if numbers:
                radius_value = int(numbers[0])
                print(f"✅ Extracted Radius: {radius_value} meters")
            else:
                print(f"⚠️  Could not extract valid radius from: {result}")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
        
        print("-" * 40)

if __name__ == "__main__":
    test_radius_function()
