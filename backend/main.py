import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1.api import api_router
from app.core.config import settings
from app.middleware.auth import AuthMiddleware
from app.models.base import engine, Base, SessionLocal
import app.models  # Import all models to ensure they are registered with Base
from app.models.user import User, UserRole
from app.core.security import get_password_hash


# Initialize default admin user if not exists
def init_default_user():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "admin").first()
        if not user:
            admin = User(
                username="admin",
                email="admin@example.com",
                password_hash=get_password_hash("admin123"),
                full_name="Admin User",
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("✓ Default admin user created (username: admin, password: admin123)")
        else:
            print("✓ Admin user already exists")
    except Exception as e:
        print(f"✗ Error initializing default user: {e}")
    finally:
        db.close()


app = FastAPI(
    title="AI Research Paper Navigator API",
    description="Backend API for AI-powered document interaction platform",
    version="1.0.0"
)

# Create all tables on startup
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    init_default_user()

app.add_middleware(AuthMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.ALLOWED_ORIGINS] if "*" not in settings.ALLOWED_ORIGINS else [],
    allow_origin_regex="https?://.*" if "*" in settings.ALLOWED_ORIGINS else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "AI Research Paper Navigator API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
