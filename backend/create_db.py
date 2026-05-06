from app.models.base import Base, engine
from app.models.user import User
from app.models.document import Document
from app.models.question import Question
from app.models.highlight import Highlight
from app.models.flashcard import Flashcard
from app.models.discussion import Discussion
from app.models.mindmap import Mindmap
from app.models.summary import Summary
from app.models.test import Test, TestQuestion
from app.models.test_result import TestResult

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")
