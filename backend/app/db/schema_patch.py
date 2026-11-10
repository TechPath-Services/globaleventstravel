"""
Additive column patches for existing databases (create_all() never ALTERs existing tables).
"""

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


def ensure_lookup_indexes(engine: Engine) -> None:
    """
    Index trek child rows used by the public trek page.

    create_all() does not ALTER existing tables, and a missing trek_id index turns
    the batch/itinerary reads into full scans on MySQL databases created earlier.
    """
    wanted = {
        "trek_images": ("ix_trek_images_trek_id", ["trek_id"]),
        "itinerary_days": ("ix_itinerary_days_trek_id", ["trek_id"]),
        "trek_faqs": ("ix_trek_faqs_trek_id", ["trek_id"]),
        "trek_batches": ("ix_trek_batches_trek_start", ["trek_id", "start_date"]),
    }
    try:
        inspector = inspect(engine)
        tables = set(inspector.get_table_names())
        for table, (name, columns) in wanted.items():
            if table not in tables:
                continue
            existing = inspector.get_indexes(table)
            covered = any(
                idx.get("column_names") == columns or idx.get("name") == name for idx in existing
            )
            if covered:
                continue
            column_sql = ", ".join(columns)
            with engine.begin() as conn:
                conn.execute(text(f"CREATE INDEX {name} ON {table} ({column_sql})"))
            print(f"[OK] Added index {name} on {table}({column_sql})")
    except Exception as e:
        print(f"Warning: could not ensure trek lookup indexes: {e}")


def ensure_additive_columns(engine: Engine) -> None:
    """Add nullable columns introduced after a table was first created. Safe to run repeatedly."""
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        dialect = engine.dialect.name
        json_null = "JSON" if dialect == "sqlite" else "JSON NULL"

        if "blog_posts" in tables:
            columns = {col["name"] for col in inspector.get_columns("blog_posts")}
            if "structured_data" not in columns:
                with engine.begin() as conn:
                    conn.execute(
                        text(f"ALTER TABLE blog_posts ADD COLUMN structured_data {json_null}")
                    )
                print("[OK] Added blog_posts.structured_data column")

        if "treks" in tables:
            trek_columns = {col["name"] for col in inspector.get_columns("treks")}
            additive = {
                "start_point": "VARCHAR(120)",
                "end_point": "VARCHAR(120)",
                "pickup_city": "VARCHAR(120)",
                "pickup_time": "VARCHAR(50)",
                "quiz_tags": json_null,
                "quiz_persona": "VARCHAR(120)",
                "quiz_share_line": "VARCHAR(255)",
            }
            with engine.begin() as conn:
                for column, ddl in additive.items():
                    if column not in trek_columns:
                        conn.execute(text(f"ALTER TABLE treks ADD COLUMN {column} {ddl}"))
                        print(f"[OK] Added treks.{column} column")
    except Exception as e:
        print(f"Warning: could not ensure additive columns: {e}")
