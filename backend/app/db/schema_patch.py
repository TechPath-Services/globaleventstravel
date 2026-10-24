"""
Additive column patches for existing databases (create_all() never ALTERs existing tables).
"""

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


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
