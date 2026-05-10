"""Create the 'questions' table for UC10."""
from app.models.base import engine, Base
from app.models.question import Question  # noqa: F401 – import so Base sees it

def main():
    # Only create missing tables (safe to run multiple times)
    Base.metadata.create_all(bind=engine, tables=[Question.__table__])
    print("[OK] Table 'questions' created successfully (or already exists).")

if __name__ == "__main__":
    main()
