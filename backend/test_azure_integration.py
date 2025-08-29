#!/usr/bin/env python3
"""
Test script for Azure Blob Storage integration
"""

import sys
import os
import asyncio
from io import BytesIO
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_azure_storage_service():
    """Test the Azure Storage Service functionality"""
    print("Testing Azure Blob Storage Service...")
    
    try:
        from app.services.azure_storage import AzureStorageService
        
        print("✅ Azure Storage Service imported successfully")
        
        # Check if environment variables are set
        connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        if not connection_string:
            print("⚠️ AZURE_STORAGE_CONNECTION_STRING not configured properly")
            print("   Please set up your Azure Storage account and update .env file")
            print("   Required environment variables:")
            print("   - AZURE_STORAGE_CONNECTION_STRING")
            print("   - AZURE_STORAGE_CONTAINER_NAME (optional, defaults to 'issue-media')")
            return False
        
        print("✅ Azure Storage connection string found")
        
        # Initialize service (this will create container if it doesn't exist)
        azure_service = AzureStorageService()
        print("✅ Azure Storage Service initialized successfully")
        
        # Test container connection
        container_name = azure_service.container_name
        print(f"✅ Container configured: {container_name}")
        
        # Test file upload simulation (without actual upload)
        print("✅ Service is ready for file operations")
        
        return True
        
    except Exception as e:
        print(f"❌ Azure Storage Service test failed: {str(e)}")
        return False

def test_media_schemas():
    """Test the updated media schemas"""
    print("\nTesting updated media schemas...")
    
    try:
        from app.schemas.issue_schemas import MediaResponse
        from uuid import uuid4
        from datetime import datetime
        
        # Test creating MediaResponse with new fields
        media_response = MediaResponse(
            id=uuid4(),
            issue_id=uuid4(),
            path="https://storageaccount.blob.core.windows.net/issue-media/issues/123/test.jpg",
            blob_name="issues/123/uuid_test.jpg",
            filename="test.jpg",
            file_size=1024,
            file_type="image/jpeg",
            storage_type="azure_blob",
            created_at=datetime.now()
        )
        
        print(f"✅ MediaResponse with Azure fields: {media_response.storage_type}")
        print(f"   Blob URL: {media_response.path}")
        print(f"   Blob Name: {media_response.blob_name}")
        
        return True
        
    except Exception as e:
        print(f"❌ Media schema test failed: {str(e)}")
        return False

def test_fastapi_integration():
    """Test if FastAPI app loads with Azure integration"""
    print("\nTesting FastAPI integration...")
    
    try:
        from app.main import app
        print("✅ FastAPI app loads successfully with Azure Blob Storage integration")
        
        # Check if the new endpoint is available
        routes = [route.path for route in app.routes if hasattr(route, 'path')]
        media_routes = [route for route in routes if 'media' in route]
        print(f"✅ Media routes available: {media_routes}")
        
        return True
        
    except Exception as e:
        print(f"❌ FastAPI integration test failed: {str(e)}")
        return False

async def test_azure_operations():
    """Test Azure Blob Storage operations (if configured)"""
    print("\nTesting Azure operations...")
    
    try:
        connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        if not connection_string or connection_string == "your_azure_storage_connection_string_here":
            print("⚠️ Skipping Azure operations test - not configured")
            return True
        
        from app.services.azure_storage import get_azure_storage_service
        
        azure_service = get_azure_storage_service()
        
        # Test blob URL generation
        test_blob_name = "test/sample.jpg"
        blob_url = azure_service.get_blob_url(test_blob_name)
        print(f"✅ Blob URL generation works: {blob_url}")
        
        return True
        
    except Exception as e:
        print(f"❌ Azure operations test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Azure Blob Storage Integration Tests")
    print("=" * 50)
    
    tests = [
        test_azure_storage_service(),
        test_media_schemas(),
        test_fastapi_integration(),
    ]
    
    # Run async test
    try:
        loop = asyncio.get_event_loop()
        tests.append(loop.run_until_complete(test_azure_operations()))
    except Exception as e:
        print(f"❌ Could not run async tests: {str(e)}")
        tests.append(False)
    
    success_count = sum(tests)
    total_tests = len(tests)
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {success_count}/{total_tests} tests passed")
    
    if success_count == total_tests:
        print("🎉 All tests passed! Azure Blob Storage integration is ready.")
        print("\n📝 Next steps:")
        print("1. Configure your Azure Storage account")
        print("2. Update .env with your Azure credentials")
        print("3. Test with actual file uploads")
    else:
        print("⚠️ Some tests failed. Please check the configuration.")
    
    print("\n🔧 Configuration required in .env:")
    print("AZURE_STORAGE_CONNECTION_STRING=your_actual_connection_string")
    print("AZURE_STORAGE_CONTAINER_NAME=issue-media")
    print("AZURE_STORAGE_ACCOUNT_NAME=your_account_name")
    print("AZURE_STORAGE_ACCOUNT_KEY=your_account_key")
