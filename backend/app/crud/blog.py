"""
CRUD operations for Blog models.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.crud.base import CRUDBase
from app.db.models.blog import BlogPost, BlogAuthor, BlogCategory, BlogTag, blog_post_tags
from app.models.blog import (
    BlogPostCreate, BlogPostUpdate,
    BlogAuthorCreate, BlogAuthorUpdate,
    BlogCategoryCreate, BlogCategoryUpdate,
    BlogTagCreate, BlogTagUpdate
)


def _status_value(status: Any) -> Optional[str]:
    if status is None:
        return None
    return status.value if hasattr(status, "value") else str(status)


def ensure_blog_publish_timestamps(
    data: Dict[str, Any],
    *,
    existing: Optional[BlogPost] = None,
) -> Dict[str, Any]:
    """
    When a post is (or stays) published, fill publish_date / published_at if missing.
    Admin currently does not send these fields.
    """
    status = _status_value(data.get("status"))
    if status is None and existing is not None:
        status = _status_value(existing.status)
    if status != "published":
        return data

    now = datetime.utcnow()
    date_str = now.strftime("%Y-%m-%d")

    incoming_date = data.get("publish_date")
    if incoming_date in (None, "") and (existing is None or not existing.publish_date):
        data["publish_date"] = date_str

    incoming_at = data.get("published_at")
    if incoming_at is None and (existing is None or not existing.published_at):
        data["published_at"] = now

    return data


class CRUDBlogAuthor(CRUDBase[BlogAuthor, BlogAuthorCreate, BlogAuthorUpdate]):
    """CRUD operations for BlogAuthor model."""
    
    def get_by_name(self, db: Session, name: str) -> Optional[BlogAuthor]:
        """Get author by name."""
        return db.query(BlogAuthor).filter(BlogAuthor.name == name).first()


class CRUDBlogCategory(CRUDBase[BlogCategory, BlogCategoryCreate, BlogCategoryUpdate]):
    """CRUD operations for BlogCategory model."""
    
    def get_by_slug(self, db: Session, slug: str) -> Optional[BlogCategory]:
        """Get category by slug."""
        return db.query(BlogCategory).filter(BlogCategory.slug == slug).first()
    
    def get_tree(
        self, 
        db: Session, 
        active_only: bool = False
    ) -> List[BlogCategory]:
        """Get all root categories (no parent) with their children."""
        query = db.query(BlogCategory).filter(BlogCategory.parent_id.is_(None))
        if active_only:
            query = query.filter(BlogCategory.is_active == True)
        return query.order_by(BlogCategory.display_order, BlogCategory.name).all()
    
    def get_all_with_counts(
        self, 
        db: Session,
        active_only: bool = False
    ) -> List[Dict[str, Any]]:
        """Get all categories with post counts."""
        query = db.query(
            BlogCategory,
            func.count(BlogPost.id).label('post_count')
        ).outerjoin(
            BlogPost, BlogPost.category_id == BlogCategory.id
        ).group_by(BlogCategory.id)
        
        if active_only:
            query = query.filter(BlogCategory.is_active == True)
        
        results = query.order_by(BlogCategory.display_order, BlogCategory.name).all()
        return [{"category": cat, "post_count": count} for cat, count in results]
    
    def get_children(self, db: Session, parent_id: int) -> List[BlogCategory]:
        """Get child categories of a parent."""
        return db.query(BlogCategory).filter(
            BlogCategory.parent_id == parent_id
        ).order_by(BlogCategory.display_order, BlogCategory.name).all()


class CRUDBlogTag(CRUDBase[BlogTag, BlogTagCreate, BlogTagUpdate]):
    """CRUD operations for BlogTag model."""
    
    def get_by_slug(self, db: Session, slug: str) -> Optional[BlogTag]:
        """Get tag by slug."""
        return db.query(BlogTag).filter(BlogTag.slug == slug).first()
    
    def get_all_with_counts(self, db: Session) -> List[Dict[str, Any]]:
        """Get all tags with post counts."""
        results = db.query(
            BlogTag,
            func.count(blog_post_tags.c.post_id).label('post_count')
        ).outerjoin(
            blog_post_tags, blog_post_tags.c.tag_id == BlogTag.id
        ).group_by(BlogTag.id).order_by(BlogTag.name).all()
        
        return [{"tag": tag, "post_count": count} for tag, count in results]
    
    def get_by_ids(self, db: Session, ids: List[int]) -> List[BlogTag]:
        """Get tags by list of IDs."""
        return db.query(BlogTag).filter(BlogTag.id.in_(ids)).all()


class CRUDBlogPost(CRUDBase[BlogPost, BlogPostCreate, BlogPostUpdate]):
    """CRUD operations for BlogPost model."""
    
    def get_with_author(self, db: Session, id: int) -> Optional[BlogPost]:
        """Get blog post with author."""
        return db.query(BlogPost).options(
            joinedload(BlogPost.author),
            joinedload(BlogPost.category_rel),
            joinedload(BlogPost.tags_rel)
        ).filter(BlogPost.id == id).first()
    
    def get_by_slug(self, db: Session, slug: str) -> Optional[BlogPost]:
        """Get blog post by slug."""
        return db.query(BlogPost).filter(BlogPost.slug == slug).first()
    
    def get_by_slug_with_author(self, db: Session, slug: str) -> Optional[BlogPost]:
        """Get blog post by slug with author."""
        return db.query(BlogPost).options(
            joinedload(BlogPost.author),
            joinedload(BlogPost.category_rel),
            joinedload(BlogPost.tags_rel)
        ).filter(BlogPost.slug == slug).first()
    
    def get_multi_with_author(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None,
        category_id: Optional[int] = None,
        featured: Optional[bool] = None,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[BlogPost]:
        """Get blog posts with author."""
        query = db.query(BlogPost).options(
            joinedload(BlogPost.author),
            joinedload(BlogPost.category_rel),
            joinedload(BlogPost.tags_rel)
        )
        
        if category:
            # Filter by category slug via FK relationship
            query = query.join(BlogCategory, BlogPost.category_id == BlogCategory.id).filter(BlogCategory.slug == category)
        if category_id:
            query = query.filter(BlogPost.category_id == category_id)
        if featured is not None:
            query = query.filter(BlogPost.featured == featured)
        if status:
            query = query.filter(BlogPost.status == status)
        if search:
            query = query.filter(
                BlogPost.title.ilike(f"%{search}%") |
                BlogPost.content.ilike(f"%{search}%")
            )
        
        return query.order_by(BlogPost.created_at.desc()).offset(skip).limit(limit).all()
    
    def get_count(
        self,
        db: Session,
        filters: Optional[Dict[str, Any]] = None
    ) -> int:
        """Get count of posts with optional filters."""
        query = db.query(func.count(BlogPost.id))
        
        if filters:
            if filters.get("category"):
                query = query.join(BlogCategory, BlogPost.category_id == BlogCategory.id).filter(BlogCategory.slug == filters["category"])
            if filters.get("category_id"):
                query = query.filter(BlogPost.category_id == filters["category_id"])
            if filters.get("featured") is not None:
                query = query.filter(BlogPost.featured == filters["featured"])
            if filters.get("status"):
                query = query.filter(BlogPost.status == filters["status"])
            if filters.get("search"):
                s = filters["search"]
                query = query.filter(
                    BlogPost.title.ilike(f"%{s}%") |
                    BlogPost.content.ilike(f"%{s}%")
                )
        
        return query.scalar() or 0
    
    def get_by_category(
        self, 
        db: Session, 
        category: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[BlogPost]:
        """Get blog posts by category slug."""
        return db.query(BlogPost).options(
            joinedload(BlogPost.author),
            joinedload(BlogPost.category_rel),
            joinedload(BlogPost.tags_rel)
        ).join(
            BlogCategory, BlogPost.category_id == BlogCategory.id
        ).filter(
            BlogCategory.slug == category
        ).order_by(BlogPost.created_at.desc()).offset(skip).limit(limit).all()
    
    def get_by_tag(
        self, 
        db: Session, 
        tag_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[BlogPost]:
        """Get blog posts by tag."""
        return db.query(BlogPost).options(
            joinedload(BlogPost.author),
            joinedload(BlogPost.category_rel),
            joinedload(BlogPost.tags_rel)
        ).join(
            blog_post_tags, blog_post_tags.c.post_id == BlogPost.id
        ).filter(
            blog_post_tags.c.tag_id == tag_id
        ).order_by(BlogPost.created_at.desc()).offset(skip).limit(limit).all()
    
    def get_recent(
        self, 
        db: Session,
        limit: int = 5
    ) -> List[BlogPost]:
        """Get most recent published blog posts."""
        return db.query(BlogPost).options(
            joinedload(BlogPost.author),
            joinedload(BlogPost.category_rel),
            joinedload(BlogPost.tags_rel)
        ).filter(
            BlogPost.status == "published"
        ).order_by(BlogPost.created_at.desc()).limit(limit).all()
    
    def get_related(
        self,
        db: Session,
        *,
        current_slug: str,
        limit: int = 3
    ) -> List[BlogPost]:
        """Get related blog posts based on category and tags."""
        current = self.get_by_slug_with_author(db, current_slug)
        if not current:
            return []
        
        # Get posts with same category
        return db.query(BlogPost).options(
            joinedload(BlogPost.author),
            joinedload(BlogPost.category_rel),
            joinedload(BlogPost.tags_rel)
        ).filter(
            BlogPost.slug != current_slug,
            BlogPost.status == "published",
            (BlogPost.category == current.category) |
            (BlogPost.category_id == current.category_id)
        ).order_by(BlogPost.created_at.desc()).limit(limit).all()
    
    def create_with_tags(
        self,
        db: Session,
        *,
        obj_in: BlogPostCreate,
        tag_ids: Optional[List[int]] = None
    ) -> BlogPost:
        """Create blog post with tags."""
        # Convert pydantic model to dict
        obj_in_data = obj_in.model_dump(exclude={"tag_ids"}, by_alias=False)
        
        # Map aliased fields to db fields
        field_mapping = {
            "publishDate": "publish_date",
            "updatedDate": "updated_date",
            "featuredImage": "featured_image",
            "readTime": "read_time",
            "metaTitle": "meta_title",
            "metaDescription": "meta_description",
            "metaKeywords": "meta_keywords",
            "contentType": "content_type",
            "structuredData": "structured_data",
        }
        
        for alias, db_field in field_mapping.items():
            if alias in obj_in_data:
                obj_in_data[db_field] = obj_in_data.pop(alias)
        
        # Handle enums
        if "content_type" in obj_in_data and hasattr(obj_in_data["content_type"], "value"):
            obj_in_data["content_type"] = obj_in_data["content_type"].value
        if "status" in obj_in_data and hasattr(obj_in_data["status"], "value"):
            obj_in_data["status"] = obj_in_data["status"].value

        obj_in_data = ensure_blog_publish_timestamps(obj_in_data)

        db_obj = BlogPost(**obj_in_data)
        
        # Add tags
        if tag_ids:
            tags = db.query(BlogTag).filter(BlogTag.id.in_(tag_ids)).all()
            db_obj.tags_rel = tags
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_with_tags(
        self,
        db: Session,
        *,
        db_obj: BlogPost,
        obj_in: BlogPostUpdate,
        tag_ids: Optional[List[int]] = None
    ) -> BlogPost:
        """Update blog post with tags."""
        update_data = obj_in.model_dump(exclude_unset=True, exclude={"tag_ids"}, by_alias=False)
        
        # Map aliased fields to db fields
        field_mapping = {
            "publishDate": "publish_date",
            "updatedDate": "updated_date",
            "featuredImage": "featured_image",
            "readTime": "read_time",
            "metaTitle": "meta_title",
            "metaDescription": "meta_description",
            "metaKeywords": "meta_keywords",
            "contentType": "content_type",
            "structuredData": "structured_data",
        }
        
        for alias, db_field in field_mapping.items():
            if alias in update_data:
                update_data[db_field] = update_data.pop(alias)
        
        # Handle enums
        if "content_type" in update_data and hasattr(update_data["content_type"], "value"):
            update_data["content_type"] = update_data["content_type"].value
        if "status" in update_data and hasattr(update_data["status"], "value"):
            update_data["status"] = update_data["status"].value

        update_data = ensure_blog_publish_timestamps(update_data, existing=db_obj)

        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        # Update tags if provided
        if tag_ids is not None:
            tags = db.query(BlogTag).filter(BlogTag.id.in_(tag_ids)).all()
            db_obj.tags_rel = tags
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


blog_author_crud = CRUDBlogAuthor(BlogAuthor)
blog_category_crud = CRUDBlogCategory(BlogCategory)
blog_tag_crud = CRUDBlogTag(BlogTag)
blog_crud = CRUDBlogPost(BlogPost)
