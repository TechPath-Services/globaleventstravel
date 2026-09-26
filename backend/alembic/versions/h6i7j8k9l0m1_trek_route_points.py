"""Add start_point and end_point to treks for the detail-page hero overlay.

Revision ID: h6i7j8k9l0m1
Revises: e5f6g7h8i9j0
Create Date: 2026-09-26
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision: str = "h6i7j8k9l0m1"
down_revision: Union[str, None] = "e5f6g7h8i9j0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_exists(conn, table: str, column: str) -> bool:
    insp = inspect(conn)
    if table not in insp.get_table_names():
        return False
    return column in [c["name"] for c in insp.get_columns(table)]


def upgrade() -> None:
    conn = op.get_bind()
    if not _column_exists(conn, "treks", "start_point"):
        op.add_column("treks", sa.Column("start_point", sa.String(120), nullable=True))
    if not _column_exists(conn, "treks", "end_point"):
        op.add_column("treks", sa.Column("end_point", sa.String(120), nullable=True))


def downgrade() -> None:
    conn = op.get_bind()
    if _column_exists(conn, "treks", "end_point"):
        op.drop_column("treks", "end_point")
    if _column_exists(conn, "treks", "start_point"):
        op.drop_column("treks", "start_point")
