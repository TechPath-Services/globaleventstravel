"""
Expedition Pydantic schemas for request/response validation.
"""
from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field


# ============================================
# Expedition Day Schemas
# ============================================

class ExpeditionDayBase(BaseModel):
    """Base schema for expedition day."""
    day: int
    title: str
    description: str
    altitude: int
    activities: List[str]


class ExpeditionDayCreate(ExpeditionDayBase):
    """Schema for creating an expedition day."""
    pass


class ExpeditionDayResponse(ExpeditionDayBase):
    """Schema for expedition day response."""
    id: int
    expedition_id: int

    class Config:
        from_attributes = True


# ============================================
# Expedition Schemas
# ============================================

class ExpeditionRequirements(BaseModel):
    """Requirements for an expedition."""
    experience: str
    fitnessLevel: str
    technicalSkills: List[str]


class ExpeditionEquipment(BaseModel):
    """Equipment for an expedition."""
    provided: List[str]
    personal: List[str]


class GroupSize(BaseModel):
    """Group size constraints."""
    min: int
    max: int


class ExpeditionBase(BaseModel):
    """Base schema for expedition."""
    name: str = Field(..., min_length=2, max_length=255)
    slug: str = Field(..., min_length=2, max_length=255)
    difficulty: str = Field(..., pattern="^(advanced|expert|extreme)$")
    duration: int = Field(..., gt=0)
    summit_altitude: int = Field(..., alias="summitAltitude")
    base_altitude: int = Field(..., alias="baseAltitude")
    location: str
    region: str
    description: str
    short_description: str = Field(..., alias="shortDescription")
    highlights: List[str]
    requirements: ExpeditionRequirements
    equipment: ExpeditionEquipment
    price: float = Field(..., gt=0)
    group_size_min: int = Field(..., gt=0)
    group_size_max: int = Field(..., gt=0)
    season: List[str]
    success_rate: int = Field(default=0, ge=0, le=100, alias="successRate")
    image: str
    gallery: Optional[List[str]] = None
    safety_info: Optional[str] = Field(None, alias="safetyInfo")
    rating: float = Field(default=0.0, ge=0, le=5)
    review_count: int = Field(default=0, ge=0, alias="reviewCount")
    featured: bool = False
    status: str = Field(default="draft", pattern="^(draft|published|archived)$")
    itinerary_pdf_url: Optional[str] = Field(None, alias="itineraryPdfUrl")

    class Config:
        populate_by_name = True


class ExpeditionCreate(ExpeditionBase):
    """Schema for creating an expedition."""
    itinerary: Optional[List[ExpeditionDayCreate]] = None


class ExpeditionUpdate(BaseModel):
    """Schema for updating an expedition."""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    slug: Optional[str] = Field(None, min_length=2, max_length=255)
    difficulty: Optional[str] = Field(None, pattern="^(advanced|expert|extreme)$")
    duration: Optional[int] = Field(None, gt=0)
    summit_altitude: Optional[int] = Field(None, alias="summitAltitude")
    base_altitude: Optional[int] = Field(None, alias="baseAltitude")
    location: Optional[str] = None
    region: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, alias="shortDescription")
    highlights: Optional[List[str]] = None
    requirements: Optional[ExpeditionRequirements] = None
    equipment: Optional[ExpeditionEquipment] = None
    price: Optional[float] = Field(None, gt=0)
    group_size_min: Optional[int] = Field(None, gt=0)
    group_size_max: Optional[int] = Field(None, gt=0)
    season: Optional[List[str]] = None
    success_rate: Optional[int] = Field(None, ge=0, le=100, alias="successRate")
    image: Optional[str] = None
    gallery: Optional[List[str]] = None
    safety_info: Optional[str] = Field(None, alias="safetyInfo")
    rating: Optional[float] = Field(None, ge=0, le=5)
    review_count: Optional[int] = Field(None, ge=0, alias="reviewCount")
    featured: Optional[bool] = None
    status: Optional[str] = Field(None, pattern="^(draft|published|archived)$")
    itinerary_pdf_url: Optional[str] = Field(None, alias="itineraryPdfUrl")
    itinerary: Optional[List[ExpeditionDayCreate]] = None

    class Config:
        populate_by_name = True


class ExpeditionResponse(BaseModel):
    """Schema for expedition response."""
    id: int
    name: str
    slug: str
    difficulty: str
    duration: int
    summitAltitude: int
    baseAltitude: int
    location: str
    region: str
    description: str
    shortDescription: str
    highlights: List[str]
    requirements: ExpeditionRequirements
    equipment: ExpeditionEquipment
    price: float
    groupSize: GroupSize
    season: List[str]
    successRate: int
    image: str
    gallery: Optional[List[str]] = None
    safetyInfo: Optional[str] = None
    rating: float
    reviewCount: int
    featured: bool
    status: str
    itineraryPdfUrl: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_model(cls, obj):
        """Convert ORM model to response schema."""
        return cls(
            id=obj.id,
            name=obj.name,
            slug=obj.slug,
            difficulty=obj.difficulty,
            duration=obj.duration,
            summitAltitude=obj.summit_altitude,
            baseAltitude=obj.base_altitude,
            location=obj.location,
            region=obj.region,
            description=obj.description,
            shortDescription=obj.short_description,
            highlights=obj.highlights,
            requirements=obj.requirements,
            equipment=obj.equipment,
            price=obj.price,
            groupSize=GroupSize(min=obj.group_size_min, max=obj.group_size_max),
            season=obj.season,
            successRate=obj.success_rate,
            image=obj.image,
            gallery=obj.gallery,
            safetyInfo=obj.safety_info,
            rating=obj.rating,
            reviewCount=obj.review_count,
            featured=obj.featured,
            status=obj.status,
            itineraryPdfUrl=getattr(obj, "itinerary_pdf_url", None),
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )


class ExpeditionDetailResponse(ExpeditionResponse):
    """Schema for detailed expedition response."""
    itinerary: List[ExpeditionDayResponse] = []

    @classmethod
    def from_orm_model(cls, obj):
        """Convert ORM model (with itinerary) to detailed response schema."""
        # Reuse base mapping logic
        base = ExpeditionResponse.from_orm_model(obj)
        return cls(
            **base.model_dump(),
            itinerary=[ExpeditionDayResponse.model_validate(day) for day in getattr(obj, "itinerary", [])],
        )


class ExpeditionListResponse(BaseModel):
    """Schema for expedition list (simplified)."""
    id: int
    name: str
    slug: str
    difficulty: str
    duration: int
    summitAltitude: int
    location: str
    region: str
    shortDescription: str
    price: float
    groupSize: GroupSize
    season: List[str]
    successRate: int
    image: str
    rating: float
    reviewCount: int
    featured: bool
    status: str
    itineraryPdfUrl: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_model(cls, obj):
        """Convert ORM model to list response schema."""
        return cls(
            id=obj.id,
            name=obj.name,
            slug=obj.slug,
            difficulty=obj.difficulty,
            duration=obj.duration,
            summitAltitude=obj.summit_altitude,
            location=obj.location,
            region=obj.region,
            shortDescription=obj.short_description,
            price=obj.price,
            groupSize=GroupSize(min=obj.group_size_min, max=obj.group_size_max),
            season=obj.season,
            successRate=obj.success_rate,
            image=obj.image,
            rating=obj.rating,
            reviewCount=obj.review_count,
            featured=obj.featured,
            status=obj.status,
            itineraryPdfUrl=getattr(obj, "itinerary_pdf_url", None),
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )

