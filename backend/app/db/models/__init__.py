"""
Database models package.
All models are imported here for easy access.
"""
from app.db.models.trek import Trek, TrekImage, ItineraryDay, TrekFAQ, TrekBatch
from app.db.models.expedition import Expedition, ExpeditionDay
from app.db.models.guide import Guide
from app.db.models.booking import Booking
from app.db.models.lead import Lead
from app.db.models.contact import ContactMessage
from app.db.models.testimonial import Testimonial
from app.db.models.office import Office
from app.db.models.blog import (
    BlogPost, BlogAuthor, BlogCategory, BlogTag, 
    blog_post_tags, PostStatus, ContentType
)
from app.db.models.user import User
from app.db.models.media import Media
from app.db.models.email_log import EmailLog
from app.db.models.site_settings import SiteSettings
from app.db.models.google_review import GoogleReview
from app.db.models.google_reviews_meta import GoogleReviewsMeta
from app.db.models.marketing import MarketingSettings, DepartureCity, CityRoute

__all__ = [
    "Trek",
    "TrekImage",
    "ItineraryDay",
    "TrekFAQ",
    "TrekBatch",
    "Expedition",
    "ExpeditionDay",
    "Guide",
    "Booking",
    "Lead",
    "ContactMessage",
    "Testimonial",
    "Office",
    "BlogPost",
    "BlogAuthor",
    "BlogCategory",
    "BlogTag",
    "blog_post_tags",
    "PostStatus",
    "ContentType",
    "User",
    "Media",
    "EmailLog",
    "SiteSettings",
    "GoogleReview",
    "GoogleReviewsMeta",
    "MarketingSettings",
    "DepartureCity",
    "CityRoute",
]

