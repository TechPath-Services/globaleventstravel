"""
"Treks from [city]" departure city endpoints.

Publishing is gated: a city can only be (or stay) published while it passes the quality checks
in app.services.marketing.city_quality_issues (real routes, tips, FAQs, recent verification).
"""

from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_admin_user
from app.core.deps import get_db
from app.crud.departure_city import departure_city_crud
from app.db.models.marketing import DepartureCity
from app.db.models.user import User
from app.models.marketing import (
    CityPageRules,
    CityRouteResponse,
    DepartureCityCreate,
    DepartureCityDetail,
    DepartureCitySummary,
    DepartureCityUpdate,
)
from app.services import marketing as marketing_service

router = APIRouter()


def _summary(
    city: DepartureCity, rules: CityPageRules, pickup_bases: set, today: date
) -> DepartureCitySummary:
    return DepartureCitySummary(
        id=city.id,
        name=city.name,
        slug=city.slug,
        state=city.state,
        hero_image=city.hero_image,
        meta_description=city.meta_description,
        is_published=city.is_published,
        display_order=city.display_order,
        last_verified=city.last_verified,
        verified_by=city.verified_by,
        is_stale=marketing_service.is_city_stale(city, rules, today),
        route_count=len(city.routes),
        bases=marketing_service.city_bases(city),
        quality_issues=marketing_service.city_quality_issues(
            city, rules, pickup_bases=pickup_bases, today=today
        ),
        updated_at=city.updated_at,
    )


def _detail(
    db: Session,
    city: DepartureCity,
    rules: CityPageRules,
    pickup_bases: set,
    today: date,
    *,
    include_treks: bool,
) -> DepartureCityDetail:
    bases = marketing_service.city_bases(city)
    return DepartureCityDetail(
        id=city.id,
        name=city.name,
        slug=city.slug,
        state=city.state,
        display_order=city.display_order,
        hero_image=city.hero_image,
        intro_html=city.intro_html,
        local_tips=list(city.local_tips or []),
        faqs=list(city.faqs or []),
        meta_title=city.meta_title,
        meta_description=city.meta_description,
        last_verified=city.last_verified,
        verified_by=city.verified_by,
        is_published=city.is_published,
        is_stale=marketing_service.is_city_stale(city, rules, today),
        bases=bases,
        quality_issues=marketing_service.city_quality_issues(
            city, rules, pickup_bases=pickup_bases, today=today
        ),
        routes=[CityRouteResponse.model_validate(r) for r in city.routes],
        reachable_treks=(
            marketing_service.treks_for_pickup_bases(db, bases, today) if include_treks else []
        ),
        published_at=city.published_at,
        updated_at=city.updated_at,
    )


def _context(db: Session):
    rules = marketing_service.load_settings(db).city_pages
    return rules, marketing_service.published_pickup_bases(db), date.today()


def _ensure_publishable(db: Session, city: DepartureCity) -> None:
    """Raise 422 (after rolling back pending changes) if a published city fails the gate."""
    if not city.is_published:
        return
    rules, pickup_bases, today = _context(db)
    issues = marketing_service.city_quality_issues(
        city, rules, pickup_bases=pickup_bases, today=today
    )
    if issues:
        db.rollback()
        raise HTTPException(
            status_code=422,
            detail="Cannot publish this city page yet: " + " ".join(issues),
        )


@router.get("", response_model=List[DepartureCitySummary])
def list_published_cities(db: Session = Depends(get_db)):
    """Public: published departure cities."""
    rules, pickup_bases, today = _context(db)
    cities = departure_city_crud.list_all(db, published_only=True)
    summaries = [_summary(c, rules, pickup_bases, today) for c in cities]
    return [s.model_copy(update={"quality_issues": []}) for s in summaries]


@router.get("/admin", response_model=List[DepartureCitySummary])
def list_all_cities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Admin: all departure cities including drafts, with quality issues."""
    rules, pickup_bases, today = _context(db)
    cities = departure_city_crud.list_all(db)
    return [_summary(c, rules, pickup_bases, today) for c in cities]


@router.get("/admin/{city_id}", response_model=DepartureCityDetail)
def get_city_admin(
    city_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Admin: one departure city (draft or published) with routes."""
    city = departure_city_crud.get_with_routes(db, city_id)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    rules, pickup_bases, today = _context(db)
    return _detail(db, city, rules, pickup_bases, today, include_treks=True)


@router.post("", response_model=DepartureCityDetail, status_code=201)
def create_city(
    city_in: DepartureCityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Admin: create a departure city with its routes."""
    if departure_city_crud.get_by_slug(db, city_in.slug):
        raise HTTPException(status_code=400, detail="A city with this slug already exists")
    city = departure_city_crud.build(city_in)
    _ensure_publishable(db, city)
    db.add(city)
    db.commit()
    city = departure_city_crud.get_with_routes(db, city.id)
    rules, pickup_bases, today = _context(db)
    return _detail(db, city, rules, pickup_bases, today, include_treks=True)


@router.put("/{city_id}", response_model=DepartureCityDetail)
def update_city(
    city_id: int,
    city_in: DepartureCityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Admin: update a departure city. `routes`, when sent, replaces all routes."""
    city = departure_city_crud.get_with_routes(db, city_id)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    if city_in.slug and city_in.slug != city.slug:
        existing = departure_city_crud.get_by_slug(db, city_in.slug)
        if existing and existing.id != city.id:
            raise HTTPException(status_code=400, detail="A city with this slug already exists")
    departure_city_crud.apply_update(city, city_in)
    _ensure_publishable(db, city)
    db.commit()
    city = departure_city_crud.get_with_routes(db, city_id)
    rules, pickup_bases, today = _context(db)
    return _detail(db, city, rules, pickup_bases, today, include_treks=True)


@router.delete("/{city_id}")
def delete_city(
    city_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Admin: delete a departure city and its routes."""
    city = departure_city_crud.get(db, city_id)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    departure_city_crud.remove(db, id=city_id)
    return {"message": "City deleted successfully"}


@router.get("/{slug}", response_model=DepartureCityDetail)
def get_published_city(slug: str, db: Session = Depends(get_db)):
    """Public: a published city page with routes and the treks those routes reach."""
    city = departure_city_crud.get_by_slug_with_routes(db, slug)
    if not city or not city.is_published:
        raise HTTPException(status_code=404, detail="City not found")
    rules, pickup_bases, today = _context(db)
    detail = _detail(db, city, rules, pickup_bases, today, include_treks=True)
    return detail.model_copy(update={"quality_issues": []})
