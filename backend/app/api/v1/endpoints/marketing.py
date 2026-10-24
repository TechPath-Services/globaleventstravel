"""
Marketing settings and trek data for the quiz / budget calculator.
"""

from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.auth import get_current_admin_user
from app.core.deps import get_db
from app.db.models.user import User
from app.models.marketing import MarketingSettingsData, MarketingSettingsResponse, MarketingTrek
from app.services import marketing as marketing_service

router = APIRouter()


def _settings_response(db: Session) -> MarketingSettingsResponse:
    data = marketing_service.load_settings(db)
    row = marketing_service.get_settings_row(db)
    return MarketingSettingsResponse(
        **data.model_dump(), updated_at=row.updated_at if row else None
    )


@router.get("/settings", response_model=MarketingSettingsResponse)
def get_marketing_settings(db: Session = Depends(get_db)):
    """Public: student discount, quiz and calculator configuration (defaults if never saved)."""
    return _settings_response(db)


@router.put("/settings", response_model=MarketingSettingsResponse)
def update_marketing_settings(
    data: MarketingSettingsData,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Replace the marketing settings document (admin only)."""
    marketing_service.save_settings(db, data)
    return _settings_response(db)


@router.get("/treks", response_model=List[MarketingTrek])
def list_marketing_treks(
    scope: str = Query("all", pattern="^(all|quiz)$"),
    db: Session = Depends(get_db),
):
    """
    Published treks with quiz fields and upcoming batches.

    - **scope=quiz**: only treks whose best season overlaps the quiz season months
    - **scope=all**: every published trek (budget calculator)
    """
    months = None
    if scope == "quiz":
        months = marketing_service.load_settings(db).quiz.season_months
    return marketing_service.list_marketing_treks(db, months=months)
