import unittest
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from app.api.v1.routes import ai as ai_routes
from app.models.flashcard import Flashcard, FlashcardSet
from app.models.mindmap import Mindmap
from app.models.summary import Summary


class _FakeQuery:
    def __init__(self, db, model):
        self.db = db
        self.model = model

    def filter(self, *_args, **_kwargs):
        return self

    def first(self):
        queue = self.db.first_results.get(self.model, [])
        return queue.pop(0) if queue else None


class _FakeDB:
    def __init__(self, first_results):
        self.first_results = first_results
        self.added = []
        self.commits = 0
        self._next_id = 1000

    def query(self, model):
        return _FakeQuery(self, model)

    def add(self, obj):
        if getattr(obj, "id", None) is None:
            obj.id = self._next_id
            self._next_id += 1
        self.added.append(obj)

    def commit(self):
        self.commits += 1

    def refresh(self, _obj):
        return None


class TestAIStudyLoopRoutes(unittest.TestCase):
    def test_create_document_summary_falls_back_to_local(self):
        doc = SimpleNamespace(
            id=1, title="KTLT", description="Noi dung can tom tat", file_path="/tmp/missing.pdf"
        )
        db = _FakeDB({ai_routes.Document: [doc], ai_routes.Summary: [None]})

        with (
            patch.object(ai_routes, "extract_text_from_file", return_value=""),
            patch.object(ai_routes, "gemini_summary", return_value=None),
            patch.object(ai_routes, "grok_summary", return_value=None),
            patch.object(ai_routes, "local_summary", return_value="• Local summary"),
        ):
            result = ai_routes.create_document_summary(
                document_id=1, db=db, current_user=SimpleNamespace(id=10)
            )

        self.assertIsInstance(result, Summary)
        self.assertEqual(result.content, "• Local summary")
        self.assertEqual(db.commits, 1)

    def test_generate_mindmap_uses_default_fallback_when_ai_unavailable(self):
        doc = SimpleNamespace(
            id=1, title="Discrete Math", description="Tai lieu", file_path="/tmp/missing.pdf"
        )
        db = _FakeDB({ai_routes.Document: [doc], ai_routes.Mindmap: [None]})

        with (
            patch.object(ai_routes, "extract_text_from_file", return_value=""),
            patch.object(ai_routes, "gemini_mindmap", return_value=None),
            patch.object(ai_routes, "grok_mindmap", return_value=None),
        ):
            result = ai_routes.generate_mindmap(
                document_id=1, db=db, current_user=SimpleNamespace(id=11)
            )

        self.assertIsInstance(result, Mindmap)
        self.assertEqual(result.content["root"]["text"], "Discrete Math")
        self.assertTrue(result.content["root"]["children"])

    def test_ask_ai_raises_500_when_all_providers_fail(self):
        doc = SimpleNamespace(id=1, title="OS", description="Tai lieu", file_path="/tmp/missing.pdf")
        db = _FakeDB({ai_routes.Document: [doc]})

        with (
            patch.object(ai_routes, "extract_text_from_file", return_value="tai lieu"),
            patch.object(ai_routes, "gemini_ask", return_value=None),
            patch.object(ai_routes, "grok_ask", return_value=None),
        ):
            with self.assertRaises(HTTPException) as exc:
                ai_routes.ask_ai(
                    document_id=1,
                    request=ai_routes.AIAskRequest(question="Noi dung chinh la gi?"),
                    db=db,
                    current_user=SimpleNamespace(id=12),
                )

        self.assertEqual(exc.exception.status_code, 500)

    def test_generate_flashcards_reuses_existing_ai_set(self):
        doc = SimpleNamespace(
            id=1,
            title="Data Structure",
            subject="CNTT",
            description="Tai lieu",
            file_path="/tmp/missing.pdf",
        )
        existing_set = SimpleNamespace(id=77)
        db = _FakeDB({ai_routes.Document: [doc], ai_routes.FlashcardSet: [existing_set]})

        with (
            patch.object(ai_routes, "extract_text_from_file", return_value="raw text"),
            patch.object(
                ai_routes,
                "gemini_flashcards",
                return_value=[
                    {"front": "Stack", "back": "LIFO"},
                    {"front": "Queue", "back": "FIFO"},
                ],
            ),
        ):
            result = ai_routes.generate_flashcards(
                document_id=1,
                payload=ai_routes.FlashcardGenerateRequest(count=2),
                db=db,
                current_user=SimpleNamespace(id=13),
            )

        self.assertEqual(result["set_id"], 77)
        self.assertEqual(len(result["flashcards"]), 2)
        self.assertFalse(any(isinstance(item, FlashcardSet) for item in db.added))
        self.assertEqual(sum(isinstance(item, Flashcard) for item in db.added), 2)
