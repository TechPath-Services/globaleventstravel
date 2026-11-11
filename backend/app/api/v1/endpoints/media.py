"""
Media API endpoints with hash-based deduplication.
"""
import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_db
from app.crud.media import media as media_crud
from app.services.storage import get_storage, StorageBackend
from app.models.media import (
    MediaResponse,
    MediaListResponse,
    MediaUploadResponse,
    MediaUpdate,
    TagInfo,
    FolderInfo,
    TagsUpdateRequest,
)
from app.db.models.media import Media

router = APIRouter()

# Allowed file types
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".pdf", ".mp4", ".webm"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
}


def get_file_extension(filename: str) -> str:
    """Get file extension from filename."""
    return os.path.splitext(filename)[1].lower()


def get_mime_type(extension: str) -> str:
    """Get MIME type from file extension."""
    return MIME_TYPES.get(extension, "application/octet-stream")


@router.post("", response_model=MediaUploadResponse)
async def upload_media(
    file: UploadFile = File(...),
    folder: str = Form("general"),
    tags: Optional[str] = Form(None),  # Comma-separated tags
    alt_text: Optional[str] = Form(None),
    caption: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """
    Upload a file with hash-based deduplication.
    
    If a file with the same content (hash) already exists, returns the existing
    record without storing a duplicate.
    
    - **file**: The file to upload
    - **folder**: Folder to organize uploads (e.g., 'blog', 'treks', 'general')
    - **tags**: Comma-separated tags (e.g., 'nature,mountain,trek')
    - **alt_text**: Alt text for images (accessibility)
    - **caption**: Caption or description
    """
    # Validate file extension
    original_filename = file.filename or "unknown"
    ext = get_file_extension(original_filename)
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024 * 1024)}MB"
        )
    
    # Compute content hash
    storage = get_storage()
    content_hash = StorageBackend.compute_hash(content)
    
    # Check for existing file with same hash
    existing_media = media_crud.get_by_hash(db, hash=content_hash)
    
    if existing_media:
        # File already exists - return existing record
        return MediaUploadResponse(
            id=existing_media.id,
            hash=existing_media.hash,
            filename=existing_media.filename,
            original_filename=existing_media.original_filename,
            url=existing_media.url,
            size=existing_media.size,
            mime_type=existing_media.mime_type,
            folder=existing_media.folder,
            tags=existing_media.tags,
            storage_type=existing_media.storage_type,
            alt_text=existing_media.alt_text,
            caption=existing_media.caption,
            created_at=existing_media.created_at,
            updated_at=existing_media.updated_at,
            is_duplicate=True,
        )
    
    # Readable name (slug + timestamp). Upload adds a suffix if that blob exists.
    filename = StorageBackend.generate_filename(original_filename, content_hash)
    mime_type = get_mime_type(ext)

    # Upload to storage backend
    storage_path = await storage.upload(
        content,
        filename,
        folder,
        content_type=mime_type,
    )
    url = storage.get_url(storage_path)
    filename = os.path.basename(storage_path)
    
    # Parse tags
    tag_list = None
    if tags:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]
    
    # Create database record
    media_data = Media(
        hash=content_hash,
        filename=filename,
        original_filename=original_filename,
        url=url,
        size=file_size,
        mime_type=mime_type,
        folder=folder,
        tags=tag_list,
        storage_type=settings.STORAGE_TYPE,
        storage_path=storage_path,
        alt_text=alt_text,
        caption=caption,
    )
    
    db.add(media_data)
    db.commit()
    db.refresh(media_data)
    
    return MediaUploadResponse(
        id=media_data.id,
        hash=media_data.hash,
        filename=media_data.filename,
        original_filename=media_data.original_filename,
        url=media_data.url,
        size=media_data.size,
        mime_type=media_data.mime_type,
        folder=media_data.folder,
        tags=media_data.tags,
        storage_type=media_data.storage_type,
        alt_text=media_data.alt_text,
        caption=media_data.caption,
        created_at=media_data.created_at,
        updated_at=media_data.updated_at,
        is_duplicate=False,
    )


@router.get("", response_model=MediaListResponse)
async def list_media(
    query: Optional[str] = Query(None, description="Search in filename, alt_text, caption"),
    folder: Optional[str] = Query(None, description="Filter by folder"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    mime_type: Optional[str] = Query(None, description="Filter by mime type (e.g., 'image/*')"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    List media files with filtering and pagination.
    
    - **query**: Search term for filename, alt_text, or caption
    - **folder**: Filter by folder name
    - **tags**: Comma-separated tags to filter by
    - **mime_type**: Filter by MIME type (supports wildcards like 'image/*')
    """
    tag_list = None
    if tags:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]
    
    media_list, total = media_crud.search(
        db,
        query=query,
        folder=folder,
        tags=tag_list,
        mime_type=mime_type,
        skip=skip,
        limit=limit,
    )
    
    return MediaListResponse(
        items=[MediaResponse.model_validate(m) for m in media_list],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/tags", response_model=List[TagInfo])
async def list_tags(db: Session = Depends(get_db)):
    """Get all unique tags with usage counts."""
    return media_crud.get_all_tags(db)


@router.get("/folders", response_model=List[FolderInfo])
async def list_folders(db: Session = Depends(get_db)):
    """Get all folders with file counts."""
    return media_crud.get_folders(db)


@router.get("/{media_id}", response_model=MediaResponse)
async def get_media(
    media_id: int,
    db: Session = Depends(get_db),
):
    """Get a single media item by ID."""
    media = media_crud.get(db, id=media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    return MediaResponse.model_validate(media)


@router.patch("/{media_id}", response_model=MediaResponse)
async def update_media(
    media_id: int,
    data: MediaUpdate,
    db: Session = Depends(get_db),
):
    """
    Update media metadata (tags, alt_text, caption, folder).
    
    Note: The actual file content cannot be changed. Upload a new file instead.
    """
    media = media_crud.get(db, id=media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    update_data = data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(media, field, value)
    
    db.add(media)
    db.commit()
    db.refresh(media)
    
    return MediaResponse.model_validate(media)


@router.put("/{media_id}/tags", response_model=MediaResponse)
async def update_tags(
    media_id: int,
    request: TagsUpdateRequest,
    db: Session = Depends(get_db),
):
    """Replace all tags for a media item."""
    media = media_crud.update_tags(db, media_id=media_id, tags=request.tags)
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    return MediaResponse.model_validate(media)


@router.delete("/{media_id}")
async def delete_media(
    media_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete a media item.

    This removes the database record and the file from storage.
    """
    media = media_crud.get(db, id=media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    # Delete from storage
    storage = get_storage()
    await storage.delete(media.storage_path)

    # Delete from database
    db.delete(media)
    db.commit()

    return {"message": "Media deleted successfully"}


@router.post("/sync")
async def sync_uploads_to_media(db: Session = Depends(get_db)):
    """
    Scan the uploads directory and import any files not yet in the media table.

    This is useful when files were uploaded via the old /uploads endpoint and
    therefore have no database record, causing the media library to appear empty.
    """
    from app.services.storage import LocalStorage
    import hashlib

    # Resolve the uploads directory the same way LocalStorage does
    local_storage = LocalStorage()
    upload_dir = local_storage.upload_dir

    if not os.path.exists(upload_dir):
        return {"imported": 0, "skipped": 0, "message": "Uploads directory not found"}

    imported = 0
    skipped = 0

    for folder_name in os.listdir(upload_dir):
        folder_path = os.path.join(upload_dir, folder_name)
        if not os.path.isdir(folder_path):
            continue

        for filename in os.listdir(folder_path):
            file_path = os.path.join(folder_path, filename)
            if not os.path.isfile(file_path):
                continue

            ext = get_file_extension(filename)
            if ext not in ALLOWED_EXTENSIONS:
                continue

            # Read file and compute hash
            with open(file_path, "rb") as f:
                content = f.read()

            content_hash = hashlib.sha256(content).hexdigest()

            # Skip if already in DB
            if media_crud.get_by_hash(db, hash=content_hash):
                skipped += 1
                continue

            storage_path = f"{folder_name}/{filename}"
            url = f"/api/v1/uploads/{storage_path}"

            media_record = Media(
                hash=content_hash,
                filename=filename,
                original_filename=filename,
                url=url,
                size=len(content),
                mime_type=get_mime_type(ext),
                folder=folder_name,
                tags=[],
                storage_type="local",
                storage_path=storage_path,
            )
            db.add(media_record)
            imported += 1

    db.commit()
    return {"imported": imported, "skipped": skipped}
