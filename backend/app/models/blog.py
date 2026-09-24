"""
Blog Pydantic schemas for request/response validation.
"""
from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, Field
from enum import Enum


class PostStatusEnum(str, Enum):
    """Blog post status enum."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ContentTypeEnum(str, Enum):
    """Content type enum."""
    MARKDOWN = "markdown"
    HTML = "html"


# ============================================
# Blog Category Schemas
# ============================================

class BlogCategoryBase(BaseModel):
    """Base schema for blog category."""
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    display_order: int = 0
    is_active: bool = True


class BlogCategoryCreate(BlogCategoryBase):
    """Schema for creating a blog category."""
    pass


class BlogCategoryUpdate(BaseModel):
    """Schema for updating a blog category."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class BlogCategoryResponse(BlogCategoryBase):
    """Schema for blog category response."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BlogCategoryTreeResponse(BlogCategoryResponse):
    """Schema for blog category tree response with children."""
    children: List["BlogCategoryTreeResponse"] = []
    post_count: int = 0

    class Config:
        from_attributes = True


# ============================================
# Blog Tag Schemas
# ============================================

class BlogTagBase(BaseModel):
    """Base schema for blog tag."""
    name: str = Field(..., min_length=1, max_length=50)
    slug: str = Field(..., min_length=1, max_length=50)


class BlogTagCreate(BlogTagBase):
    """Schema for creating a blog tag."""
    pass


class BlogTagUpdate(BaseModel):
    """Schema for updating a blog tag."""
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    slug: Optional[str] = Field(None, min_length=1, max_length=50)


class BlogTagResponse(BlogTagBase):
    """Schema for blog tag response."""
    id: int
    post_count: Optional[int] = 0
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# Blog Author Schemas
# ============================================

class BlogAuthorBase(BaseModel):
    """Base schema for blog author."""
    name: str = Field(..., min_length=2, max_length=255)
    avatar: Optional[str] = None
    bio: Optional[str] = None
    role: Optional[str] = None


class BlogAuthorCreate(BlogAuthorBase):
    """Schema for creating a blog author."""
    pass


class BlogAuthorUpdate(BaseModel):
    """Schema for updating a blog author."""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    avatar: Optional[str] = None
    bio: Optional[str] = None
    role: Optional[str] = None


class BlogAuthorResponse(BlogAuthorBase):
    """Schema for blog author response."""
    id: int

    class Config:
        from_attributes = True


# ============================================
# Blog Post Schemas
# ============================================

def resolve_blog_publish_date(obj) -> Optional[str]:
    """Prefer stored publish_date; fall back for published posts missing it."""
    if getattr(obj, "publish_date", None):
        return obj.publish_date
    published_at = getattr(obj, "published_at", None)
    if published_at:
        return published_at.strftime("%Y-%m-%d")
    if getattr(obj, "status", None) == "published" and getattr(obj, "created_at", None):
        return obj.created_at.strftime("%Y-%m-%d")
    return None


def resolve_blog_published_at(obj) -> Optional[datetime]:
    """Prefer stored published_at; fall back for published posts missing it."""
    if getattr(obj, "published_at", None):
        return obj.published_at
    if getattr(obj, "status", None) == "published":
        return getattr(obj, "created_at", None)
    return None


class BlogPostBase(BaseModel):
    """Base schema for blog post."""
    title: str = Field(..., min_length=2, max_length=255)
    slug: str = Field(..., min_length=2, max_length=255)
    excerpt: Optional[str] = Field(None, max_length=500)
    content: str
    content_type: ContentTypeEnum = ContentTypeEnum.HTML
    status: PostStatusEnum = PostStatusEnum.DRAFT
    publish_date: Optional[str] = Field(None, alias="publishDate")
    updated_date: Optional[str] = Field(None, alias="updatedDate")
    published_at: Optional[datetime] = None
    featured_image: Optional[str] = Field(None, alias="featuredImage")
    category_id: Optional[int] = None
    category: Optional[str] = None  # Legacy field
    tags: Optional[List[str]] = None  # Legacy field
    tag_ids: Optional[List[int]] = None
    read_time: Optional[int] = Field(None, gt=0, alias="readTime")
    featured: bool = False
    meta_title: Optional[str] = Field(None, max_length=70, alias="metaTitle")
    meta_description: Optional[str] = Field(None, alias="metaDescription")
    meta_keywords: Optional[List[str]] = Field(None, alias="metaKeywords")
    structured_data: Optional[Any] = Field(
        None,
        alias="structuredData",
        description="Optional JSON-LD object or array for the article page",
    )

    class Config:
        populate_by_name = True


class BlogPostCreate(BlogPostBase):
    """Schema for creating a blog post."""
    author_id: int


class BlogPostUpdate(BaseModel):
    """Schema for updating a blog post."""
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    slug: Optional[str] = Field(None, min_length=2, max_length=255)
    excerpt: Optional[str] = Field(None, max_length=500)
    content: Optional[str] = None
    content_type: Optional[ContentTypeEnum] = None
    status: Optional[PostStatusEnum] = None
    publish_date: Optional[str] = Field(None, alias="publishDate")
    updated_date: Optional[str] = Field(None, alias="updatedDate")
    published_at: Optional[datetime] = None
    featured_image: Optional[str] = Field(None, alias="featuredImage")
    category_id: Optional[int] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    tag_ids: Optional[List[int]] = None
    read_time: Optional[int] = Field(None, gt=0, alias="readTime")
    featured: Optional[bool] = None
    meta_title: Optional[str] = Field(None, max_length=70, alias="metaTitle")
    meta_description: Optional[str] = Field(None, alias="metaDescription")
    meta_keywords: Optional[List[str]] = Field(None, alias="metaKeywords")
    structured_data: Optional[Any] = Field(None, alias="structuredData")
    author_id: Optional[int] = None

    class Config:
        populate_by_name = True


class BlogPostResponse(BaseModel):
    """Schema for blog post response."""
    id: int
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: str
    contentType: ContentTypeEnum
    status: PostStatusEnum
    author: BlogAuthorResponse
    publishDate: Optional[str] = None
    updatedDate: Optional[str] = None
    publishedAt: Optional[datetime] = None
    featuredImage: Optional[str] = None
    category: Optional[str] = None
    categoryId: Optional[int] = None
    categoryName: Optional[str] = None
    tags: Optional[List[str]] = None
    tagsList: Optional[List[BlogTagResponse]] = None
    readTime: Optional[int] = None
    featured: bool
    metaTitle: Optional[str] = None
    metaDescription: Optional[str] = None
    metaKeywords: Optional[List[str]] = None
    structuredData: Optional[Any] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_model(cls, obj):
        """Convert ORM model to response schema."""
        return cls(
            id=obj.id,
            title=obj.title,
            slug=obj.slug,
            excerpt=obj.excerpt,
            content=obj.content,
            contentType=obj.content_type,
            status=obj.status,
            author=BlogAuthorResponse.model_validate(obj.author),
            publishDate=resolve_blog_publish_date(obj),
            updatedDate=obj.updated_date,
            publishedAt=resolve_blog_published_at(obj),
            featuredImage=obj.featured_image,
            category=obj.category,
            categoryId=obj.category_id,
            categoryName=obj.category_rel.name if obj.category_rel else None,
            tags=obj.tags if isinstance(obj.tags, list) else None,
            tagsList=[BlogTagResponse.model_validate(t) for t in obj.tags_rel] if obj.tags_rel else None,
            readTime=obj.read_time,
            featured=obj.featured,
            metaTitle=obj.meta_title,
            metaDescription=obj.meta_description,
            metaKeywords=obj.meta_keywords,
            structuredData=getattr(obj, "structured_data", None),
            createdAt=obj.created_at,
            updatedAt=obj.updated_at,
        )


class BlogPostListResponse(BaseModel):
    """Schema for blog post list (simplified)."""
    id: int
    title: str
    slug: str
    excerpt: Optional[str] = None
    author: BlogAuthorResponse
    publishDate: Optional[str] = None
    featuredImage: Optional[str] = None
    category: Optional[str] = None
    categoryName: Optional[str] = None
    tags: Optional[List[str]] = None
    readTime: Optional[int] = None
    featured: bool
    status: PostStatusEnum
    contentType: ContentTypeEnum
    createdAt: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_model(cls, obj):
        """Convert ORM model to list response schema."""
        return cls(
            id=obj.id,
            title=obj.title,
            slug=obj.slug,
            excerpt=obj.excerpt,
            author=BlogAuthorResponse.model_validate(obj.author),
            publishDate=resolve_blog_publish_date(obj),
            featuredImage=obj.featured_image,
            category=obj.category,
            categoryName=obj.category_rel.name if obj.category_rel else None,
            tags=obj.tags if isinstance(obj.tags, list) else None,
            readTime=obj.read_time,
            featured=obj.featured,
            status=obj.status,
            contentType=obj.content_type,
            createdAt=obj.created_at,
        )


# Update forward references
BlogCategoryTreeResponse.model_rebuild()
