from __future__ import annotations

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


def _column_names(engine: Engine, table_name: str) -> set[str]:
    with engine.connect() as conn:
        inspector = inspect(conn)
        if table_name not in inspector.get_table_names():
            return set()
        return {col["name"] for col in inspector.get_columns(table_name)}


def ensure_test_schema(engine: Engine) -> None:
    """Ensure tests/test_results tables have columns expected by current models.

    This keeps older databases (created_by/user_id/answers/type) compatible
    with newer code (creator_id/student_id/submitted_answers/subject).
    """
    dialect = engine.dialect.name

    with engine.begin() as conn:
        tables = set(inspect(conn).get_table_names())
        if "tests" in tables:
            cols = _column_names(engine, "tests")
            if "creator_id" not in cols and "created_by" in cols:
                conn.execute(text("ALTER TABLE tests ADD COLUMN creator_id INTEGER"))
                conn.execute(text("UPDATE tests SET creator_id = created_by WHERE creator_id IS NULL"))
            if "subject" not in cols and "type" in cols:
                conn.execute(text("ALTER TABLE tests ADD COLUMN subject VARCHAR(100)"))
                conn.execute(text("UPDATE tests SET subject = type WHERE subject IS NULL"))
            if "is_active" not in cols:
                conn.execute(text("ALTER TABLE tests ADD COLUMN is_active BOOLEAN DEFAULT 1"))
            if "participants_count" not in cols:
                conn.execute(text("ALTER TABLE tests ADD COLUMN participants_count INTEGER DEFAULT 0"))

        if "test_results" in tables:
            cols = _column_names(engine, "test_results")
            if "student_id" not in cols and "user_id" in cols:
                conn.execute(text("ALTER TABLE test_results ADD COLUMN student_id INTEGER"))
                conn.execute(text("UPDATE test_results SET student_id = user_id WHERE student_id IS NULL"))
            if "submitted_answers" not in cols and "answers" in cols:
                json_type = "JSON" if dialect == "postgresql" else "TEXT"
                conn.execute(text(f"ALTER TABLE test_results ADD COLUMN submitted_answers {json_type}"))
                conn.execute(text("UPDATE test_results SET submitted_answers = answers WHERE submitted_answers IS NULL"))
            if "time_taken" not in cols:
                conn.execute(text("ALTER TABLE test_results ADD COLUMN time_taken INTEGER"))
            if "max_score" not in cols:
                conn.execute(text("ALTER TABLE test_results ADD COLUMN max_score FLOAT"))

        if "questions" in tables:
            cols = _column_names(engine, "questions")
            if "user_id" not in cols and "asked_by_user_id" in cols:
                conn.execute(text("ALTER TABLE questions ADD COLUMN user_id INTEGER"))
                conn.execute(text("UPDATE questions SET user_id = asked_by_user_id WHERE user_id IS NULL"))
            if "ai_answer" not in cols:
                conn.execute(text("ALTER TABLE questions ADD COLUMN ai_answer TEXT"))
