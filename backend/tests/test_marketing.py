"""Marketing settings, quiz/calculator trek feed, trek marketing fields and lead tracking."""


def test_settings_defaults_when_never_saved(client):
    res = client.get("/api/v1/marketing/settings")
    assert res.status_code == 200
    body = res.json()
    assert body["student_discount"]["percent"] == 10
    assert body["student_discount"]["cap_inr"] == 1500
    assert body["quiz"]["season_months"] == ["December", "January", "February", "March"]
    assert body["calculator"]["hotel_mid_per_night"] is None
    assert "summit" in body["quiz_tag_options"]
    assert "group_departure" in body["route_modes"]
    assert body["updated_at"] is None


def test_settings_update_requires_admin(client):
    res = client.put("/api/v1/marketing/settings", json={})
    assert res.status_code == 401


def test_settings_update_roundtrip(client, admin_headers):
    current = client.get("/api/v1/marketing/settings").json()
    payload = {
        "student_discount": {**current["student_discount"], "percent": 15, "cap_inr": None},
        "quiz": {**current["quiz"], "season_months": ["January", "February"]},
        "calculator": {**current["calculator"], "hotel_mid_per_night": 1800},
        "city_pages": current["city_pages"],
    }
    res = client.put("/api/v1/marketing/settings", json=payload, headers=admin_headers)
    assert res.status_code == 200, res.text
    saved = client.get("/api/v1/marketing/settings").json()
    assert saved["student_discount"]["percent"] == 15
    assert saved["student_discount"]["cap_inr"] is None
    assert saved["quiz"]["season_months"] == ["January", "February"]
    assert saved["calculator"]["hotel_mid_per_night"] == 1800
    assert saved["updated_at"] is not None


def test_settings_rejects_invalid_values(client, admin_headers):
    current = client.get("/api/v1/marketing/settings").json()
    bad_month = {**current, "quiz": {**current["quiz"], "season_months": ["Smarch"]}}
    assert (
        client.put("/api/v1/marketing/settings", json=bad_month, headers=admin_headers).status_code
        == 422
    )

    gear = current["calculator"]["gear_items"]
    dup_gear = {**current, "calculator": {**current["calculator"], "gear_items": gear + gear[:1]}}
    assert (
        client.put("/api/v1/marketing/settings", json=dup_gear, headers=admin_headers).status_code
        == 422
    )


def test_marketing_treks_scope_filters_by_quiz_season(client, make_trek, make_batch):
    winter = make_trek(
        "kedarkantha",
        quiz_tags=["summit"],
        pickup_city="Dehradun",
        location="Uttarkashi, Uttarakhand",
    )
    make_trek("valley-of-flowers", best_season=["July", "August"])
    make_trek("draft-winter", status="draft")
    make_batch(winter, 20, price_override=8999)
    make_batch(winter, 40)
    make_batch(winter, -10)
    make_batch(winter, 60, is_active=False)

    quiz = client.get("/api/v1/marketing/treks?scope=quiz").json()
    assert [t["slug"] for t in quiz] == ["kedarkantha"]
    trek = quiz[0]
    assert trek["region"] == "Uttarakhand"
    assert trek["quiz_tags"] == ["summit"]
    assert trek["pickup_city"] == "Dehradun"
    assert [b["price"] for b in trek["upcoming_batches"]] == [8999, 9999]

    everything = client.get("/api/v1/marketing/treks").json()
    assert {t["slug"] for t in everything} == {"kedarkantha", "valley-of-flowers"}

    assert client.get("/api/v1/marketing/treks?scope=bogus").status_code == 422


def test_trek_marketing_fields_validate_and_persist(client):
    base = {
        "name": "Nag Tibba",
        "slug": "nag-tibba",
        "description": "<p>Weekend trek</p>",
        "difficulty": "easy",
        "duration": 2,
        "price": 4499,
        "location": "Tehri, Uttarakhand",
        "best_season": ["January"],
    }
    bad = client.post("/api/v1/treks", json={**base, "quiz_tags": ["summit", "lava"]})
    assert bad.status_code == 422

    created = client.post(
        "/api/v1/treks",
        json={
            **base,
            "pickup_city": "  Dehradun ",
            "quiz_tags": ["weekend", "summit", "weekend"],
            "quiz_persona": "The Weekend Escape Artist",
        },
    )
    assert created.status_code == 201, created.text
    trek = created.json()
    assert trek["pickup_city"] == "Dehradun"
    assert trek["quiz_tags"] == ["weekend", "summit"]

    updated = client.put(f"/api/v1/treks/{trek['id']}", json={"pickup_city": ""})
    assert updated.status_code == 200
    assert updated.json()["pickup_city"] is None

    duplicate = client.post(f"/api/v1/treks/{trek['id']}/duplicate").json()
    assert duplicate["quiz_persona"] == "The Weekend Escape Artist"


def test_lead_accepts_notes_and_filters_by_source(client):
    lead = {
        "name": "Asha",
        "whatsapp": "9876543210",
        "trek_slug": "custom",
        "source": "student_discount",
        "notes": "College: IIT Delhi | ref: wa",
    }
    res = client.post("/api/v1/leads", json=lead)
    assert res.status_code == 201, res.text
    assert res.json()["notes"] == "College: IIT Delhi | ref: wa"
    client.post("/api/v1/leads", json={**lead, "source": "quiz_winter", "notes": None})

    filtered = client.get("/api/v1/leads?source=student_discount").json()
    assert filtered["total"] == 1
    assert filtered["items"][0]["notes"].startswith("College:")

    too_long = client.post("/api/v1/leads", json={**lead, "source": "x" * 51})
    assert too_long.status_code == 422
