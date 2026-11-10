"""CMS founding-year correction. Does not touch ratings or reviews."""

import json
from datetime import datetime

from app.db.models.page_content import PageSection
from app.services.founding_content import correct_founding_content


def test_corrects_story_and_years_stats_only(db):
    story = PageSection(
        page="about",
        key="story",
        body_html=(
            "<p>Global Events Travels was founded in 2016 by a group of passionate "
            "mountaineers. Trusted since 2016. A 1931 discovery stays.</p>"
        ),
        display_order=1,
        is_active=True,
    )
    stats = PageSection(
        page="home",
        key="why_choose_us",
        body_html=json.dumps(
            [
                {"value": "10,000+", "label": "Happy Trekkers"},
                {"value": "4.8", "label": "Average Rating"},
                {"value": "8+", "label": "Years Experience"},
            ]
        ),
        display_order=0,
        is_active=True,
    )
    custom = PageSection(
        page="home",
        key="custom_years",
        body_html=json.dumps([{"value": "over a decade", "label": "Years Experience"}]),
        display_order=0,
        is_active=True,
    )
    db.add_all([story, stats, custom])
    db.commit()

    updated = correct_founding_content(db, now=datetime(2026, 11, 10))
    assert updated == 2

    db.refresh(story)
    db.refresh(stats)
    db.refresh(custom)
    assert "founded in 2012" in story.body_html
    assert "since 2012" in story.body_html
    assert "1931" in story.body_html
    assert "2016" not in story.body_html

    parsed = json.loads(stats.body_html)
    assert parsed[0]["value"] == "10,000+"
    assert parsed[1] == {"value": "4.8", "label": "Average Rating"}
    assert parsed[2] == {"value": "14+", "label": "Years Experience"}
    assert json.loads(custom.body_html)[0]["value"] == "over a decade"

    assert correct_founding_content(db, now=datetime(2026, 11, 10)) == 0
