"""Expedition PDF itinerary URL round-trip.

The admin form sends itineraryPdfUrl. Detail responses used by the edit page and
the public expedition page must return that value after it is stored.
"""

from app.db.models.expedition import Expedition
from app.db.session import SessionLocal

PDF_URL = (
    "https://techpath.blob.core.windows.net/global-events-travels/"
    "itineraries/Friendship-Peak-Expedition.pdf"
)
REPLACEMENT_URL = (
    "https://techpath.blob.core.windows.net/global-events-travels/"
    "itineraries/Kedarkantha-Trek-5D4N.pdf"
)


def _payload(**overrides):
    data = {
        "name": "Friendship Peak Expedition",
        "slug": "friendship-peak-expedition",
        "difficulty": "advanced",
        "duration": 6,
        "summitAltitude": 5289,
        "baseAltitude": 2050,
        "location": "Manali, Himachal Pradesh",
        "region": "Pir Panjal Range",
        "description": "A six day climb to Friendship Peak above Manali.",
        "shortDescription": "First 5000m summit near Manali.",
        "highlights": ["Summit views"],
        "requirements": {
            "experience": "One high-altitude trek",
            "fitnessLevel": "Good",
            "technicalSkills": ["Crampon walking"],
        },
        "equipment": {"provided": ["Crampons"], "personal": ["Jacket"]},
        "price": 32000,
        "group_size_min": 4,
        "group_size_max": 12,
        "season": ["May", "June"],
        "image": "https://example.com/friendship.jpg",
        "status": "published",
        "itinerary": [
            {
                "day": 1,
                "title": "Arrival",
                "description": "Reach Manali",
                "altitude": 2050,
                "activities": ["Briefing"],
            }
        ],
    }
    data.update(overrides)
    return data


def _stored_pdf_url(expedition_id: int):
    session = SessionLocal()
    try:
        row = session.get(Expedition, expedition_id)
        return None if row is None else row.itinerary_pdf_url
    finally:
        session.close()


def test_itinerary_pdf_url_persists_and_is_returned(client):
    created = client.post("/api/v1/expeditions", json=_payload(itineraryPdfUrl=PDF_URL))
    assert created.status_code == 201, created.text
    body = created.json()
    expedition_id = body["id"]
    assert body["itineraryPdfUrl"] == PDF_URL

    by_id = client.get(f"/api/v1/expeditions/id/{expedition_id}")
    assert by_id.status_code == 200, by_id.text
    assert by_id.json()["itineraryPdfUrl"] == PDF_URL
    assert by_id.json()["itinerary"][0]["title"] == "Arrival"

    by_slug = client.get("/api/v1/expeditions/friendship-peak-expedition")
    assert by_slug.status_code == 200, by_slug.text
    assert by_slug.json()["itineraryPdfUrl"] == PDF_URL
    assert _stored_pdf_url(expedition_id) == PDF_URL

    updated = client.put(
        f"/api/v1/expeditions/{expedition_id}",
        json={"itineraryPdfUrl": REPLACEMENT_URL},
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["itineraryPdfUrl"] == REPLACEMENT_URL
    assert updated.json()["name"] == "Friendship Peak Expedition"

    reloaded = client.get(f"/api/v1/expeditions/id/{expedition_id}")
    assert reloaded.json()["itineraryPdfUrl"] == REPLACEMENT_URL
    assert _stored_pdf_url(expedition_id) == REPLACEMENT_URL

    untouched = client.put(
        f"/api/v1/expeditions/{expedition_id}",
        json={"featured": True},
    )
    assert untouched.status_code == 200, untouched.text
    assert untouched.json()["itineraryPdfUrl"] == REPLACEMENT_URL
    assert untouched.json()["featured"] is True


def test_duplicate_keeps_itinerary_pdf_url(client):
    created = client.post("/api/v1/expeditions", json=_payload(itineraryPdfUrl=PDF_URL))
    expedition_id = created.json()["id"]

    duplicated = client.post(f"/api/v1/expeditions/{expedition_id}/duplicate")
    assert duplicated.status_code == 201, duplicated.text
    body = duplicated.json()
    assert body["itineraryPdfUrl"] == PDF_URL
    assert body["id"] != expedition_id
    assert _stored_pdf_url(body["id"]) == PDF_URL
