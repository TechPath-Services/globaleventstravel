"""Public trek page: bookable departures, related treks, and query shape."""

from datetime import date, datetime, timedelta, timezone

from sqlalchemy import create_engine, event, inspect, text

from app.db.models import ItineraryDay
from app.db.schema_patch import ensure_lookup_indexes
from app.db.session import engine
from app.services.departures import today_in_kolkata
from app.services.related_treks import months_in_labels, rank_related


class _Trek:
    def __init__(self, id, location, best_season, rating=0, review_count=0, status="published"):
        self.id = id
        self.location = location
        self.best_season = best_season
        self.rating = rating
        self.review_count = review_count
        self.status = status


def test_kolkata_date_crosses_utc_midnight():
    # 20:00 UTC is 01:30 the next morning in Asia/Kolkata.
    assert today_in_kolkata(datetime(2026, 11, 10, 20, 0, tzinfo=timezone.utc)) == date(
        2026, 11, 11
    )
    assert today_in_kolkata(datetime(2026, 11, 10, 12, 0, tzinfo=timezone.utc)) == date(
        2026, 11, 10
    )
    naive_utc = datetime(2026, 11, 10, 20, 0)
    assert today_in_kolkata(naive_utc) == date(2026, 11, 11)


def test_season_labels_expand_ranges_and_month_names():
    assert months_in_labels(["Spring (Mar-May)"]) == {3, 4, 5}
    assert months_in_labels(["December", "January"]) == {12, 1}
    assert months_in_labels(["Winter"]) == {12, 1, 2}


def test_related_treks_prefer_shared_season_over_same_region_summer():
    source = _Trek(1, "Uttarkashi, Uttarakhand", ["December", "January", "February", "March"], 4.9)
    brahmatal = _Trek(2, "Chamoli, Uttarakhand", ["December", "January", "February"], 4.0)
    dayara = _Trek(3, "Uttarkashi, Uttarakhand", ["December", "January"], 4.8)
    kuari = _Trek(4, "Rishikesh", ["December", "January", "February"], 5.0)
    valley = _Trek(5, "Chamoli, Uttarakhand", ["July", "August", "September"], 5.0)
    hampta = _Trek(6, "Kullu, Himachal Pradesh", ["June", "July"], 5.0)
    spring = _Trek(7, "Lohajung, Uttarakhand", ["Spring (Mar-May)"], 4.2)

    ranked = rank_related(
        source, [valley, hampta, kuari, dayara, brahmatal, spring, source], limit=4
    )
    slugs = [trek.id for trek in ranked]
    assert slugs == [brahmatal.id, kuari.id, dayara.id, spring.id]
    assert valley.id not in slugs
    assert hampta.id not in slugs


def test_related_falls_back_to_region_when_no_season_overlaps():
    source = _Trek(1, "Chamoli, Uttarakhand", ["July", "August"])
    summer = _Trek(2, "Uttarkashi, Uttarakhand", ["June"], 4.0)
    winter = _Trek(3, "Manali, Himachal Pradesh", ["January"], 5.0)
    ranked = rank_related(source, [winter, summer], limit=2)
    assert [trek.id for trek in ranked] == [summer.id, winter.id]


def test_related_endpoint_skips_drafts_and_self(client, make_trek):
    make_trek(
        "kedarkantha",
        location="Uttarkashi, Uttarakhand",
        best_season=["December", "January", "February", "March"],
        rating=4.9,
    )
    make_trek(
        "brahmatal-trek",
        location="Chamoli, Uttarakhand",
        best_season=["December", "January"],
        rating=4.4,
    )
    make_trek(
        "dayara-bugyal-trek",
        location="Dehradun, Uttarakhand",
        best_season=["December", "January"],
        rating=4.2,
    )
    make_trek(
        "kuari-pass-trek",
        location="Rishikesh",
        best_season=["December", "January", "February"],
        rating=4.6,
    )
    make_trek(
        "valley-of-flowers",
        location="Chamoli, Uttarakhand",
        best_season=["July", "August", "September"],
        rating=4.9,
    )
    make_trek(
        "draft-winter",
        status="draft",
        location="Uttarkashi, Uttarakhand",
        best_season=["December", "January"],
    )

    res = client.get("/api/v1/treks/kedarkantha/related?limit=3")
    assert res.status_code == 200, res.text
    slugs = [trek["slug"] for trek in res.json()]
    assert slugs == ["kuari-pass-trek", "brahmatal-trek", "dayara-bugyal-trek"]
    assert "valley-of-flowers" not in slugs
    assert "kedarkantha" not in slugs
    assert "draft-winter" not in slugs
    assert client.get("/api/v1/treks/missing/related").status_code == 404


def test_public_pages_hide_batches_that_already_started(client, make_trek, make_batch, monkeypatch):
    monkeypatch.setattr("app.api.v1.endpoints.treks.today_in_kolkata", lambda: date(2026, 11, 11))
    trek = make_trek("kuari-pass-trek", duration=6)
    started = make_batch(
        trek,
        0,
        start_date=date(2026, 11, 7),
        end_date=date(2026, 11, 13),
    )
    starts_today = make_batch(
        trek,
        0,
        start_date=date(2026, 11, 11),
        end_date=date(2026, 11, 17),
    )
    upcoming = make_batch(
        trek,
        0,
        start_date=date(2026, 11, 20),
        end_date=date(2026, 11, 26),
    )
    make_batch(
        trek,
        0,
        start_date=date(2026, 12, 1),
        end_date=date(2026, 12, 7),
        is_active=False,
    )

    public = client.get("/api/v1/treks/kuari-pass-trek/batches/public")
    assert public.status_code == 200, public.text
    public_ids = [batch["id"] for batch in public.json()]
    assert public_ids == [starts_today.id, upcoming.id]
    assert started.id not in public_ids

    detail = client.get("/api/v1/treks/kuari-pass-trek")
    assert [batch["id"] for batch in detail.json()["batches"]] == public_ids

    admin = client.get(f"/api/v1/treks/{trek.id}/batches")
    assert started.id in [batch["id"] for batch in admin.json()]

    by_id = client.get(f"/api/v1/treks/id/{trek.id}")
    assert started.id in [batch["id"] for batch in by_id.json()["batches"]]


def test_marketing_batches_use_kolkata_start_date(client, make_trek, make_batch, monkeypatch):
    monkeypatch.setattr("app.services.marketing.today_in_kolkata", lambda: date(2026, 11, 11))
    trek = make_trek("kedarkantha", best_season=["December", "January"])
    make_batch(
        trek, 0, start_date=date(2026, 11, 10), end_date=date(2026, 11, 16), price_override=7000
    )
    make_batch(
        trek, 0, start_date=date(2026, 11, 18), end_date=date(2026, 11, 24), price_override=8000
    )

    body = client.get("/api/v1/marketing/treks").json()
    prices = [batch["price"] for batch in body[0]["upcoming_batches"]]
    assert prices == [8000]


def test_public_trek_queries_do_not_join_batches_to_itinerary(client, db, make_trek, make_batch):
    trek = make_trek("dayara-bugyal-trek", duration=5)
    for day in range(1, 6):
        db.add(
            ItineraryDay(
                trek_id=trek.id,
                day=day,
                title=f"Day {day}",
                description="Walk through the meadow.",
                elevation_gain=100,
                distance=6,
            )
        )
    db.commit()
    for offset in range(12):
        start = today_in_kolkata() + timedelta(days=10 + offset)
        make_batch(trek, 0, start_date=start, end_date=start + timedelta(days=5))

    statements = []

    def record(conn, cursor, statement, parameters, context, executemany):
        statements.append(statement)

    event.listen(engine, "before_cursor_execute", record)
    try:
        detail = client.get("/api/v1/treks/dayara-bugyal-trek")
        detail_sql = list(statements)
        statements.clear()
        public = client.get("/api/v1/treks/dayara-bugyal-trek/batches/public")
        batch_sql = list(statements)
    finally:
        event.remove(engine, "before_cursor_execute", record)

    assert detail.status_code == 200
    assert public.status_code == 200
    assert len(detail.json()["batches"]) == 12

    def joins_children(sql: str) -> bool:
        lowered = sql.lower()
        return "itinerary_days" in lowered and "trek_batches" in lowered

    assert not any(joins_children(sql) for sql in detail_sql)
    assert any("itinerary_days" in sql.lower() for sql in detail_sql)
    assert any("trek_batches" in sql.lower() for sql in detail_sql)
    assert not any("itinerary_days" in sql.lower() for sql in batch_sql)
    assert any("trek_batches" in sql.lower() for sql in batch_sql)


def test_lookup_indexes_are_added_once_for_existing_tables():
    memory = create_engine("sqlite://")
    with memory.begin() as conn:
        conn.execute(
            text(
                "CREATE TABLE trek_batches ("
                "id INTEGER PRIMARY KEY, trek_id INTEGER, start_date DATE)"
            )
        )
        conn.execute(text("CREATE TABLE itinerary_days (id INTEGER PRIMARY KEY, trek_id INTEGER)"))
        conn.execute(text("CREATE TABLE trek_faqs (id INTEGER PRIMARY KEY, trek_id INTEGER)"))
        conn.execute(text("CREATE TABLE trek_images (id INTEGER PRIMARY KEY, trek_id INTEGER)"))

    ensure_lookup_indexes(memory)
    ensure_lookup_indexes(memory)
    indexes = {idx["name"] for idx in inspect(memory).get_indexes("trek_batches")}
    assert "ix_trek_batches_trek_start" in indexes
    faq_indexes = {tuple(idx["column_names"]) for idx in inspect(memory).get_indexes("trek_faqs")}
    assert ("trek_id",) in faq_indexes
