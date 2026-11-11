"""Rank other published treks by overlapping season and region."""

import re
from typing import Iterable, List, Optional, Sequence

from sqlalchemy.orm import Session, load_only

from app.db.models.trek import Trek
from app.services.marketing import derive_region

_MONTHS = {
    "january": 1,
    "jan": 1,
    "february": 2,
    "feb": 2,
    "march": 3,
    "mar": 3,
    "april": 4,
    "apr": 4,
    "may": 5,
    "june": 6,
    "jun": 6,
    "july": 7,
    "jul": 7,
    "august": 8,
    "aug": 8,
    "september": 9,
    "sept": 9,
    "sep": 9,
    "october": 10,
    "oct": 10,
    "november": 11,
    "nov": 11,
    "december": 12,
    "dec": 12,
}

# Himalayan trekking seasons. Explicit month names in the same label still union in.
_SEASONS = {
    "winter": {12, 1, 2},
    "spring": {3, 4, 5},
    "summer": {4, 5, 6},
    "monsoon": {7, 8, 9},
    "autumn": {9, 10, 11},
    "fall": {9, 10, 11},
}

_LIST_COLUMNS = (
    Trek.id,
    Trek.name,
    Trek.slug,
    Trek.short_description,
    Trek.difficulty,
    Trek.duration,
    Trek.max_altitude,
    Trek.distance,
    Trek.price,
    Trek.featured_image,
    Trek.status,
    Trek.featured,
    Trek.location,
    Trek.best_season,
    Trek.pickup_city,
    Trek.quiz_tags,
    Trek.rating,
    Trek.review_count,
    Trek.created_at,
    Trek.updated_at,
)


def _labels(value) -> List[str]:
    if isinstance(value, list):
        return [str(item) for item in value if item is not None and str(item).strip()]
    if isinstance(value, str) and value.strip():
        return [value]
    return []


def months_in_labels(labels: Iterable[str]) -> set[int]:
    """Months named by season labels such as 'December' or 'Spring (Mar-May)'."""
    found: set[int] = set()
    for label in labels:
        text = str(label).lower()
        for name, number in _MONTHS.items():
            if re.search(rf"\b{name}\b", text):
                found.add(number)
        for name, months in _SEASONS.items():
            if re.search(rf"\b{name}\b", text):
                found.update(months)
    return found


def location_tokens(location: Optional[str]) -> set[str]:
    tokens = set()
    for part in re.split(r"[,/|&]+", (location or "").lower()):
        cleaned = re.sub(r"[^a-z0-9\s]", " ", part)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        if cleaned and cleaned not in {"india", "the"}:
            tokens.add(cleaned)
    return tokens


def _score(
    source_months: set[int], source_region: Optional[str], source_tokens: set[str], trek: Trek
):
    months = months_in_labels(_labels(getattr(trek, "best_season", None)))
    region = derive_region(getattr(trek, "location", None))
    tokens = location_tokens(getattr(trek, "location", None))
    shared = len(source_months & months)
    same_region = int(bool(source_region and source_region == region))
    token_overlap = len(source_tokens & tokens)
    rating = float(getattr(trek, "rating", 0) or 0)
    reviews = int(getattr(trek, "review_count", 0) or 0)
    return (shared, same_region, token_overlap, rating, reviews)


def rank_related(source: Trek, candidates: Sequence[Trek], limit: int = 4) -> List[Trek]:
    """
    Prefer treks that share season months, then the same region.

    Seasonal overlaps fill the list first, so a winter trek is not padded with
    summer treks while winter alternatives exist. Region-only matches fill gaps,
    then any other published trek.
    """
    source_months = months_in_labels(_labels(getattr(source, "best_season", None)))
    source_region = derive_region(getattr(source, "location", None))
    source_tokens = location_tokens(getattr(source, "location", None))
    source_id = getattr(source, "id", None)

    scored = []
    for trek in candidates:
        if getattr(trek, "id", None) == source_id:
            continue
        if getattr(trek, "status", "published") not in (None, "published"):
            continue
        scored.append((_score(source_months, source_region, source_tokens, trek), trek))
    scored.sort(key=lambda item: item[0], reverse=True)

    seasonal = [trek for score, trek in scored if score[0] > 0]
    regional = [trek for score, trek in scored if score[0] == 0 and (score[1] or score[2])]
    rest = [trek for score, trek in scored if score[0] == 0 and not score[1] and not score[2]]

    picked: List[Trek] = []
    for group in (seasonal, regional, rest):
        for trek in group:
            if len(picked) >= limit:
                return picked
            picked.append(trek)
    return picked


def related_for_slug(db: Session, slug: str, limit: int = 4) -> Optional[List[Trek]]:
    """Published relatives for a trek slug. None when the slug does not exist."""
    source = db.query(Trek).filter(Trek.slug == slug).first()
    if source is None:
        return None
    others = (
        db.query(Trek)
        .options(load_only(*_LIST_COLUMNS))
        .filter(Trek.status == "published", Trek.id != source.id)
        .all()
    )
    return rank_related(source, others, limit)
