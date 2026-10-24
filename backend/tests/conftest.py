"""
Test configuration: isolated SQLite database, no outbound email.

Environment variables are set before any `app` import so the cached Settings never see the
real DATABASE_URL from backend/.env.
"""

import os
import tempfile
from pathlib import Path

_TMP_DIR = Path(tempfile.mkdtemp(prefix="get-tests-"))
os.environ["DATABASE_URL"] = f"sqlite:///{(_TMP_DIR / 'test.db').as_posix()}"
os.environ["BREVO_API_KEY"] = ""
os.environ["ADMIN_EMAIL"] = ""
os.environ["USE_ALEMBIC_MIGRATIONS"] = "false"

from datetime import date, timedelta  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.core.security import create_access_token, get_password_hash  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.models import Trek, TrekBatch, User  # noqa: E402
from app.db.session import SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db(client):
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def admin_headers(db):
    user = User(
        email="admin@test.local",
        hashed_password=get_password_hash("secret"),
        full_name="Test Admin",
        role="admin",
        is_active=True,
    )
    db.add(user)
    db.commit()
    token = create_access_token({"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def make_trek(db):
    def _make(slug: str, **overrides) -> Trek:
        data = {
            "name": slug.replace("-", " ").title(),
            "slug": slug,
            "description": "<p>Test trek</p>",
            "difficulty": "easy",
            "duration": 5,
            "max_altitude": 3500,
            "price": 9999,
            "status": "published",
            "location": "Uttarkashi, Uttarakhand",
            "best_season": ["December", "January"],
        }
        data.update(overrides)
        trek = Trek(**data)
        db.add(trek)
        db.commit()
        db.refresh(trek)
        return trek

    return _make


@pytest.fixture()
def make_batch(db):
    def _make(trek: Trek, days_from_now: int, **overrides) -> TrekBatch:
        start = date.today() + timedelta(days=days_from_now)
        data = {
            "trek_id": trek.id,
            "start_date": start,
            "end_date": start + timedelta(days=trek.duration),
            "total_seats": 20,
            "booked_seats": 0,
            "is_active": True,
        }
        data.update(overrides)
        batch = TrekBatch(**data)
        db.add(batch)
        db.commit()
        db.refresh(batch)
        return batch

    return _make
