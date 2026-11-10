"""Correct the company founding year stored in CMS page sections.

The About story and the years-of-experience stats live in ``page_sections``.
Seed inserts missing rows only, so databases created with the 2016 copy keep
that text until this patch runs. Trek ratings and reviews are not touched.
"""

import json
import re
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db.models.page_content import PageSection

FOUNDED_YEAR = 2012
_YEARS_VALUE = re.compile(r"^\d+\+$")
_FOUNDED_PHRASE = re.compile(r"\bfounded in 2016\b", re.IGNORECASE)
_SINCE_PHRASE = re.compile(r"\bsince 2016\b", re.IGNORECASE)


def years_of_experience_label(now: datetime | None = None) -> str:
    """Completed years since 2012, rendered the way the site shows the stat."""
    year = (now or datetime.now(timezone.utc)).year
    return f"{max(0, year - FOUNDED_YEAR)}+"


def _patch_story(body: str) -> tuple[str, bool]:
    updated = _FOUNDED_PHRASE.sub(f"founded in {FOUNDED_YEAR}", body)
    updated = _SINCE_PHRASE.sub(f"since {FOUNDED_YEAR}", updated)
    return updated, updated != body


def _patch_stats(body: str, label: str) -> tuple[str, bool]:
    try:
        parsed = json.loads(body)
    except (TypeError, ValueError):
        return body, False
    if not isinstance(parsed, list):
        return body, False

    changed = False
    for item in parsed:
        if not isinstance(item, dict):
            continue
        item_label = item.get("label")
        value = item.get("value")
        if not isinstance(item_label, str) or "year" not in item_label.lower():
            continue
        if not isinstance(value, str) or not _YEARS_VALUE.match(value):
            continue
        if value != label:
            item["value"] = label
            changed = True
    if not changed:
        return body, False
    return json.dumps(parsed), True


def correct_founding_content(db: Session, now: datetime | None = None) -> int:
    """Update known CMS copy. Returns the number of rows changed."""
    label = years_of_experience_label(now)
    changed = 0
    for section in db.query(PageSection).all():
        body = section.body_html
        if not body:
            continue
        if section.page == "about" and section.key == "story":
            new_body, dirty = _patch_story(body)
        else:
            new_body, dirty = _patch_stats(body, label)
        if dirty:
            section.body_html = new_body
            changed += 1
    if changed:
        db.commit()
    return changed
