"""
Marketing models: admin-editable growth settings and "Treks from [city]" data.
"""

from datetime import date, datetime
from typing import List, Optional

from sqlalchemy import JSON, Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class MarketingSettings(Base):
    """Single-row (id=1) JSON document for student discount, quiz and calculator config.

    Stored as JSON so new settings can be added in the Pydantic schema with defaults
    without a database migration.
    """

    __tablename__ = "marketing_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=False)
    data: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class DepartureCity(Base):
    """A source city (e.g. Delhi) with verified travel routes to trek pickup points."""

    __tablename__ = "departure_cities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    state: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    hero_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    intro_html: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    local_tips: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)  # List[str]
    faqs: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)  # List[{question, answer}]

    meta_title: Mapped[Optional[str]] = mapped_column(String(70), nullable=True)
    meta_description: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)

    last_verified: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    verified_by: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    routes: Mapped[List["CityRoute"]] = relationship(
        "CityRoute",
        back_populates="city",
        cascade="all, delete-orphan",
        order_by="CityRoute.display_order",
    )


class CityRoute(Base):
    """One way of getting from a departure city to a trek pickup base (fares are one-way)."""

    __tablename__ = "city_routes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    city_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("departure_cities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Must match Trek.pickup_city (case-insensitive) to link the route to treks
    to_base: Mapped[str] = mapped_column(String(120), nullable=False)
    # group_departure | volvo_bus | ordinary_bus | train | flight | shared_cab | taxi
    mode: Mapped[str] = mapped_column(String(30), nullable=False)
    operator: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    departure_point: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    departure_time: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    duration_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fare_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    fare_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    source: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    city: Mapped["DepartureCity"] = relationship("DepartureCity", back_populates="routes")
