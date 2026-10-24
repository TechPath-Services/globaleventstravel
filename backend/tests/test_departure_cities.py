"""Departure city CRUD and the publish quality gate."""

from datetime import date, timedelta

import pytest

INTRO = "<p>" + ("Real, city-specific travel advice for trekkers leaving from Delhi. " * 6) + "</p>"


def _route(**overrides):
    route = {
        "to_base": "Dehradun",
        "mode": "volvo_bus",
        "operator": "UTC Volvo",
        "departure_point": "ISBT Kashmere Gate",
        "departure_time": "10:00 PM",
        "duration_hours": 7,
        "fare_min": 700,
        "fare_max": 900,
        "source": "Called operator on 2026-10-20",
    }
    route.update(overrides)
    return route


def _complete_city(**overrides):
    city = {
        "name": "Delhi",
        "slug": "delhi",
        "state": "Delhi NCR",
        "intro_html": INTRO,
        "local_tips": ["Leave by 9 PM in winter fog.", "Use gate 2 at ISBT.", "Carry snacks."],
        "faqs": [{"question": f"Question {i}?", "answer": "Answer."} for i in range(4)],
        "last_verified": date.today().isoformat(),
        "verified_by": "Ops team",
        "routes": [
            _route(),
            _route(
                mode="group_departure",
                operator="Global Events Travels",
                departure_point="Majnu ka Tilla",
                source=None,
            ),
        ],
    }
    city.update(overrides)
    return city


@pytest.fixture()
def pickup_trek(make_trek):
    return make_trek("kedarkantha", pickup_city="Dehradun")


def test_admin_endpoints_require_auth(client):
    assert client.get("/api/v1/departure-cities/admin").status_code == 401
    assert client.post("/api/v1/departure-cities", json=_complete_city()).status_code == 401


def test_draft_city_lists_quality_issues_and_stays_private(client, admin_headers):
    res = client.post(
        "/api/v1/departure-cities",
        json={"name": "Lucknow", "slug": "lucknow", "routes": [_route(operator=None)]},
        headers=admin_headers,
    )
    assert res.status_code == 201, res.text
    issues = " ".join(res.json()["quality_issues"])
    assert "Intro needs" in issues
    assert "at least 2 routes" in issues
    assert "missing: operator" in issues
    assert "local tips" in issues
    assert "FAQs" in issues
    assert "last verified" in issues
    assert "No published trek" in issues

    assert client.get("/api/v1/departure-cities").json() == []
    assert client.get("/api/v1/departure-cities/lucknow").status_code == 404
    admin_list = client.get("/api/v1/departure-cities/admin", headers=admin_headers).json()
    assert [c["slug"] for c in admin_list] == ["lucknow"]


def test_publish_blocked_until_city_passes_gate(client, admin_headers, pickup_trek):
    blocked = client.post(
        "/api/v1/departure-cities",
        json=_complete_city(is_published=True, local_tips=["Only one tip"]),
        headers=admin_headers,
    )
    assert blocked.status_code == 422
    assert "local tips" in blocked.json()["detail"]
    assert client.get("/api/v1/departure-cities/admin", headers=admin_headers).json() == []

    created = client.post(
        "/api/v1/departure-cities", json=_complete_city(is_published=True), headers=admin_headers
    )
    assert created.status_code == 201, created.text
    body = created.json()
    assert body["is_published"] is True
    assert body["quality_issues"] == []
    assert body["bases"] == ["Dehradun"]
    assert body["published_at"] is not None


def test_public_city_page_returns_routes_and_reachable_treks(
    client, admin_headers, pickup_trek, make_trek
):
    make_trek("brahmatal", pickup_city="Rishikesh")
    make_trek("nag-tibba", pickup_city=" dehradun ", status="draft")
    client.post(
        "/api/v1/departure-cities", json=_complete_city(is_published=True), headers=admin_headers
    )

    listing = client.get("/api/v1/departure-cities").json()
    assert [c["slug"] for c in listing] == ["delhi"]
    assert listing[0]["quality_issues"] == []
    assert listing[0]["is_stale"] is False

    page = client.get("/api/v1/departure-cities/delhi").json()
    assert [r["mode"] for r in page["routes"]] == ["volvo_bus", "group_departure"]
    assert [t["slug"] for t in page["reachable_treks"]] == ["kedarkantha"]


def test_update_replaces_routes_and_cannot_break_published_city(client, admin_headers, pickup_trek):
    city = client.post(
        "/api/v1/departure-cities", json=_complete_city(is_published=True), headers=admin_headers
    ).json()

    broken = client.put(
        f"/api/v1/departure-cities/{city['id']}",
        json={"routes": [_route()]},
        headers=admin_headers,
    )
    assert broken.status_code == 422
    still = client.get(f"/api/v1/departure-cities/admin/{city['id']}", headers=admin_headers)
    assert len(still.json()["routes"]) == 2

    three = [_route(), _route(mode="train", operator="Nanda Devi Express"), _route(mode="taxi")]
    ok = client.put(
        f"/api/v1/departure-cities/{city['id']}", json={"routes": three}, headers=admin_headers
    )
    assert ok.status_code == 200, ok.text
    assert [r["display_order"] for r in ok.json()["routes"]] == [0, 1, 2]

    unpublished = client.put(
        f"/api/v1/departure-cities/{city['id']}",
        json={"is_published": False, "routes": []},
        headers=admin_headers,
    )
    assert unpublished.status_code == 200
    assert client.get("/api/v1/departure-cities/delhi").status_code == 404


def test_stale_verification_blocks_publish(client, admin_headers, pickup_trek):
    old = (date.today() - timedelta(days=120)).isoformat()
    res = client.post(
        "/api/v1/departure-cities",
        json=_complete_city(is_published=True, last_verified=old),
        headers=admin_headers,
    )
    assert res.status_code == 422
    assert "re-verify" in res.json()["detail"]

    future = (date.today() + timedelta(days=3)).isoformat()
    res = client.post(
        "/api/v1/departure-cities",
        json=_complete_city(is_published=True, last_verified=future),
        headers=admin_headers,
    )
    assert res.status_code == 422


def test_route_validation_and_duplicate_slug(client, admin_headers):
    bad_mode = client.post(
        "/api/v1/departure-cities",
        json={"name": "X", "slug": "x", "routes": [_route(mode="rocket")]},
        headers=admin_headers,
    )
    assert bad_mode.status_code == 422
    bad_fare = client.post(
        "/api/v1/departure-cities",
        json={"name": "X", "slug": "x", "routes": [_route(fare_min=900, fare_max=100)]},
        headers=admin_headers,
    )
    assert bad_fare.status_code == 422

    client.post("/api/v1/departure-cities", json={"name": "X", "slug": "x"}, headers=admin_headers)
    dup = client.post(
        "/api/v1/departure-cities", json={"name": "X2", "slug": "x"}, headers=admin_headers
    )
    assert dup.status_code == 400


def test_delete_city_cascades_routes(client, admin_headers, db):
    city = client.post(
        "/api/v1/departure-cities",
        json={"name": "X", "slug": "x", "routes": [_route(), _route()]},
        headers=admin_headers,
    ).json()
    assert (
        client.delete(f"/api/v1/departure-cities/{city['id']}", headers=admin_headers).status_code
        == 200
    )
    from app.db.models import CityRoute

    assert db.query(CityRoute).count() == 0


def test_seed_marketing_is_idempotent_and_non_destructive(db, make_trek):
    from app.db.models import DepartureCity, Trek
    from app.db.seed_marketing import seed_marketing

    make_trek("kedarkantha", quiz_persona="Custom persona from admin")
    seed_marketing(db)
    seed_marketing(db)

    kedarkantha = db.query(Trek).filter(Trek.slug == "kedarkantha").one()
    assert kedarkantha.quiz_persona == "Custom persona from admin"
    assert kedarkantha.pickup_city == "Dehradun"

    drafts = db.query(Trek).filter(Trek.status == "draft").count()
    assert drafts == 10
    cities = db.query(DepartureCity).all()
    assert {c.slug for c in cities} == {"dehradun", "delhi", "chandigarh", "lucknow"}
    assert not any(c.is_published for c in cities)
