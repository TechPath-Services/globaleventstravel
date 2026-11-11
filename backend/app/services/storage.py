"""
Storage abstraction layer for file uploads.
Supports both local filesystem and Azure Blob Storage.
"""
import os
import re
import uuid
import hashlib
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from types import SimpleNamespace
from typing import Callable, Optional
from app.core.config import settings

CONTENT_TYPES = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
}

_SAFE_EXTENSION = re.compile(r"^\.[A-Za-z0-9]{1,8}$")


def resolve_content_type(filename: str, content_type: Optional[str] = None) -> str:
    """Use a specific type, and infer from the extension instead of octet-stream."""
    extension = os.path.splitext(filename or "")[1].lower()
    inferred = CONTENT_TYPES.get(extension)
    if content_type and content_type != "application/octet-stream":
        return content_type
    if inferred:
        return inferred
    return content_type or "application/octet-stream"


def sanitized_filename(original_filename: str, timestamp: Optional[str] = None) -> str:
    """Slug of the original name plus a timestamp. Never includes a directory."""
    raw = (original_filename or "").replace("\\", "/").strip()
    base = raw.split("/")[-1] if raw else ""
    stem, extension = os.path.splitext(base)
    extension = extension.lower()
    if not _SAFE_EXTENSION.match(extension):
        extension = ""
    slug = re.sub(r"[^A-Za-z0-9]+", "-", stem).strip("-")
    slug = re.sub(r"-{2,}", "-", slug)[:80] or "file"
    stamp = timestamp or datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{slug}_{stamp}{extension}"


def choose_unique_storage_path(folder: str, filename: str, exists: Callable[[str], bool]) -> str:
    """Pick a path that does not replace an object already in storage."""

    def join(name: str) -> str:
        cleaned = name.lstrip("/")
        prefix = folder.strip("/")
        return f"{prefix}/{cleaned}" if prefix else cleaned

    path = join(filename)
    if not exists(path):
        return path
    stem, extension = os.path.splitext(filename)
    for index in range(2, 1000):
        path = join(f"{stem}-{index}{extension}")
        if not exists(path):
            return path
    return join(f"{stem}-{uuid.uuid4().hex[:8]}{extension}")


def blob_content_settings(content_type: str):
    """Azure ContentSettings when the SDK is installed, otherwise a stand-in."""
    try:
        from azure.storage.blob import ContentSettings
    except ImportError:
        return SimpleNamespace(content_type=content_type)
    return ContentSettings(content_type=content_type)


class StorageBackend(ABC):
    """Abstract base class for storage backends."""
    
    @abstractmethod
    async def upload(
        self,
        content: bytes,
        filename: str,
        folder: str,
        content_type: Optional[str] = None,
    ) -> str:
        """
        Upload file content to storage.
        
        Args:
            content: File content as bytes
            filename: Generated filename
            folder: Organizational folder
            content_type: MIME type stored with the object when the backend supports it
            
        Returns:
            Storage path (relative path for local, blob name for Azure)
        """
        pass
    
    @abstractmethod
    async def delete(self, storage_path: str) -> bool:
        """
        Delete a file from storage.
        
        Args:
            storage_path: Path returned from upload()
            
        Returns:
            True if deleted, False if not found
        """
        pass
    
    @abstractmethod
    def get_url(self, storage_path: str) -> str:
        """
        Get the public URL for a file.
        
        Args:
            storage_path: Path returned from upload()
            
        Returns:
            Public URL to access the file
        """
        pass
    
    @staticmethod
    def compute_hash(content: bytes) -> str:
        """Compute SHA-256 hash of content."""
        return hashlib.sha256(content).hexdigest()
    
    @staticmethod
    def generate_filename(original_filename: str, content_hash: str = "") -> str:
        """Readable filename: sanitized original name plus a timestamp.

        The content hash stays on the media row for deduplication and is not
        part of the blob name. Callers still pass it.
        """
        del content_hash
        return sanitized_filename(original_filename)


class LocalStorage(StorageBackend):
    """Local filesystem storage backend."""
    
    def __init__(self):
        # Get the backend directory (where app/ is located)
        self.base_dir = os.path.dirname(
            os.path.dirname(
                os.path.dirname(os.path.abspath(__file__))
            )
        )
        self.upload_dir = os.path.join(self.base_dir, settings.LOCAL_UPLOAD_DIR)
        os.makedirs(self.upload_dir, exist_ok=True)
    
    async def upload(
        self,
        content: bytes,
        filename: str,
        folder: str,
        content_type: Optional[str] = None,
    ) -> str:
        """Upload file to local filesystem without replacing an existing file."""
        del content_type

        def exists(path: str) -> bool:
            return os.path.exists(os.path.join(self.upload_dir, path))

        storage_path = choose_unique_storage_path(folder, filename, exists)
        file_path = os.path.join(self.upload_dir, storage_path)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        with open(file_path, "wb") as handle:
            handle.write(content)

        return storage_path
    
    async def delete(self, storage_path: str) -> bool:
        """Delete file from local filesystem."""
        file_path = os.path.join(self.upload_dir, storage_path)
        
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    
    def get_url(self, storage_path: str) -> str:
        """Get URL for local file (served via API)."""
        return f"/api/v1/uploads/{storage_path}"


class AzureStorage(StorageBackend):
    """Azure Blob Storage backend."""
    
    def __init__(self):
        self.connection_string = settings.AZURE_STORAGE_CONNECTION_STRING
        self.container_name = settings.AZURE_CONTAINER_NAME
        self._client = None
        self._container_client = None
        self._anonymous_read: Optional[bool] = None
    
    def _get_container_client(self):
        """Lazy initialization of Azure container client."""
        if self._container_client is None:
            try:
                from azure.storage.blob import BlobServiceClient, ContainerClient
                
                if not self.connection_string:
                    raise ValueError("AZURE_STORAGE_CONNECTION_STRING is not configured")
                
                self._client = BlobServiceClient.from_connection_string(self.connection_string)
                self._container_client = self._client.get_container_client(self.container_name)
                
                # Create container if it doesn't exist
                try:
                    self._container_client.create_container()
                except Exception:
                    pass  # Container already exists
                    
            except ImportError:
                raise ImportError(
                    "azure-storage-blob package is required for Azure storage. "
                    "Install it with: pip install azure-storage-blob"
                )
        
        return self._container_client
    
    async def upload(
        self,
        content: bytes,
        filename: str,
        folder: str,
        content_type: Optional[str] = None,
    ) -> str:
        """Upload file to Azure Blob Storage without replacing an existing blob."""
        container_client = self._get_container_client()

        def exists(path: str) -> bool:
            return container_client.get_blob_client(path).exists()

        blob_name = choose_unique_storage_path(folder, filename, exists)
        blob_client = container_client.get_blob_client(blob_name)
        settings_obj = blob_content_settings(resolve_content_type(filename, content_type))
        try:
            blob_client.upload_blob(content, overwrite=False, content_settings=settings_obj)
        except Exception as exc:
            error_code = getattr(exc, "error_code", None) or ""
            already_exists = error_code == "BlobAlreadyExists" or "BlobAlreadyExists" in str(exc)
            if not already_exists:
                raise
            stem, extension = os.path.splitext(filename)
            blob_name = choose_unique_storage_path(
                folder,
                f"{stem}-{uuid.uuid4().hex[:8]}{extension}",
                exists,
            )
            blob_client = container_client.get_blob_client(blob_name)
            blob_client.upload_blob(content, overwrite=False, content_settings=settings_obj)

        return blob_name
    
    async def delete(self, storage_path: str) -> bool:
        """Delete file from Azure Blob Storage."""
        container_client = self._get_container_client()
        
        try:
            blob_client = container_client.get_blob_client(storage_path)
            blob_client.delete_blob()
            return True
        except Exception:
            return False
    
    def get_url(self, storage_path: str) -> str:
        """Plain blob URL when anonymous read is allowed, otherwise a SAS URL."""
        container_client = self._get_container_client()
        blob_client = container_client.get_blob_client(storage_path)
        plain_url = blob_client.url.split("?", 1)[0]
        if self._allows_anonymous_read(container_client):
            return plain_url
        sas_token = self._sas_token(storage_path)
        if sas_token:
            return f"{plain_url}?{sas_token}"
        return plain_url

    def _allows_anonymous_read(self, container_client) -> bool:
        """True for public blob or public container access. Does not change access."""
        if self._anonymous_read is not None:
            return self._anonymous_read
        try:
            properties = container_client.get_container_properties()
        except Exception:
            return False
        access = getattr(properties, "public_access", None)
        if access is None:
            self._anonymous_read = False
            return False
        value = getattr(access, "value", access)
        self._anonymous_read = str(value).lower() in {"blob", "container"}
        return self._anonymous_read

    def _sas_token(self, storage_path: str) -> Optional[str]:
        """Read-only SAS for private containers. None when a token cannot be built."""
        try:
            from datetime import timezone

            from azure.storage.blob import BlobSasPermissions, generate_blob_sas

            account_name = None
            account_key = None
            for part in (self.connection_string or "").split(";"):
                if part.startswith("AccountName="):
                    account_name = part.split("=", 1)[1]
                elif part.startswith("AccountKey="):
                    account_key = part.split("=", 1)[1]

            if not account_name or not account_key:
                return None
            return generate_blob_sas(
                account_name=account_name,
                container_name=self.container_name,
                blob_name=storage_path,
                account_key=account_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.now(timezone.utc) + timedelta(days=365),
            )
        except Exception:
            return None


def get_storage() -> StorageBackend:
    """
    Get the configured storage backend.
    
    Returns:
        StorageBackend instance based on STORAGE_TYPE setting
    """
    if settings.is_azure_storage:
        return AzureStorage()
    return LocalStorage()
