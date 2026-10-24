"""
API v1 router - combines all endpoint routers.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    treks,
    expeditions,
    guides,
    bookings,
    leads,
    contacts,
    testimonials,
    offices,
    blog,
    health,
    uploads,
    media,
    page_content,
    site_settings,
    google_reviews,
    webhooks,
    email_logs,
    marketing,
    departure_cities,
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(treks.router, prefix="/treks", tags=["Treks"])
api_router.include_router(expeditions.router, prefix="/expeditions", tags=["Expeditions"])
api_router.include_router(guides.router, prefix="/guides", tags=["Guides"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
api_router.include_router(leads.router, prefix="/leads", tags=["Leads"])
api_router.include_router(contacts.router, prefix="/contacts", tags=["Contacts"])
api_router.include_router(testimonials.router, prefix="/testimonials", tags=["Testimonials"])
api_router.include_router(offices.router, prefix="/offices", tags=["Offices"])
api_router.include_router(blog.router, prefix="/blog", tags=["Blog"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["Uploads"])
api_router.include_router(media.router, prefix="/media", tags=["Media Library"])
api_router.include_router(page_content.router, prefix="/content", tags=["Page Content"])
api_router.include_router(site_settings.router, prefix="/site-settings", tags=["Site Settings"])
api_router.include_router(google_reviews.router, prefix="/google-reviews", tags=["Google Reviews"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
api_router.include_router(email_logs.router, prefix="/email-logs", tags=["Email Logs"])
api_router.include_router(marketing.router, prefix="/marketing", tags=["Marketing"])
api_router.include_router(
    departure_cities.router, prefix="/departure-cities", tags=["Departure Cities"]
)

