from app.models.base import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

def seed():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == 1).first()
        if not user:
            print("Creating default user with ID 1...")
            admin = User(
                id=1, 
                username='admin', 
                email='admin@example.com', 
                password_hash=get_password_hash('admin123'), 
                full_name='Admin User', 
                role=UserRole.ADMIN, 
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("User 1 created successfully!")
        else:
            print("User 1 already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
