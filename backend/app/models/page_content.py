"""
Pydantic schemas for page content sections.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class PageSectionBase(BaseModel):
    """Base schema for a page content section."""

    page: str = Field(..., min_length=1, max_length=100)
    key: str = Field(..., min_length=1, max_length=100)
    title: Optional[str] = Field(None, max_length=255)
    subtitle: Optional[str] = Field(None, max_length=500)
    badge_text: Optional[str] = Field(None, max_length=255)
    body_html: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    cta_label: Optional[str] = Field(None, max_length=255)
    cta_url: Optional[str] = Field(None, max_length=500)
    display_order: int = 0
    is_active: bool = True


class PageSectionCreate(PageSectionBase):
    """Schema for creating a page section."""

    pass


class PageSectionUpdate(BaseModel):
    """Schema for updating a page section."""

    page: Optional[str] = Field(None, min_length=1, max_length=100)
    key: Optional[str] = Field(None, min_length=1, max_length=100)
    title: Optional[str] = Field(None, max_length=255)
    subtitle: Optional[str] = Field(None, max_length=500)
    badge_text: Optional[str] = Field(None, max_length=255)
    body_html: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    cta_label: Optional[str] = Field(None, max_length=255)
    cta_url: Optional[str] = Field(None, max_length=500)
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class PageSectionResponse(PageSectionBase):
    """Full detail response for a section."""

    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PageSectionListResponse(BaseModel):
    """Simplified list response for section lists."""

    id: int
    page: str
    key: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    badge_text: Optional[str] = None
    body_html: Optional[str] = None
    image_url: Optional[str] = None
    cta_label: Optional[str] = None
    cta_url: Optional[str] = None
    display_order: int
    is_active: bool

    class Config:
        from_attributes = True

