"""
Trek Pydantic schemas for request/response validation.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from app.models.batch import TrekBatchResponse


# ============================================
# Itinerary Day Schemas
# ============================================

class ItineraryDayBase(BaseModel):
    """Base schema for itinerary day."""
    day: int = Field(..., ge=1)
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    elevation_gain: int = Field(default=0, ge=0)
    distance: float = Field(default=0.0, ge=0)
    accommodation: Optional[str] = None
    meals: Optional[str] = None
    highlights: Optional[List[str]] = None


class ItineraryDayCreate(ItineraryDayBase):
    """Schema for creating an itinerary day."""
    pass


class ItineraryDayUpdate(BaseModel):
    """Schema for updating an itinerary day."""
    day: Optional[int] = Field(None, ge=1)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    elevation_gain: Optional[int] = Field(None, ge=0)
    distance: Optional[float] = Field(None, ge=0)
    accommodation: Optional[str] = None
    meals: Optional[str] = None
    highlights: Optional[List[str]] = None


class ItineraryDayResponse(ItineraryDayBase):
    """Schema for itinerary day response."""
    id: int
    trek_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================
# Trek Image Schemas
# ============================================

class TrekImageBase(BaseModel):
    """Base schema for trek image."""
    url: str
    caption: Optional[str] = None
    display_order: int = 0


class TrekImageCreate(TrekImageBase):
    """Schema for creating a trek image."""
    pass


class TrekImageResponse(TrekImageBase):
    """Schema for trek image response."""
    id: int
    trek_id: int

    class Config:
        from_attributes = True


# ============================================
# Trek FAQ Schemas
# ============================================

class TrekFAQBase(BaseModel):
    """Base schema for trek FAQ."""
    question: str = Field(..., min_length=1, max_length=500)
    answer: str = Field(..., min_length=1)
    display_order: int = Field(default=0, ge=0)


class TrekFAQCreate(TrekFAQBase):
    """Schema for creating a trek FAQ."""
    pass


class TrekFAQResponse(TrekFAQBase):
    """Schema for trek FAQ response."""
    id: int
    trek_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================
# Trek Schemas
# ============================================

class TrekBase(BaseModel):
    """Base schema for trek."""
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    short_description: Optional[str] = None
    description: str = Field(..., min_length=1)
    difficulty: str = Field(..., pattern="^(easy|moderate|difficult|challenging|extreme)$")
    duration: int = Field(..., ge=1)
    max_altitude: int = Field(default=0, ge=0)
    distance: Optional[float] = Field(None, ge=0)
    price: float = Field(..., gt=0)
    featured_image: Optional[str] = None
    gallery: Optional[List[str]] = None
    status: str = Field(default="draft", pattern="^(draft|published|archived|seasonal)$")
    featured: bool = False
    location: str = Field(..., min_length=1)
    start_point: Optional[str] = Field(None, max_length=120)
    end_point: Optional[str] = Field(None, max_length=120)
    best_season: List[str] = Field(default_factory=list)
    group_size_min: int = Field(default=1, ge=1)
    group_size_max: int = Field(default=15, ge=1)
    includes: Optional[List[str]] = None
    excludes: Optional[List[str]] = None
    equipment_list: Optional[List[str]] = None
    fitness_level: Optional[str] = None
    experience_required: Optional[str] = None
    meta_title: Optional[str] = Field(None, max_length=70)
    meta_description: Optional[str] = Field(None, max_length=160)
    meta_keywords: Optional[List[str]] = None
    map_embed: Optional[str] = None
    itinerary_pdf_url: Optional[str] = None

    @field_validator("start_point", "end_point", mode="before")
    @classmethod
    def blank_route_to_none(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        stripped = str(value).strip()
        return stripped or None


class TrekCreate(TrekBase):
    """Schema for creating a trek."""
    guide_id: Optional[int] = None
    rating: Optional[float] = Field(default=0.0, ge=0.0, le=5.0)
    review_count: Optional[int] = Field(default=0, ge=0)
    itinerary: Optional[List[ItineraryDayCreate]] = None
    images: Optional[List[TrekImageCreate]] = None
    faqs: Optional[List[TrekFAQCreate]] = None


class TrekUpdate(BaseModel):
    """Schema for updating a trek."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    short_description: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = Field(None, pattern="^(easy|moderate|difficult|challenging|extreme)$")
    duration: Optional[int] = Field(None, ge=1)
    max_altitude: Optional[int] = Field(None, ge=0)
    distance: Optional[float] = Field(None, ge=0)
    price: Optional[float] = Field(None, gt=0)
    featured_image: Optional[str] = None
    gallery: Optional[List[str]] = None
    status: Optional[str] = Field(None, pattern="^(draft|published|archived|seasonal)$")
    featured: Optional[bool] = None
    location: Optional[str] = None
    start_point: Optional[str] = Field(None, max_length=120)
    end_point: Optional[str] = Field(None, max_length=120)
    best_season: Optional[List[str]] = None
    group_size_min: Optional[int] = Field(None, ge=1)
    group_size_max: Optional[int] = Field(None, ge=1)
    includes: Optional[List[str]] = None
    excludes: Optional[List[str]] = None
    equipment_list: Optional[List[str]] = None
    fitness_level: Optional[str] = None
    experience_required: Optional[str] = None
    meta_title: Optional[str] = Field(None, max_length=70)
    meta_description: Optional[str] = Field(None, max_length=160)
    meta_keywords: Optional[List[str]] = None
    map_embed: Optional[str] = None
    itinerary_pdf_url: Optional[str] = None
    rating: Optional[float] = Field(None, ge=0.0, le=5.0)
    review_count: Optional[int] = Field(None, ge=0)
    guide_id: Optional[int] = None
    itinerary: Optional[List[ItineraryDayCreate]] = None
    faqs: Optional[List[TrekFAQCreate]] = None

    @field_validator("start_point", "end_point", mode="before")
    @classmethod
    def blank_route_to_none(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        stripped = str(value).strip()
        return stripped or None


class TrekResponse(BaseModel):
    """Schema for trek response."""
    id: int
    name: str
    slug: str
    short_description: Optional[str] = None
    description: str
    difficulty: str
    duration: int
    max_altitude: int
    distance: Optional[float] = None
    price: float
    featured_image: Optional[str] = None
    gallery: Optional[List[str]] = None
    status: str
    featured: bool
    location: str
    start_point: Optional[str] = None
    end_point: Optional[str] = None
    best_season: List[str]
    group_size_min: int
    group_size_max: int
    includes: Optional[List[str]] = None
    excludes: Optional[List[str]] = None
    equipment_list: Optional[List[str]] = None
    fitness_level: Optional[str] = None
    experience_required: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = None
    map_embed: Optional[str] = None
    itinerary_pdf_url: Optional[str] = None
    rating: float
    review_count: int
    guide_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TrekDetailResponse(TrekResponse):
    """Schema for detailed trek response with relationships."""
    itinerary: List[ItineraryDayResponse] = []
    images: List[TrekImageResponse] = []
    faqs: List[TrekFAQResponse] = []
    batches: List[TrekBatchResponse] = []

    class Config:
        from_attributes = True


class TrekListResponse(BaseModel):
    """Schema for trek list (simplified)."""
    id: int
    name: str
    slug: str
    short_description: Optional[str] = None
    difficulty: str
    duration: int
    max_altitude: int
    distance: Optional[float] = None
    price: float
    featured_image: Optional[str] = None
    status: str
    featured: bool
    location: str
    best_season: List[str] = Field(default_factory=list)
    rating: float
    review_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
