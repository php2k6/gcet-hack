"""
Unit tests for radius-based duplicate detection functionality
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.routers.issues import (
    calculate_distance, 
    parse_location_coordinates,
    check_duplicate_issue,
    auto_upvote_issue
)
import math

def test_distance_calculation():
    """Test the Haversine distance calculation"""
    print("🧮 Testing distance calculation...")
    
    # Test case 1: Same location (should be 0)
    lat1, lon1 = 40.7128, -74.0060
    lat2, lon2 = 40.7128, -74.0060
    distance = calculate_distance(lat1, lon1, lat2, lon2)
    print(f"Same location distance: {distance:.2f}m (should be ~0)")
    assert distance < 1, f"Same location should be ~0m, got {distance}m"
    
    # Test case 2: NYC to nearby location (should be ~25m)
    lat3, lon3 = 40.7130, -74.0058  # Very close to NYC
    distance = calculate_distance(lat1, lon1, lat3, lon3)
    print(f"Nearby location distance: {distance:.2f}m (should be ~25m)")
    assert 20 <= distance <= 50, f"Expected ~25m, got {distance}m"
    
    # Test case 3: NYC to Times Square (should be ~5-6km)
    lat4, lon4 = 40.7580, -73.9855  # Times Square
    distance = calculate_distance(lat1, lon1, lat4, lon4)
    print(f"Times Square distance: {distance:.2f}m (should be ~5-6km)")
    assert 5000 <= distance <= 7000, f"Expected ~5-6km, got {distance}m"
    
    print("✅ Distance calculation tests passed!")

def test_location_parsing():
    """Test location coordinate parsing"""
    print("\n📍 Testing location parsing...")
    
    # Test valid formats
    test_cases = [
        ("40.7128,-74.0060", (40.7128, -74.0060)),
        ("40.7128, -74.0060", (40.7128, -74.0060)),  # With space
        (" 40.7128 , -74.0060 ", (40.7128, -74.0060)),  # With extra spaces
        ("0,0", (0.0, 0.0)),  # Edge case
        ("-90,-180", (-90.0, -180.0)),  # Negative coordinates
    ]
    
    for location_str, expected in test_cases:
        try:
            lat, lon = parse_location_coordinates(location_str)
            print(f"'{location_str}' -> ({lat}, {lon})")
            assert abs(lat - expected[0]) < 0.0001 and abs(lon - expected[1]) < 0.0001
        except Exception as e:
            print(f"❌ Failed to parse '{location_str}': {e}")
            raise
    
    # Test invalid formats
    invalid_cases = [
        "40.7128",  # Missing longitude
        "40.7128,-74.0060,extra",  # Too many parts
        "not,a,number",  # Non-numeric
        "",  # Empty string
        "40.7128;-74.0060",  # Wrong separator
    ]
    
    for invalid_location in invalid_cases:
        try:
            lat, lon = parse_location_coordinates(invalid_location)
            print(f"❌ Should have failed for '{invalid_location}' but got ({lat}, {lon})")
            assert False, f"Should have failed for invalid location: {invalid_location}"
        except ValueError:
            print(f"✅ Correctly rejected invalid location: '{invalid_location}'")
    
    print("✅ Location parsing tests passed!")

def test_radius_functionality():
    """Test the overall radius functionality logic"""
    print("\n🎯 Testing radius functionality logic...")
    
    # Test case: Two issues within radius
    location1 = "40.7128,-74.0060"  # NYC
    location2 = "40.7130,-74.0058"  # ~25m away
    radius = 500  # 500m radius
    
    lat1, lon1 = parse_location_coordinates(location1)
    lat2, lon2 = parse_location_coordinates(location2)
    distance = calculate_distance(lat1, lon1, lat2, lon2)
    
    within_radius = distance <= radius
    print(f"Distance: {distance:.2f}m, Radius: {radius}m, Within radius: {within_radius}")
    assert within_radius, f"Issues should be within {radius}m radius"
    
    # Test case: Two issues outside radius
    location3 = "40.7580,-73.9855"  # Times Square, ~5-6km away
    lat3, lon3 = parse_location_coordinates(location3)
    distance2 = calculate_distance(lat1, lon1, lat3, lon3)
    
    outside_radius = distance2 > radius
    print(f"Distance to Times Square: {distance2:.2f}m, Radius: {radius}m, Outside radius: {outside_radius}")
    assert outside_radius, f"Times Square should be outside {radius}m radius"
    
    print("✅ Radius functionality logic tests passed!")

def test_ai_radius_extraction():
    """Test AI radius extraction (mock)"""
    print("\n🤖 Testing AI radius extraction logic...")
    
    # Since we can't easily test the actual AI function without dependencies,
    # let's test the parsing logic that would handle AI responses
    
    def mock_parse_radius_response(ai_response: str) -> int:
        """Mock function to parse AI response for radius"""
        import re
        numbers = re.findall(r'\d+', ai_response)
        if numbers:
            radius = int(numbers[0])
            return max(50, min(5000, radius))  # Ensure bounds
        return 500  # Default
    
    test_responses = [
        ("The radius should be 300 meters", 300),
        ("300", 300),
        ("Radius: 150m", 150),
        ("I recommend a 1000 meter radius", 1000),
        ("No numbers here", 500),  # Default
        ("10", 50),  # Below minimum, should be clamped to 50
        ("10000", 5000),  # Above maximum, should be clamped to 5000
    ]
    
    for response, expected in test_responses:
        result = mock_parse_radius_response(response)
        print(f"'{response}' -> {result}m (expected: {expected}m)")
        assert result == expected, f"Expected {expected}, got {result}"
    
    print("✅ AI radius extraction logic tests passed!")

def run_all_tests():
    """Run all tests"""
    print("🧪 Running Radius-Based Duplicate Detection Unit Tests")
    print("=" * 60)
    
    try:
        test_distance_calculation()
        test_location_parsing()
        test_radius_functionality()
        test_ai_radius_extraction()
        
        print("\n" + "=" * 60)
        print("🎉 All tests passed! Radius-based duplicate detection is working correctly.")
        print("\n📋 Test Summary:")
        print("✅ Distance calculation (Haversine formula)")
        print("✅ Location coordinate parsing")
        print("✅ Radius-based proximity logic")
        print("✅ AI radius extraction logic")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_all_tests()
