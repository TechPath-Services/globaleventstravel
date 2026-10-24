"""
Pydantic schemas for marketing tools: settings, quiz/calculator treks and departure cities.
"""

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
]

# Quiz tag vocabulary. Admin picks from these on each trek; the quiz maps answers to them.
QUIZ_TAGS = {
    "summit": "Summit sunrise",
    "frozen_lake": "Frozen / alpine lake",
    "snow_forest": "Snowy forests",
    "meadow": "Snow meadows (bugyals)",
    "pass_crossing": "High pass crossing",
    "views": "Big Himalayan panoramas",
    "weekend": "Short / weekend trek",
    "culture": "Villages, temples & culture",
    "hot_springs": "Hot springs",
    "solitude": "Quiet, offbeat trail",
    "extreme": "Extreme / expedition-style",
}

ROUTE_MODES = (
    "group_departure",
    "volvo_bus",
    "ordinary_bus",
    "train",
    "flight",
    "shared_cab",
    "taxi",
)
ROUTE_MODE_PATTERN = "^(" + "|".join(ROUTE_MODES) + ")$"


def validate_quiz_tags(tags: Optional[List[str]]) -> Optional[List[str]]:
    """Reject unknown tags and drop duplicates while keeping order."""
    if tags is None:
        return None
    unknown = [t for t in tags if t not in QUIZ_TAGS]
    if unknown:
        raise ValueError(f"Unknown quiz tags: {', '.join(unknown)}")
    return list(dict.fromkeys(tags))


# ============================================
# Settings
# ============================================


class FAQItem(BaseModel):
    question: str = Field(..., min_length=1, max_length=500)
    answer: str = Field(..., min_length=1)


class GearItem(BaseModel):
    key: str = Field(..., pattern="^[a-z0-9_]+$", max_length=50)
    label: str = Field(..., min_length=1, max_length=120)
    rent_price: Optional[int] = Field(None, ge=0)
    buy_price: Optional[int] = Field(None, ge=0)
    # Matched (case-insensitive substring) against a trek's includes / equipment_list
    keywords: List[str] = Field(default_factory=list)


def _default_student_terms() -> List[str]:
    return [
        "Valid for students currently enrolled full-time in a recognised Indian college "
        "or university.",
        "Show a valid college ID for the current academic year plus one more proof "
        "(college email, fee receipt or bonafide certificate).",
        "Applies to the trek package price only, not to transport add-ons, rentals or "
        "offloading.",
        "One student discount per student per season. Not combinable with other offers; the "
        "best single offer applies.",
        "Name on the ID must match the booking. The trek leader checks the ID at pickup.",
    ]


def _default_student_faqs() -> List[FAQItem]:
    return [
        FAQItem(
            question="Who counts as a student?",
            answer="Anyone currently enrolled full-time in an Indian college or university. "
            "Students aged 16-17 can join with a parent or guardian's booking and consent.",
        ),
        FAQItem(
            question="Does it apply to all dates?",
            answer="Yes. The student discount applies to every open batch, including "
            "holiday departures, while seats last.",
        ),
        FAQItem(
            question="What do you do with my ID?",
            answer="We use it only to verify that you are a student, then delete the image. "
            "We keep a note that you are verified and nothing else.",
        ),
        FAQItem(
            question="Can my friend who isn't a student join?",
            answer="Yes, at the regular price in the same batch.",
        ),
    ]


class StudentDiscountSettings(BaseModel):
    enabled: bool = True
    percent: float = Field(10, ge=0, le=100)
    cap_inr: Optional[int] = Field(1500, ge=0)
    group_bonus_enabled: bool = True
    group_min_size: int = Field(8, ge=2, le=100)
    group_bonus_inr: int = Field(1000, ge=0)
    verification_time_text: str = Field("within 24 hours", max_length=120)
    terms: List[str] = Field(default_factory=_default_student_terms)
    faqs: List[FAQItem] = Field(default_factory=_default_student_faqs)


def _default_season_months() -> List[str]:
    return ["December", "January", "February", "March"]


class QuizSettings(BaseModel):
    enabled: bool = True
    title: str = Field("Which winter trek suits you?", min_length=1, max_length=120)
    subtitle: str = Field(
        "8 questions. 60 seconds. An honest pick based on your fitness, time and budget.",
        max_length=300,
    )
    season_months: List[str] = Field(default_factory=_default_season_months, min_length=1)

    @field_validator("season_months")
    @classmethod
    def valid_months(cls, value: List[str]) -> List[str]:
        unknown = [m for m in value if m not in MONTHS]
        if unknown:
            raise ValueError(f"Unknown months: {', '.join(unknown)}")
        return list(dict.fromkeys(value))


def _default_gear_items() -> List[GearItem]:
    return [
        GearItem(
            key="down_jacket", label="Down / padded jacket", keywords=["down jacket", "padded"]
        ),
        GearItem(key="trek_shoes", label="Trekking shoes", keywords=["shoes", "boots"]),
        GearItem(key="trek_poles", label="Trekking poles", keywords=["poles"]),
        GearItem(key="microspikes", label="Microspikes", keywords=["microspikes"]),
        GearItem(key="gaiters", label="Gaiters", keywords=["gaiters"]),
        GearItem(key="thermals", label="Thermal innerwear", keywords=["thermal"]),
        GearItem(key="gloves", label="Waterproof gloves", keywords=["gloves"]),
        GearItem(key="backpack", label="Backpack (40-60L)", keywords=["backpack"]),
        GearItem(key="headlamp", label="Headlamp", keywords=["headlamp"]),
    ]


class CalculatorSettings(BaseModel):
    enabled: bool = True
    price_includes_gst: bool = True
    gst_percent: float = Field(5, ge=0, le=28)
    hotel_budget_per_night: Optional[int] = Field(None, ge=0)
    hotel_mid_per_night: Optional[int] = Field(None, ge=0)
    hotel_comfort_per_night: Optional[int] = Field(None, ge=0)
    food_per_travel_day: Optional[int] = Field(None, ge=0)
    offloading_per_day: Optional[int] = Field(None, ge=0)
    insurance_per_person: Optional[int] = Field(None, ge=0)
    buffer_percent: float = Field(10, ge=0, le=50)
    gear_items: List[GearItem] = Field(default_factory=_default_gear_items)
    prices_last_checked: Optional[date] = None

    @field_validator("gear_items")
    @classmethod
    def unique_gear_keys(cls, value: List[GearItem]) -> List[GearItem]:
        keys = [g.key for g in value]
        if len(keys) != len(set(keys)):
            raise ValueError("Gear item keys must be unique")
        return value


class CityPageRules(BaseModel):
    max_age_days: int = Field(90, ge=7, le=365)
    min_routes: int = Field(2, ge=1, le=20)
    min_tips: int = Field(3, ge=0, le=20)
    min_faqs: int = Field(4, ge=0, le=20)
    min_intro_chars: int = Field(300, ge=0, le=5000)


class MarketingSettingsData(BaseModel):
    student_discount: StudentDiscountSettings = Field(default_factory=StudentDiscountSettings)
    quiz: QuizSettings = Field(default_factory=QuizSettings)
    calculator: CalculatorSettings = Field(default_factory=CalculatorSettings)
    city_pages: CityPageRules = Field(default_factory=CityPageRules)


class MarketingSettingsResponse(MarketingSettingsData):
    quiz_tag_options: dict = Field(default_factory=lambda: dict(QUIZ_TAGS))
    route_modes: List[str] = Field(default_factory=lambda: list(ROUTE_MODES))
    updated_at: Optional[datetime] = None


# ============================================
# Treks for quiz / calculator
# ============================================


class MarketingBatch(BaseModel):
    id: int
    start_date: date
    end_date: date
    price: float
    available_seats: int
    is_sold_out: bool


class MarketingTrek(BaseModel):
    id: int
    name: str
    slug: str
    short_description: Optional[str] = None
    difficulty: str
    duration: int
    max_altitude: int
    price: float
    featured_image: Optional[str] = None
    location: str
    region: Optional[str] = None
    best_season: List[str] = Field(default_factory=list)
    pickup_city: Optional[str] = None
    pickup_time: Optional[str] = None
    quiz_tags: List[str] = Field(default_factory=list)
    quiz_persona: Optional[str] = None
    quiz_share_line: Optional[str] = None
    rating: float = 0.0
    review_count: int = 0
    includes: List[str] = Field(default_factory=list)
    equipment_list: List[str] = Field(default_factory=list)
    upcoming_batches: List[MarketingBatch] = Field(default_factory=list)


# ============================================
# Departure cities ("Treks from [city]")
# ============================================


class CityRouteBase(BaseModel):
    to_base: str = Field(..., min_length=1, max_length=120)
    mode: str = Field(..., pattern=ROUTE_MODE_PATTERN)
    operator: Optional[str] = Field(None, max_length=255)
    departure_point: Optional[str] = Field(None, max_length=255)
    departure_time: Optional[str] = Field(None, max_length=120)
    duration_hours: Optional[float] = Field(None, ge=0, le=96)
    fare_min: Optional[int] = Field(None, ge=0)
    fare_max: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = Field(None, max_length=500)
    source: Optional[str] = Field(None, max_length=500)
    display_order: int = Field(0, ge=0)

    @field_validator(
        "to_base",
        "operator",
        "departure_point",
        "departure_time",
        "notes",
        "source",
        mode="before",
    )
    @classmethod
    def strip_blank(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        stripped = str(value).strip()
        return stripped or None

    @model_validator(mode="after")
    def fare_range(self):
        if (
            self.fare_min is not None
            and self.fare_max is not None
            and self.fare_max < self.fare_min
        ):
            raise ValueError("fare_max cannot be lower than fare_min")
        return self


class CityRouteIn(CityRouteBase):
    pass


class CityRouteResponse(CityRouteBase):
    id: int

    class Config:
        from_attributes = True


class DepartureCityBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    slug: str = Field(..., pattern="^[a-z0-9-]+$", max_length=120)
    state: Optional[str] = Field(None, max_length=120)
    display_order: int = Field(0, ge=0)
    hero_image: Optional[str] = Field(None, max_length=500)
    intro_html: Optional[str] = None
    local_tips: List[str] = Field(default_factory=list)
    faqs: List[FAQItem] = Field(default_factory=list)
    meta_title: Optional[str] = Field(None, max_length=70)
    meta_description: Optional[str] = Field(None, max_length=160)
    last_verified: Optional[date] = None
    verified_by: Optional[str] = Field(None, max_length=120)

    @field_validator("local_tips")
    @classmethod
    def drop_blank_tips(cls, value: List[str]) -> List[str]:
        return [t.strip() for t in value if t and t.strip()]


class DepartureCityCreate(DepartureCityBase):
    is_published: bool = False
    routes: List[CityRouteIn] = Field(default_factory=list)


class DepartureCityUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    slug: Optional[str] = Field(None, pattern="^[a-z0-9-]+$", max_length=120)
    state: Optional[str] = Field(None, max_length=120)
    display_order: Optional[int] = Field(None, ge=0)
    hero_image: Optional[str] = Field(None, max_length=500)
    intro_html: Optional[str] = None
    local_tips: Optional[List[str]] = None
    faqs: Optional[List[FAQItem]] = None
    meta_title: Optional[str] = Field(None, max_length=70)
    meta_description: Optional[str] = Field(None, max_length=160)
    last_verified: Optional[date] = None
    verified_by: Optional[str] = Field(None, max_length=120)
    is_published: Optional[bool] = None
    routes: Optional[List[CityRouteIn]] = None

    @field_validator("local_tips")
    @classmethod
    def drop_blank_tips(cls, value: Optional[List[str]]) -> Optional[List[str]]:
        if value is None:
            return None
        return [t.strip() for t in value if t and t.strip()]


class DepartureCitySummary(BaseModel):
    id: int
    name: str
    slug: str
    state: Optional[str] = None
    hero_image: Optional[str] = None
    meta_description: Optional[str] = None
    is_published: bool
    display_order: int
    last_verified: Optional[date] = None
    verified_by: Optional[str] = None
    is_stale: bool
    route_count: int
    bases: List[str]
    quality_issues: List[str]
    updated_at: datetime


class DepartureCityDetail(DepartureCityBase):
    id: int
    is_published: bool
    is_stale: bool
    bases: List[str]
    quality_issues: List[str]
    routes: List[CityRouteResponse]
    reachable_treks: List[MarketingTrek] = Field(default_factory=list)
    published_at: Optional[datetime] = None
    updated_at: datetime
