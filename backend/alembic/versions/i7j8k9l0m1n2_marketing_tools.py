"""Marketing tools: trek quiz/pickup columns, marketing settings, departure cities and routes.

Also merges the two existing heads (g5h6i7j8k9l0 and h6i7j8k9l0m1) so `alembic upgrade head`
resolves to a single revision.

Revision ID: i7j8k9l0m1n2
Revises: h6i7j8k9l0m1, g5h6i7j8k9l0
Create Date: 2026-10-24
"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy import inspect

from alembic import op

revision: str = "i7j8k9l0m1n2"
down_revision: Union[str, Sequence[str], None] = ("h6i7j8k9l0m1", "g5h6i7j8k9l0")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _trek_columns() -> list:
    return [
        sa.Column("pickup_city", sa.String(120), nullable=True),
        sa.Column("pickup_time", sa.String(50), nullable=True),
        sa.Column("quiz_tags", sa.JSON(), nullable=True),
        sa.Column("quiz_persona", sa.String(120), nullable=True),
        sa.Column("quiz_share_line", sa.String(255), nullable=True),
    ]


def _tables(conn) -> list:
    return inspect(conn).get_table_names()


def _column_exists(conn, table: str, column: str) -> bool:
    insp = inspect(conn)
    if table not in insp.get_table_names():
        return False
    return column in [c["name"] for c in insp.get_columns(table)]


def upgrade() -> None:
    conn = op.get_bind()

    for column in _trek_columns():
        if not _column_exists(conn, "treks", column.name):
            op.add_column("treks", column)

    tables = _tables(conn)
    if "marketing_settings" not in tables:
        op.create_table(
            "marketing_settings",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=False),
            sa.Column("data", sa.JSON(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
        )

    if "departure_cities" not in tables:
        op.create_table(
            "departure_cities",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("name", sa.String(120), nullable=False),
            sa.Column("slug", sa.String(120), nullable=False),
            sa.Column("state", sa.String(120), nullable=True),
            sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("hero_image", sa.String(500), nullable=True),
            sa.Column("intro_html", sa.Text(), nullable=True),
            sa.Column("local_tips", sa.JSON(), nullable=True),
            sa.Column("faqs", sa.JSON(), nullable=True),
            sa.Column("meta_title", sa.String(70), nullable=True),
            sa.Column("meta_description", sa.String(160), nullable=True),
            sa.Column("last_verified", sa.Date(), nullable=True),
            sa.Column("verified_by", sa.String(120), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("published_at", sa.DateTime(), nullable=True),
        )
        op.create_index("ix_departure_cities_id", "departure_cities", ["id"])
        op.create_index("ix_departure_cities_slug", "departure_cities", ["slug"], unique=True)

    if "city_routes" not in tables:
        op.create_table(
            "city_routes",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column(
                "city_id",
                sa.Integer(),
                sa.ForeignKey("departure_cities.id", ondelete="CASCADE"),
                nullable=False,
            ),
            sa.Column("to_base", sa.String(120), nullable=False),
            sa.Column("mode", sa.String(30), nullable=False),
            sa.Column("operator", sa.String(255), nullable=True),
            sa.Column("departure_point", sa.String(255), nullable=True),
            sa.Column("departure_time", sa.String(120), nullable=True),
            sa.Column("duration_hours", sa.Float(), nullable=True),
            sa.Column("fare_min", sa.Integer(), nullable=True),
            sa.Column("fare_max", sa.Integer(), nullable=True),
            sa.Column("notes", sa.String(500), nullable=True),
            sa.Column("source", sa.String(500), nullable=True),
            sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
        )
        op.create_index("ix_city_routes_id", "city_routes", ["id"])
        op.create_index("ix_city_routes_city_id", "city_routes", ["city_id"])


def downgrade() -> None:
    conn = op.get_bind()
    tables = _tables(conn)
    if "city_routes" in tables:
        op.drop_table("city_routes")
    if "departure_cities" in tables:
        op.drop_table("departure_cities")
    if "marketing_settings" in tables:
        op.drop_table("marketing_settings")
    for column in reversed(_trek_columns()):
        if _column_exists(conn, "treks", column.name):
            op.drop_column("treks", column.name)
