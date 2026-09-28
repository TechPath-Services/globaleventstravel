"""
Trek model and related tables.
"""
from datetime import date, datetime
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Text, Boolean, ForeignKey, JSON, DateTime, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Trek(Base):
    """Trek model representing a trekking package."""
    
    __tablename__ = "treks"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    short_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Difficulty: easy, moderate, difficult, challenging, extreme
    difficulty: Mapped[str] = mapped_column(String(50), nullable=False, default="moderate")
    duration: Mapped[int] = mapped_column(Integer, nullable=False)  # days
    max_altitude: Mapped[int] = mapped_column(Integer, nullable=False, default=0)  # meters
    distance: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # kilometers
    price: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Images
    featured_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    gallery: Mapped[Optional[str]] = mapped_column(JSON, nullable=True)  # List of image URLs
    
    # Status: draft, published, archived, seasonal
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="draft")
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Location & Season
    location: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    start_point: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    end_point: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    best_season: Mapped[str] = mapped_column(JSON, nullable=False, default=list)  # List of seasons
    
    # Group size
    group_size_min: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    group_size_max: Mapped[int] = mapped_column(Integer, nullable=False, default=15)
    
    # Package details (stored as JSON arrays)
    includes: Mapped[Optional[str]] = mapped_column(JSON, nullable=True)  # What's included
    excludes: Mapped[Optional[str]] = mapped_column(JSON, nullable=True)  # What's not included
    equipment_list: Mapped[Optional[str]] = mapped_column(JSON, nullable=True)  # Required equipment
    
    # Requirements
    fitness_level: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    experience_required: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # SEO
    meta_title: Mapped[Optional[str]] = mapped_column(String(70), nullable=True)
    meta_description: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    meta_keywords: Mapped[Optional[str]] = mapped_column(JSON, nullable=True)  # List of keywords
    
    # Map embed code for Google Maps
    map_embed: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # PDF Itinerary (upload URL or external URL)
    itinerary_pdf_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Ratings
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Foreign key to guide (optional)
    guide_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("guides.id", ondelete="SET NULL"), nullable=True
    )
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    guide: Mapped[Optional["Guide"]] = relationship("Guide", back_populates="treks")
    images: Mapped[List["TrekImage"]] = relationship(
        "TrekImage", back_populates="trek", cascade="all, delete-orphan"
    )
    itinerary: Mapped[List["ItineraryDay"]] = relationship(
        "ItineraryDay", back_populates="trek", cascade="all, delete-orphan",
        order_by="ItineraryDay.day"
    )
    faqs: Mapped[List["TrekFAQ"]] = relationship(
        "TrekFAQ", back_populates="trek", cascade="all, delete-orphan",
        order_by="TrekFAQ.display_order"
    )
    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="trek")
    batches: Mapped[List["TrekBatch"]] = relationship(
        "TrekBatch", back_populates="trek", cascade="all, delete-orphan",
        order_by="TrekBatch.start_date"
    )


class TrekImage(Base):
    """Additional images for a trek."""
    
    __tablename__ = "trek_images"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    trek_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("treks.id", ondelete="CASCADE"), nullable=False
    )
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    caption: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relationship
    trek: Mapped["Trek"] = relationship("Trek", back_populates="images")


class ItineraryDay(Base):
    """Day-by-day itinerary for a trek."""
    
    __tablename__ = "itinerary_days"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    trek_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("treks.id", ondelete="CASCADE"), nullable=False
    )
    day: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    elevation_gain: Mapped[int] = mapped_column(Integer, default=0)
    distance: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Additional details
    accommodation: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    meals: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    highlights: Mapped[Optional[str]] = mapped_column(JSON, nullable=True)  # List of highlights
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    # Relationship
    trek: Mapped["Trek"] = relationship("Trek", back_populates="itinerary")


class TrekFAQ(Base):
    """FAQ items for a trek."""
    
    __tablename__ = "trek_faqs"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    trek_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("treks.id", ondelete="CASCADE"), nullable=False
    )
    question: Mapped[str] = mapped_column(String(500), nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    # Relationship
    trek: Mapped["Trek"] = relationship("Trek", back_populates="faqs")


class TrekBatch(Base):
    """Departure date batch with seat availability for a trek."""

    __tablename__ = "trek_batches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    trek_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("treks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    total_seats: Mapped[int] = mapped_column(Integer, nullable=False, default=20)
    booked_seats: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    price_override: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    notes: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    trek: Mapped["Trek"] = relationship("Trek", back_populates="batches")

    @property
    def available_seats(self) -> int:
        return self.total_seats - self.booked_seats

    @property
    def is_sold_out(self) -> bool:
        return self.available_seats <= 0


# Import for type hints (avoid circular imports)
from app.db.models.guide import Guide
from app.db.models.booking import Booking
