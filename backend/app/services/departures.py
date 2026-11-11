"""Bookable departure dates, evaluated at request time in Asia/Kolkata."""

from datetime import date, datetime
from typing import Optional, Union
from zoneinfo import ZoneInfo

KOLKATA = ZoneInfo("Asia/Kolkata")


def today_in_kolkata(now: Optional[datetime] = None) -> date:
    """Calendar date in Asia/Kolkata. Naive datetimes are treated as UTC."""
    if now is None:
        return datetime.now(KOLKATA).date()
    if now.tzinfo is None:
        now = now.replace(tzinfo=ZoneInfo("UTC"))
    return now.astimezone(KOLKATA).date()


def is_bookable_start(start: Union[date, str], today: date, is_active: bool = True) -> bool:
    """A departure is bookable only when it is active and has not already started."""
    if not is_active:
        return False
    if isinstance(start, str):
        start = date.fromisoformat(start[:10])
    return start >= today
