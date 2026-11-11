"""
Blog API endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.core.config import settings
from app.crud.blog import blog_crud, blog_author_crud, blog_category_crud, blog_tag_crud
from app.models.blog import (
    BlogPostCreate, BlogPostUpdate, 
    BlogPostResponse, BlogPostListResponse,
    BlogAuthorCreate, BlogAuthorUpdate, BlogAuthorResponse,
    BlogCategoryCreate, BlogCategoryUpdate, BlogCategoryResponse, BlogCategoryTreeResponse,
    BlogTagCreate, BlogTagUpdate, BlogTagResponse
)
from app.models.common import PaginatedResponse

router = APIRouter()


# ============================================
# Blog Category Endpoints
# ============================================

@router.get("/categories", response_model=List[BlogCategoryResponse])
def list_categories(
    active_only: bool = Query(False),
    db: Session = Depends(get_db),
):
    """Get flat list of all categories."""
    categories = blog_category_crud.get_multi(db, limit=1000)
    if active_only:
        categories = [c for c in categories if c.is_active]
    return [BlogCategoryResponse.model_validate(c) for c in categories]


@router.get("/categories/tree", response_model=List[BlogCategoryTreeResponse])
def get_category_tree(
    active_only: bool = Query(False),
    db: Session = Depends(get_db),
):
    """Get hierarchical category tree."""
    categories_with_counts = blog_category_crud.get_all_with_counts(db, active_only=active_only)
    
    # Build tree structure
    category_map = {}
    for item in categories_with_counts:
        cat = item["category"]
        category_map[cat.id] = {
            "category": cat,
            "post_count": item["post_count"],
            "children": []
        }
    
    # Build the tree
    root_categories = []
    for cat_id, data in category_map.items():
        cat = data["category"]
        if cat.parent_id is None:
            root_categories.append(data)
        elif cat.parent_id in category_map:
            category_map[cat.parent_id]["children"].append(data)
    
    def build_response(data) -> BlogCategoryTreeResponse:
        cat = data["category"]
        return BlogCategoryTreeResponse(
            id=cat.id,
            name=cat.name,
            slug=cat.slug,
            description=cat.description,
            parent_id=cat.parent_id,
            display_order=cat.display_order,
            is_active=cat.is_active,
            created_at=cat.created_at,
            updated_at=cat.updated_at,
            post_count=data["post_count"],
            children=[build_response(child) for child in data["children"]]
        )
    
    return [build_response(data) for data in sorted(root_categories, key=lambda x: (x["category"].display_order, x["category"].name))]


@router.post("/categories", response_model=BlogCategoryResponse, status_code=201)
def create_category(
    category_in: BlogCategoryCreate,
    db: Session = Depends(get_db),
):
    """Create a new category."""
    # Check if slug exists
    existing = blog_category_crud.get_by_slug(db, category_in.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Category with this slug already exists")
    
    # Verify parent exists if specified
    if category_in.parent_id:
        parent = blog_category_crud.get(db, category_in.parent_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent category not found")
    
    category = blog_category_crud.create(db, obj_in=category_in)
    return BlogCategoryResponse.model_validate(category)


@router.get("/categories/{category_id}", response_model=BlogCategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
):
    """Get a category by ID."""
    category = blog_category_crud.get(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return BlogCategoryResponse.model_validate(category)


@router.put("/categories/{category_id}", response_model=BlogCategoryResponse)
def update_category(
    category_id: int,
    category_in: BlogCategoryUpdate,
    db: Session = Depends(get_db),
):
    """Update a category."""
    category = blog_category_crud.get(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check slug uniqueness if updating slug
    if category_in.slug and category_in.slug != category.slug:
        existing = blog_category_crud.get_by_slug(db, category_in.slug)
        if existing:
            raise HTTPException(status_code=400, detail="Category with this slug already exists")
    
    # Prevent circular reference
    if category_in.parent_id == category_id:
        raise HTTPException(status_code=400, detail="Category cannot be its own parent")
    
    category = blog_category_crud.update(db, db_obj=category, obj_in=category_in)
    return BlogCategoryResponse.model_validate(category)


@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
):
    """Delete a category."""
    category = blog_category_crud.get(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if category has children
    children = blog_category_crud.get_children(db, category_id)
    if children:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete category with children. Delete children first."
        )
    
    blog_category_crud.remove(db, id=category_id)
    return {"message": "Category deleted successfully"}


# ============================================
# Blog Tag Endpoints
# ============================================

@router.get("/tags", response_model=List[BlogTagResponse])
def list_tags(
    db: Session = Depends(get_db),
):
    """Get all tags with post counts."""
    tags_with_counts = blog_tag_crud.get_all_with_counts(db)
    return [
        BlogTagResponse(
            id=item["tag"].id,
            name=item["tag"].name,
            slug=item["tag"].slug,
            post_count=item["post_count"],
            created_at=item["tag"].created_at
        )
        for item in tags_with_counts
    ]


@router.post("/tags", response_model=BlogTagResponse, status_code=201)
def create_tag(
    tag_in: BlogTagCreate,
    db: Session = Depends(get_db),
):
    """Create a new tag."""
    # Check if slug exists
    existing = blog_tag_crud.get_by_slug(db, tag_in.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Tag with this slug already exists")
    
    tag = blog_tag_crud.create(db, obj_in=tag_in)
    return BlogTagResponse(
        id=tag.id,
        name=tag.name,
        slug=tag.slug,
        post_count=0,
        created_at=tag.created_at
    )


@router.put("/tags/{tag_id}", response_model=BlogTagResponse)
def update_tag(
    tag_id: int,
    tag_in: BlogTagUpdate,
    db: Session = Depends(get_db),
):
    """Update a tag."""
    tag = blog_tag_crud.get(db, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    # Check slug uniqueness if updating slug
    if tag_in.slug and tag_in.slug != tag.slug:
        existing = blog_tag_crud.get_by_slug(db, tag_in.slug)
        if existing:
            raise HTTPException(status_code=400, detail="Tag with this slug already exists")

    tag = blog_tag_crud.update(db, db_obj=tag, obj_in=tag_in)
    return BlogTagResponse(
        id=tag.id,
        name=tag.name,
        slug=tag.slug,
        post_count=0,
        created_at=tag.created_at,
    )


@router.delete("/tags/{tag_id}")
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
):
    """Delete a tag."""
    tag = blog_tag_crud.get(db, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    blog_tag_crud.remove(db, id=tag_id)
    return {"message": "Tag deleted successfully"}


# ============================================
# Blog Post Endpoints
# ============================================

@router.get("/posts", response_model=PaginatedResponse[BlogPostListResponse])
def list_blog_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(None),
    category: Optional[str] = None,
    category_id: Optional[int] = None,
    featured: Optional[bool] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    hide_redirected: bool = Query(False),
    db: Session = Depends(get_db),
):
    """Get list of blog posts with optional filters."""
    if limit is None:
        limit = settings.DEFAULT_PAGE_SIZE
    limit = min(limit, settings.MAX_PAGE_SIZE)
    
    posts = blog_crud.get_multi_with_author(
        db, 
        skip=skip, 
        limit=limit,
        category=category,
        category_id=category_id,
        featured=featured,
        status=status,
        search=search,
        hide_redirected=hide_redirected,
    )
    
    # Count total
    filters = {}
    if category:
        filters["category"] = category
    if category_id:
        filters["category_id"] = category_id
    if featured is not None:
        filters["featured"] = featured
    if status:
        filters["status"] = status
    if search:
        filters["search"] = search
    if hide_redirected:
        filters["hide_redirected"] = True
    total = blog_crud.get_count(db, filters=filters)
    
    return PaginatedResponse(
        items=[BlogPostListResponse.from_orm_model(p) for p in posts],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/posts/featured", response_model=List[BlogPostListResponse])
def list_featured_posts(
    limit: int = Query(4, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """Get featured blog posts."""
    posts = blog_crud.get_multi_with_author(
        db, featured=True, status="published", limit=limit, hide_redirected=True
    )
    return [BlogPostListResponse.from_orm_model(p) for p in posts]


@router.get("/posts/recent", response_model=List[BlogPostListResponse])
def list_recent_posts(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """Get most recent blog posts."""
    posts = blog_crud.get_recent(db, limit=limit)
    return [BlogPostListResponse.from_orm_model(p) for p in posts]


@router.get("/posts/category/{category}", response_model=List[BlogPostListResponse])
def list_posts_by_category(
    category: str,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Get blog posts by category."""
    posts = blog_crud.get_by_category(db, category, limit=limit)
    return [BlogPostListResponse.from_orm_model(p) for p in posts]


@router.get("/posts/{slug}", response_model=BlogPostResponse)
def get_blog_post(
    slug: str,
    db: Session = Depends(get_db),
):
    """Get a blog post by slug."""
    post = blog_crud.get_by_slug_with_author(db, slug)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return BlogPostResponse.from_orm_model(post)


@router.get("/posts/id/{post_id}", response_model=BlogPostResponse)
def get_blog_post_by_id(
    post_id: int,
    db: Session = Depends(get_db),
):
    """Get a blog post by ID."""
    post = blog_crud.get_with_author(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return BlogPostResponse.from_orm_model(post)


@router.get("/posts/{slug}/related", response_model=List[BlogPostListResponse])
def get_related_posts(
    slug: str,
    limit: int = Query(3, ge=1, le=10),
    db: Session = Depends(get_db),
):
    """Get related blog posts."""
    posts = blog_crud.get_related(db, current_slug=slug, limit=limit)
    return [BlogPostListResponse.from_orm_model(p) for p in posts]


@router.post("/posts", response_model=BlogPostResponse, status_code=201)
def create_blog_post(
    post_in: BlogPostCreate,
    db: Session = Depends(get_db),
):
    """Create a new blog post."""
    # Check if slug exists
    existing = blog_crud.get_by_slug(db, post_in.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Blog post with this slug already exists")
    
    # Verify author exists
    author = blog_author_crud.get(db, post_in.author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    # Verify category exists if specified
    if post_in.category_id:
        category = blog_category_crud.get(db, post_in.category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
    
    # Create post with tags
    db_post = blog_crud.create_with_tags(
        db, 
        obj_in=post_in, 
        tag_ids=post_in.tag_ids
    )
    
    # Reload with relationships
    post = blog_crud.get_with_author(db, db_post.id)
    return BlogPostResponse.from_orm_model(post)


@router.put("/posts/{post_id}", response_model=BlogPostResponse)
def update_blog_post(
    post_id: int,
    post_in: BlogPostUpdate,
    db: Session = Depends(get_db),
):
    """Update a blog post."""
    post = blog_crud.get(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # Check slug uniqueness if updating slug
    if post_in.slug and post_in.slug != post.slug:
        existing = blog_crud.get_by_slug(db, post_in.slug)
        if existing:
            raise HTTPException(status_code=400, detail="Blog post with this slug already exists")
    
    # Verify category exists if specified
    if post_in.category_id:
        category = blog_category_crud.get(db, post_in.category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
    
    # Update post with tags
    db_post = blog_crud.update_with_tags(
        db, 
        db_obj=post, 
        obj_in=post_in,
        tag_ids=post_in.tag_ids
    )
    
    # Reload with relationships
    updated_post = blog_crud.get_with_author(db, db_post.id)
    return BlogPostResponse.from_orm_model(updated_post)


@router.delete("/posts/{post_id}")
def delete_blog_post(
    post_id: int,
    db: Session = Depends(get_db),
):
    """Delete a blog post."""
    post = blog_crud.get(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    blog_crud.remove(db, id=post_id)
    return {"message": "Blog post deleted successfully"}


# ============================================
# Blog Author Endpoints
# ============================================

@router.get("/authors", response_model=List[BlogAuthorResponse])
def list_blog_authors(
    db: Session = Depends(get_db),
):
    """Get list of blog authors."""
    authors = blog_author_crud.get_multi(db, limit=100)
    return [BlogAuthorResponse.model_validate(a) for a in authors]


@router.get("/authors/{author_id}", response_model=BlogAuthorResponse)
def get_blog_author(
    author_id: int,
    db: Session = Depends(get_db),
):
    """Get a blog author by ID."""
    author = blog_author_crud.get(db, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return BlogAuthorResponse.model_validate(author)


@router.post("/authors", response_model=BlogAuthorResponse, status_code=201)
def create_blog_author(
    author_in: BlogAuthorCreate,
    db: Session = Depends(get_db),
):
    """Create a new blog author."""
    author = blog_author_crud.create(db, obj_in=author_in)
    return BlogAuthorResponse.model_validate(author)


@router.put("/authors/{author_id}", response_model=BlogAuthorResponse)
def update_blog_author(
    author_id: int,
    author_in: BlogAuthorUpdate,
    db: Session = Depends(get_db),
):
    """Update a blog author."""
    author = blog_author_crud.get(db, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    author = blog_author_crud.update(db, db_obj=author, obj_in=author_in)
    return BlogAuthorResponse.model_validate(author)


@router.delete("/authors/{author_id}")
def delete_blog_author(
    author_id: int,
    db: Session = Depends(get_db),
):
    """Delete a blog author. Prevents deletion if author has posts."""
    from app.db.models.blog import BlogPost

    author = blog_author_crud.get(db, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    post_count = db.query(BlogPost).filter(BlogPost.author_id == author_id).count()
    if post_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete author with {post_count} post(s). Reassign posts first.",
        )

    blog_author_crud.remove(db, id=author_id)
    return {"message": "Author deleted successfully"}
