"""
Business logic for marketing tools: settings document, quiz/calculator trek projection
and the "Treks from [city]" publish quality gate.
"""

import logging
import re
from datetime import date
from typing import Iterable, List, Optional, Sequence

from pydantic import ValidationError
from sqlalchemy import String, cast, or_
from sqlalchemy.orm import Session, selectinload

from app.db.models.marketing import DepartureCity, MarketingSettings
from app.db.models.trek import Trek
from app.models.marketing import CityPageRules, MarketingBatch, MarketingSettingsData, MarketingTrek

logger = logging.getLogger(__name__)

MARKETING_SETTINGS_ID = 1
MAX_UPCOMING_BATCHES = 12

REGION_KEYWORDS = (
    ("himachal", "Himachal Pradesh"),
    ("uttarakhand", "Uttarakhand"),
    ("kashmir", "Jammu & Kashmir"),
    ("ladakh", "Ladakh"),
    ("sikkim", "Sikkim"),
)

_TAG_RE = re.compile(r"<[^>]+>")
_WS_RE = re.compile(r"\s+")


# ============================================
# Settings
# ============================================


def get_settings_row(db: Session) -> Optional[MarketingSettings]:
    return db.query(MarketingSettings).filter(MarketingSettings.id == MARKETING_SETTINGS_ID).first()


def load_settings(db: Session) -> MarketingSettingsData:
    """Stored document merged over defaults. Invalid sections fall back to their defaults."""
    row = get_settings_row(db)
    stored = dict(row.data or {}) if row else {}
    try:
        return MarketingSettingsData.model_validate(stored)
    except ValidationError as exc:
        logger.warning("Invalid marketing settings stored, using defaults per section: %s", exc)
        defaults = MarketingSettingsData()
        merged = {}
        for name in MarketingSettingsData.model_fields:
            section_model = type(getattr(defaults, name))
            try:
                merged[name] = section_model.model_validate(stored.get(name, {}))
            except ValidationError:
                merged[name] = getattr(defaults, name)
        return MarketingSettingsData(**merged)


def save_settings(db: Session, data: MarketingSettingsData) -> MarketingSettings:
    row = get_settings_row(db)
    payload = data.model_dump(mode="json")
    if row is None:
        row = MarketingSettings(id=MARKETING_SETTINGS_ID, data=payload)
        db.add(row)
    else:
        row.data = payload
    db.commit()
    db.refresh(row)
    return row


# ============================================
# Trek projection
# ============================================


def derive_region(location: Optional[str]) -> Optional[str]:
    text = (location or "").lower()
    for keyword, region in REGION_KEYWORDS:
        if keyword in text:
            return region
    return None


def _as_list(value) -> List[str]:
    if isinstance(value, list):
        return [str(v) for v in value if v is not None and str(v).strip()]
    return []


def to_marketing_trek(trek: Trek, today: date) -> MarketingTrek:
    batches = sorted(
        (b for b in trek.batches if b.is_active and b.start_date >= today),
        key=lambda b: b.start_date,
    )[:MAX_UPCOMING_BATCHES]
    return MarketingTrek(
        id=trek.id,
        name=trek.name,
        slug=trek.slug,
        short_description=trek.short_description,
        difficulty=trek.difficulty,
        duration=trek.duration,
        max_altitude=trek.max_altitude or 0,
        price=trek.price,
        featured_image=trek.featured_image,
        location=trek.location or "",
        region=derive_region(trek.location),
        best_season=_as_list(trek.best_season),
        pickup_city=trek.pickup_city,
        pickup_time=trek.pickup_time,
        quiz_tags=_as_list(trek.quiz_tags),
        quiz_persona=trek.quiz_persona,
        quiz_share_line=trek.quiz_share_line,
        rating=trek.rating or 0.0,
        review_count=trek.review_count or 0,
        includes=_as_list(trek.includes),
        equipment_list=_as_list(trek.equipment_list),
        upcoming_batches=[
            MarketingBatch(
                id=b.id,
                start_date=b.start_date,
                end_date=b.end_date,
                price=b.price_override if b.price_override is not None else trek.price,
                available_seats=b.available_seats,
                is_sold_out=b.is_sold_out,
            )
            for b in batches
        ],
    )


def list_marketing_treks(
    db: Session, *, months: Optional[Sequence[str]] = None, today: Optional[date] = None
) -> List[MarketingTrek]:
    """Published treks (optionally only those whose best_season overlaps `months`)."""
    today = today or date.today()
    query = db.query(Trek).options(selectinload(Trek.batches)).filter(Trek.status == "published")
    if months:
        season_text = cast(Trek.best_season, String)
        query = query.filter(or_(*[season_text.contains(f'"{m}"') for m in months]))
    treks = query.order_by(Trek.review_count.desc(), Trek.name.asc()).all()
    return [to_marketing_trek(t, today) for t in treks]


def treks_for_pickup_bases(
    db: Session, bases: Iterable[str], today: Optional[date] = None
) -> List[MarketingTrek]:
    wanted = {normalize_base(b) for b in bases if b}
    if not wanted:
        return []
    today = today or date.today()
    treks = (
        db.query(Trek)
        .options(selectinload(Trek.batches))
        .filter(Trek.status == "published", Trek.pickup_city.isnot(None))
        .order_by(Trek.review_count.desc(), Trek.name.asc())
        .all()
    )
    return [to_marketing_trek(t, today) for t in treks if normalize_base(t.pickup_city) in wanted]


def published_pickup_bases(db: Session) -> set:
    rows = (
        db.query(Trek.pickup_city)
        .filter(Trek.status == "published", Trek.pickup_city.isnot(None))
        .all()
    )
    return {normalize_base(r[0]) for r in rows if r[0]}


# ============================================
# Departure city quality gate
# ============================================


def normalize_base(value: Optional[str]) -> str:
    return _WS_RE.sub(" ", (value or "").strip().lower())


def plain_text(html: Optional[str]) -> str:
    return _WS_RE.sub(" ", _TAG_RE.sub(" ", html or "")).strip()


def city_bases(city: DepartureCity) -> List[str]:
    seen = {}
    for route in city.routes:
        key = normalize_base(route.to_base)
        if key and key not in seen:
            seen[key] = route.to_base.strip()
    return list(seen.values())


def is_city_stale(city: DepartureCity, rules: CityPageRules, today: Optional[date] = None) -> bool:
    today = today or date.today()
    if city.last_verified is None:
        return True
    return (today - city.last_verified).days > rules.max_age_days


ROUTE_REQUIRED_FIELDS = (
    ("operator", "operator"),
    ("departure_point", "departure point"),
    ("departure_time", "departure time"),
    ("duration_hours", "duration"),
    ("fare_min", "minimum fare"),
    ("fare_max", "maximum fare"),
    ("source", "source"),
)


def city_quality_issues(
    city: DepartureCity,
    rules: CityPageRules,
    *,
    pickup_bases: Optional[set] = None,
    today: Optional[date] = None,
) -> List[str]:
    """Everything that blocks this city page from being published (empty list = publishable)."""
    today = today or date.today()
    issues: List[str] = []

    intro_len = len(plain_text(city.intro_html))
    if intro_len < rules.min_intro_chars:
        issues.append(
            f"Intro needs at least {rules.min_intro_chars} characters of city-specific text "
            f"(currently {intro_len})."
        )

    routes = list(city.routes)
    if len(routes) < rules.min_routes:
        issues.append(f"Add at least {rules.min_routes} routes (currently {len(routes)}).")

    for index, route in enumerate(routes, start=1):
        missing = [
            label
            for field, label in ROUTE_REQUIRED_FIELDS
            if getattr(route, field) in (None, "")
            and not (field == "source" and route.mode == "group_departure")
        ]
        if missing:
            issues.append(
                f"Route {index} ({route.mode.replace('_', ' ')} to {route.to_base}) is missing: "
                f"{', '.join(missing)}."
            )

    tips = [t for t in (city.local_tips or []) if isinstance(t, str) and t.strip()]
    if len(tips) < rules.min_tips:
        issues.append(f"Add at least {rules.min_tips} local tips (currently {len(tips)}).")

    faqs = [f for f in (city.faqs or []) if isinstance(f, dict) and f.get("question")]
    if len(faqs) < rules.min_faqs:
        issues.append(f"Add at least {rules.min_faqs} FAQs (currently {len(faqs)}).")

    if city.last_verified is None:
        issues.append("Set the 'last verified' date after checking every route.")
    elif city.last_verified > today:
        issues.append("'Last verified' date cannot be in the future.")
    elif is_city_stale(city, rules, today):
        issues.append(
            f"Route data was last verified {(today - city.last_verified).days} days ago; "
            f"re-verify (limit {rules.max_age_days} days)."
        )

    if not (city.verified_by or "").strip():
        issues.append("Set 'verified by' to the person who checked the routes.")

    if pickup_bases is not None and routes:
        bases = {normalize_base(r.to_base) for r in routes}
        if not bases & pickup_bases:
            issues.append(
                "No published trek has a pickup city matching these routes "
                f"({', '.join(sorted({r.to_base for r in routes}))}). "
                "Set 'Pickup city' on the trek or fix the route destination."
            )

    return issues
