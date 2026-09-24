"""
FastAPI application entry point.
Global Events Travels API
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.db.base import Base
from app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Creates database tables on startup.
    Supports both Alembic migrations and create_all() fallback.
    """
    # Ensure data directory exists for SQLite
    if settings.is_sqlite:
        os.makedirs("data", exist_ok=True)
    
    # Import all models to register them
    from app.db.models import (
        Trek, TrekFAQ, Expedition, Guide, Booking, Lead,
        ContactMessage, Testimonial, Office, BlogPost, Media, EmailLog
    )
    
    # Use Alembic migrations if enabled, otherwise use create_all()
    if settings.USE_ALEMBIC_MIGRATIONS:
        try:
            from alembic.config import Config
            from alembic import command
            
            alembic_cfg = Config("alembic.ini")
            # Run migrations to head
            command.upgrade(alembic_cfg, "head")
        except Exception as e:
            # Fallback to create_all() if Alembic fails
            print(f"Warning: Alembic migration failed, falling back to create_all(): {e}")
            Base.metadata.create_all(bind=engine)
    else:
        # Default behavior: use create_all() for backward compatibility
        Base.metadata.create_all(bind=engine)

    # Additive column for existing DBs (create_all does not ALTER tables)
    try:
        from sqlalchemy import inspect, text

        inspector = inspect(engine)
        if "blog_posts" in inspector.get_table_names():
            columns = {col["name"] for col in inspector.get_columns("blog_posts")}
            if "structured_data" not in columns:
                dialect = engine.dialect.name
                with engine.begin() as conn:
                    if dialect == "sqlite":
                        conn.execute(text("ALTER TABLE blog_posts ADD COLUMN structured_data JSON"))
                    else:
                        conn.execute(text("ALTER TABLE blog_posts ADD COLUMN structured_data JSON NULL"))
                print("[OK] Added blog_posts.structured_data column")
    except Exception as e:
        print(f"Warning: could not ensure blog_posts.structured_data column: {e}")
    
    yield
    
    # Cleanup (if needed)
    pass


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## Global Events Travels API
    
    Backend API for the Global Events Travels website.
    
    ### Features
    - **Treks**: Browse and manage trekking packages
    - **Expeditions**: Mountaineering expeditions
    - **Guides**: Trek/expedition leaders
    - **Bookings**: Trek reservations
    - **Leads**: Lead capture from forms
    - **Contact**: Contact form submissions
    - **Testimonials**: Customer reviews
    - **Blog**: Travel blog posts
    - **Offices**: Company locations
    
    ### Authentication
    Currently public API. Authentication can be added later.
    """,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# Root endpoint
@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "api": settings.API_V1_PREFIX,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )

