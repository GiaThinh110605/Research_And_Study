from app.models.base import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash


def create_users():
    db = SessionLocal()
    try:
        accounts = [
            {"username": "admin", "email": "admin@example.com", "password": "admin123", "full_name": "Admin User", "role": UserRole.ADMIN},
            {"username": "student1", "email": "student1@example.com", "password": "student123", "full_name": "Student One", "role": UserRole.STUDENT, "student_code": "S001"},
            {"username": "lecturer1", "email": "lecturer1@example.com", "password": "lecturer123", "full_name": "Lecturer One", "role": UserRole.LECTURER, "lecturer_code": "L001"},
        ]

        for acc in accounts:
            existing = db.query(User).filter(User.username == acc["username"]).first()
            if existing:
                print(f"User {acc['username']} already exists, skipping")
                continue

            user = User(
                username=acc["username"],
                email=acc["email"],
                password_hash=get_password_hash(acc["password"]),
                full_name=acc["full_name"],
                role=acc["role"],
                student_code=acc.get("student_code"),
                lecturer_code=acc.get("lecturer_code"),
                is_active=True,
            )
            db.add(user)

        db.commit()
        print("Test accounts created/ensured.")
    finally:
        db.close()


if __name__ == "__main__":
    create_users()
