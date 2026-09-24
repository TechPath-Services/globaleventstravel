"""
Blog post, category, tag, and author models.
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    String, Integer, Text, DateTime, Boolean, JSON, ForeignKey, 
    Table, Column, Enum as SQLEnum
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
import enum


class PostStatus(str, enum.Enum):
    """Blog post status enum."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ContentType(str, enum.Enum):
    """Content type enum."""
    MARKDOWN = "markdown"
    HTML = "html"


# Many-to-many association table for blog posts and tags
blog_post_tags = Table(
    "blog_post_tags",
    Base.metadata,
    Column("post_id", Integer, ForeignKey("blog_posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("blog_tags.id", ondelete="CASCADE"), primary_key=True),
)


class BlogCategory(Base):
    """Blog category model with hierarchical support."""
    
    __tablename__ = "blog_categories"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    parent_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("blog_categories.id", ondelete="SET NULL"), nullable=True
    )
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    # Self-referential relationship for hierarchy
    parent: Mapped[Optional["BlogCategory"]] = relationship(
        "BlogCategory", remote_side=[id], back_populates="children"
    )
    children: Mapped[List["BlogCategory"]] = relationship(
        "BlogCategory", back_populates="parent", cascade="all, delete-orphan"
    )
    
    # Relationship to posts
    posts: Mapped[List["BlogPost"]] = relationship("BlogPost", back_populates="category_rel")


class BlogTag(Base):
    """Blog tag model."""
    
    __tablename__ = "blog_tags"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    
    # Many-to-many relationship with posts
    posts: Mapped[List["BlogPost"]] = relationship(
        "BlogPost", secondary=blog_post_tags, back_populates="tags_rel"
    )


class BlogAuthor(Base):
    """Blog author model."""
    
    __tablename__ = "blog_authors"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    role: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Relationships
    posts: Mapped[List["BlogPost"]] = relationship("BlogPost", back_populates="author")


class BlogPost(Base):
    """Blog post model."""
    
    __tablename__ = "blog_posts"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    excerpt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Content type and status
    content_type: Mapped[str] = mapped_column(
        String(20), default=ContentType.HTML.value, nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20), default=PostStatus.DRAFT.value, nullable=False
    )
    
    # Foreign keys
    author_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("blog_authors.id", ondelete="CASCADE"), nullable=False
    )
    category_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("blog_categories.id", ondelete="SET NULL"), nullable=True
    )
    
    # Legacy category field (for backward compatibility)
    category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Dates
    publish_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    updated_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Media
    featured_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Legacy tags (JSON) for backward compatibility
    tags: Mapped[Optional[str]] = mapped_column(JSON, nullable=True)
    
    # Post metadata
    read_time: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # SEO
    meta_title: Mapped[Optional[str]] = mapped_column(String(70), nullable=True)
    meta_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    meta_keywords: Mapped[Optional[str]] = mapped_column(JSON, nullable=True)
    # Optional manual JSON-LD / schema.org payload for the article page
    structured_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    # Relationships
    author: Mapped["BlogAuthor"] = relationship("BlogAuthor", back_populates="posts")
    category_rel: Mapped[Optional["BlogCategory"]] = relationship(
        "BlogCategory", back_populates="posts"
    )
    tags_rel: Mapped[List["BlogTag"]] = relationship(
        "BlogTag", secondary=blog_post_tags, back_populates="posts"
    )
