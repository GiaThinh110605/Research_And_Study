from app.models.base import Base, engine
from app.models.user import User
from app.models.document import Document
from app.models.test import Test, TestQuestion
from app.models.test_result import TestResult
from app.models.flashcard import Flashcard, FlashcardSet
from app.models.discussion import Discussion

print("Creating all tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")
