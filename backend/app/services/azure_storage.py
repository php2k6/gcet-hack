"""
Azure Blob Storage Service for handling file uploads and downloads
"""

from azure.storage.blob import BlobServiceClient, BlobClient
from azure.core.exceptions import ResourceNotFoundError
import uuid
import os
import asyncio
from typing import Tuple, Optional
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

class AzureStorageService:
    def __init__(self):
        self.connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        self.container_name = os.getenv("AZURE_STORAGE_CONTAINER_NAME", "issue-media")
        self.account_name = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")
        self.account_key = os.getenv("AZURE_STORAGE_ACCOUNT_KEY")
        
        if not self.connection_string:
            raise ValueError("AZURE_STORAGE_CONNECTION_STRING environment variable is required")
        
        try:
            self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)
            # Ensure container exists
            self._ensure_container_exists()
        except Exception as e:
            logger.error(f"Failed to initialize Azure Blob Storage: {str(e)}")
            raise
    
    def _ensure_container_exists(self):
        """Ensure the container exists, create if it doesn't"""
        try:
            container_client = self.blob_service_client.get_container_client(self.container_name)
            container_client.get_container_properties()
        except ResourceNotFoundError:
            # Container doesn't exist, create it
            logger.info(f"Creating container: {self.container_name}")
            container_client = self.blob_service_client.create_container(self.container_name)
            logger.info(f"Container created successfully: {self.container_name}")
    
    async def upload_file(self, file_content: bytes, file_name: str, issue_id: str, content_type: str = None) -> Tuple[str, str]:
        """
        Upload file to Azure Blob Storage
        
        Args:
            file_content: File content as bytes
            file_name: Original filename
            issue_id: Issue ID for organizing files
            content_type: MIME type of the file
            
        Returns:
            Tuple of (blob_url, blob_name)
        """
        try:
            # Generate unique blob name: issues/{issue_id}/{uuid}_{filename}
            clean_filename = file_name.replace(" ", "_").replace("/", "_")
            blob_name = f"issues/{issue_id}/{uuid.uuid4()}_{clean_filename}"
            
            # Get blob client
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            
            # Set content type if provided
            content_settings = None
            if content_type:
                from azure.storage.blob import ContentSettings
                content_settings = ContentSettings(content_type=content_type)
            
            # Upload file
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: blob_client.upload_blob(
                    file_content,
                    overwrite=True,
                    content_settings=content_settings
                )
            )
            
            # Get the blob URL
            blob_url = blob_client.url
            
            logger.info(f"File uploaded successfully: {blob_name}")
            return blob_url, blob_name
            
        except Exception as e:
            logger.error(f"Failed to upload file {file_name}: {str(e)}")
            raise Exception(f"Failed to upload file to Azure Blob Storage: {str(e)}")
    
    async def delete_file(self, blob_name: str) -> bool:
        """
        Delete file from Azure Blob Storage
        
        Args:
            blob_name: The blob name to delete
            
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            
            await asyncio.get_event_loop().run_in_executor(
                None,
                blob_client.delete_blob
            )
            
            logger.info(f"File deleted successfully: {blob_name}")
            return True
            
        except ResourceNotFoundError:
            logger.warning(f"File not found for deletion: {blob_name}")
            return False
        except Exception as e:
            logger.error(f"Failed to delete file {blob_name}: {str(e)}")
            return False
    
    async def get_file_content(self, blob_name: str) -> Optional[bytes]:
        """
        Download file content from Azure Blob Storage
        
        Args:
            blob_name: The blob name to download
            
        Returns:
            File content as bytes or None if not found
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            
            download_stream = await asyncio.get_event_loop().run_in_executor(
                None,
                blob_client.download_blob
            )
            
            return download_stream.readall()
            
        except ResourceNotFoundError:
            logger.warning(f"File not found: {blob_name}")
            return None
        except Exception as e:
            logger.error(f"Failed to download file {blob_name}: {str(e)}")
            return None
    
    def get_blob_url(self, blob_name: str) -> str:
        """
        Get the public URL for a blob
        
        Args:
            blob_name: The blob name
            
        Returns:
            The blob URL
        """
        blob_client = self.blob_service_client.get_blob_client(
            container=self.container_name,
            blob=blob_name
        )
        return blob_client.url
    
    async def list_blobs_for_issue(self, issue_id: str) -> list:
        """
        List all blobs for a specific issue
        
        Args:
            issue_id: The issue ID
            
        Returns:
            List of blob names
        """
        try:
            container_client = self.blob_service_client.get_container_client(self.container_name)
            blob_prefix = f"issues/{issue_id}/"
            
            blobs = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: list(container_client.list_blobs(name_starts_with=blob_prefix))
            )
            
            return [blob.name for blob in blobs]
            
        except Exception as e:
            logger.error(f"Failed to list blobs for issue {issue_id}: {str(e)}")
            return []


# Singleton instance
_azure_storage_service = None

def get_azure_storage_service() -> AzureStorageService:
    """Get singleton instance of Azure Storage Service"""
    global _azure_storage_service
    if _azure_storage_service is None:
        _azure_storage_service = AzureStorageService()
    return _azure_storage_service
