import pytest

from app.core import ingestion
from app.core.config import settings


def test_chunk_text_produces_chunks():
    text = " ".join(["alpha beta gamma"] * 200)
    chunks = ingestion.chunk_text(text, max_len=120, overlap=20)

    assert chunks
    assert all(len(item[2]) <= 120 for item in chunks)


def test_extract_concepts_includes_bigrams():
    text = (
        "Machine learning is powerful. "
        "Machine learning enables practical systems. "
        "Machine learning improves over time."
    )
    concepts = ingestion.extract_concepts(text, max_concepts=6)
    labels = [item["label"] for item in concepts]

    assert any("Machine Learning" == label for label in labels)


def test_generate_summary_fallback_textrank(monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", None)
    monkeypatch.setattr(settings, "GOOGLE_API_KEY", None)

    text = (
        "Muc tieu la danh gia mo hinh. "
        "Phuong phap su dung tap du lieu lon. "
        "Ket qua cho thay hieu qua on dinh. "
        "Ket luan de xuat huong nghien cuu tiep theo."
    )
    summary = ingestion.generate_summary(text, max_points=3)

    assert summary.count("•") >= 2
    assert "Muc tieu" in summary or "Phuong phap" in summary


def test_generate_quiz_question_count():
    concepts = [
        {"label": "Alpha", "score": 1.0, "category": "basic"},
        {"label": "Beta", "score": 0.8, "category": "advanced"},
        {"label": "Gamma", "score": 0.7, "category": "applied"},
    ]
    quiz = ingestion.generate_quiz(concepts, "sample", max_questions=2)

    assert len(quiz) == 2
    assert quiz[0]["options"]
