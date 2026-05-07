import logging
import re
from datetime import datetime
from typing import List, Dict, Tuple

from app.models.base import SessionLocal
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.document_concept import DocumentConcept
from app.models.document_ingestion import DocumentIngestion
from app.models.summary import Summary
from app.models.test import Test
from app.core.file_utils import extract_text_from_file
from app.core.gemini import (
    generate_summary_from_text,
    generate_quiz_from_text,
    extract_concepts_from_text,
)

logger = logging.getLogger(__name__)

CHUNK_SIZE = 800
CHUNK_OVERLAP = 120
MAX_CONCEPTS = 12
MAX_SUMMARY_POINTS = 5
MAX_QUIZ_QUESTIONS = 6

VN_STOPWORDS = {
    "va", "la", "cua", "cho", "tai", "voi", "nhung", "mot", "nhieu",
    "cac", "nhung", "nhu", "duoc", "trong", "khi", "khong", "noi",
    "den", "tu", "voi", "tren", "duoi", "se", "da", "dang", "nay",
    "do", "ve", "toi", "ban", "anh", "chi", "em", "hoc", "tap",
    "tai", "lieu", "chuong", "phan", "bai", "noi", "dung",
}


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _tokenize_words(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)?|[\u00C0-\u1EF9]+", text)


def chunk_text(text: str, max_len: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[Tuple[int, int, str]]:
    normalized = _normalize_text(text)
    if not normalized:
        return []

    chunks: List[Tuple[int, int, str]] = []
    start = 0
    length = len(normalized)
    while start < length:
        end = min(length, start + max_len)
        if end < length:
            last_space = normalized.rfind(" ", start, end)
            if last_space > start + int(max_len * 0.6):
                end = last_space
        chunk = normalized[start:end].strip()
        if chunk:
            chunks.append((start, end, chunk))
        if end >= length:
            break
        start = max(0, end - overlap)
    return chunks


def _extract_concepts_tf(text: str, max_concepts: int = MAX_CONCEPTS) -> List[Dict[str, float]]:
    """Fallback concept extraction using term-frequency (TF) analysis."""
    normalized = _normalize_text(text.lower())
    tokens = _tokenize_words(normalized)
    filtered = [token for token in tokens if len(token) >= 3 and token not in VN_STOPWORDS]

    unigram_freq: Dict[str, int] = {}
    for token in filtered:
        unigram_freq[token] = unigram_freq.get(token, 0) + 1

    bigram_freq: Dict[str, int] = {}
    for idx in range(len(filtered) - 1):
        left = filtered[idx]
        right = filtered[idx + 1]
        if left in VN_STOPWORDS or right in VN_STOPWORDS:
            continue
        bigram = f"{left} {right}"
        bigram_freq[bigram] = bigram_freq.get(bigram, 0) + 1

    candidates: Dict[str, float] = {}
    for label, count in unigram_freq.items():
        candidates[label] = float(count)
    for label, count in bigram_freq.items():
        if count < 2:
            continue
        candidates[label] = max(candidates.get(label, 0.0), count * 1.35)

    ranked = sorted(candidates.items(), key=lambda item: item[1], reverse=True)[: max_concepts * 2]
    if not ranked:
        return []

    top_score = ranked[0][1]
    concepts: List[Dict[str, float]] = []
    for index, (label, score_raw) in enumerate(ranked[:max_concepts]):
        score = min(1.0, score_raw / max(1.0, top_score))
        category = "basic" if index < 4 else "advanced" if index < 8 else "applied"
        concepts.append({"label": label.title(), "score": score, "category": category})
    return concepts


def extract_concepts(text: str, max_concepts: int = MAX_CONCEPTS) -> List[Dict[str, float]]:
    """Extract concepts using Gemini AI, with TF-based fallback."""
    gemini_concepts = extract_concepts_from_text(text, max_concepts=max_concepts)
    if gemini_concepts:
        logger.info("Concept extraction via Gemini succeeded (%d concepts)", len(gemini_concepts))
        return gemini_concepts
    logger.info("Gemini concept extraction unavailable, falling back to TF analysis")
    return _extract_concepts_tf(text, max_concepts=max_concepts)


def _textrank_lite_summary(text: str, max_points: int = MAX_SUMMARY_POINTS) -> str:
    normalized = _normalize_text(text)
    sentences = [s.strip() for s in re.split(r"(?<=[\.!?])\s+", normalized) if s.strip()]
    if not sentences:
        return "Không đủ dữ liệu để tóm tắt."

    tokens = _tokenize_words(normalized.lower())
    freq: Dict[str, int] = {}
    for token in tokens:
        if len(token) < 3 or token in VN_STOPWORDS:
            continue
        freq[token] = freq.get(token, 0) + 1

    sentence_scores: List[Tuple[int, float]] = []
    for idx, sentence in enumerate(sentences):
        words = _tokenize_words(sentence.lower())
        score = sum(freq.get(word, 0) for word in words)
        normalized_score = score / max(1, len(words))
        sentence_scores.append((idx, normalized_score))

    top_indices = sorted(sentence_scores, key=lambda item: item[1], reverse=True)[:max_points]
    selected_indices = sorted(idx for idx, _ in top_indices)
    bullets = [f"• {sentences[idx]}" for idx in selected_indices]
    return "\n".join(bullets) if bullets else "Không đủ dữ liệu để tóm tắt."


def generate_summary(text: str, max_points: int = MAX_SUMMARY_POINTS) -> str:
    gemini_summary = generate_summary_from_text(text, max_points=max_points)
    if gemini_summary:
        return gemini_summary
    return _textrank_lite_summary(text, max_points=max_points)


def _generate_quiz_fallback(concepts: List[Dict[str, float]], max_questions: int = MAX_QUIZ_QUESTIONS) -> List[Dict[str, object]]:
    """Fallback quiz generation using concept labels (simple MCQ)."""
    if not concepts:
        return []

    questions: List[Dict[str, object]] = []
    concept_labels = [c["label"] for c in concepts]
    for idx, label in enumerate(concept_labels[:max_questions]):
        distractors = [c for c in concept_labels if c != label]
        while len(distractors) < 3:
            distractors.append("Khái niệm liên quan")
        options = [label] + distractors[:3]
        options = options[:4]
        correct_index = 0
        questions.append({
            "id": idx + 1,
            "text": f"Khái niệm nào xuất hiện nổi bật trong tài liệu?",
            "options": options,
            "correct_answer": correct_index,
            "explanation": f"Khái niệm {label} được trích xuất từ nội dung tài liệu.",
        })
    return questions


def generate_quiz(concepts: List[Dict[str, float]], text: str, max_questions: int = MAX_QUIZ_QUESTIONS) -> List[Dict[str, object]]:
    """Generate quiz using Gemini AI, with simple fallback."""
    concept_labels = [c["label"] for c in concepts] if concepts else []
    gemini_quiz = generate_quiz_from_text(
        text, max_questions=max_questions, concept_labels=concept_labels
    )
    if gemini_quiz:
        logger.info("Quiz generation via Gemini succeeded (%d questions)", len(gemini_quiz))
        return gemini_quiz
    logger.info("Gemini quiz generation unavailable, falling back to concept-based quiz")
    return _generate_quiz_fallback(concepts, max_questions=max_questions)


def process_document_ingestion(document_id: int) -> None:
    """Run the full ingestion pipeline for a document.

    Pipeline stages: text extraction → chunking → concept extraction →
    summary generation → quiz generation.  Each stage is committed
    independently so partial results are preserved if a later stage fails.
    """
    db = SessionLocal()
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            return

        logger.info("Ingestion started", extra={"document_id": document_id})

        ingestion = db.query(DocumentIngestion).filter(DocumentIngestion.document_id == document_id).first()
        if not ingestion:
            ingestion = DocumentIngestion(document_id=document_id, status="queued")
            db.add(ingestion)
            db.commit()
            db.refresh(ingestion)

        ingestion.status = "processing"
        ingestion.progress = 0.05
        ingestion.last_event = "document_uploaded"
        ingestion.started_at = datetime.utcnow()
        ingestion.error_message = None
        db.commit()

        # ── Stage 1: Text extraction ─────────────────────────────
        raw_text = extract_text_from_file(document.file_path) or document.description or ""
        if not raw_text:
            ingestion.status = "failed"
            ingestion.error_message = "Không thể trích xuất nội dung từ tài liệu. Vui lòng kiểm tra file."
            db.commit()
            return

        # ── Stage 2: Chunking ────────────────────────────────────
        try:
            chunks = chunk_text(raw_text)
            logger.info("Chunking completed", extra={"document_id": document_id, "chunks": len(chunks)})
            db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()
            for index, (start, end, content) in enumerate(chunks):
                db.add(DocumentChunk(
                    document_id=document_id,
                    chunk_index=index,
                    content=content,
                    start_offset=start,
                    end_offset=end,
                ))
            ingestion.chunks_count = len(chunks)
            ingestion.progress = 0.3
            ingestion.last_event = "chunking_completed"
            db.commit()
        except Exception as chunk_exc:
            logger.warning("Chunking failed: %s", chunk_exc, extra={"document_id": document_id})
            ingestion.status = "failed"
            ingestion.error_message = f"Lỗi chia đoạn tài liệu: {chunk_exc}"
            db.commit()
            return

        # ── Stage 3: Concept extraction ──────────────────────────
        try:
            concepts = extract_concepts(raw_text)
            logger.info("Concept extraction completed", extra={"document_id": document_id, "concepts": len(concepts)})
            db.query(DocumentConcept).filter(DocumentConcept.document_id == document_id).delete()
            for item in concepts:
                db.add(DocumentConcept(
                    document_id=document_id,
                    label=item["label"],
                    category=item["category"],
                    score=float(item["score"]),
                ))
            ingestion.concepts_count = len(concepts)
            ingestion.progress = 0.55
            ingestion.last_event = "concepts_extracted"
            db.commit()
        except Exception as concept_exc:
            logger.warning("Concept extraction failed: %s", concept_exc, extra={"document_id": document_id})
            concepts = []
            ingestion.progress = 0.55
            ingestion.last_event = "concepts_extracted"
            db.commit()

        # ── Stage 4: Summary generation ──────────────────────────
        try:
            summary_content = generate_summary(raw_text)
            logger.info("Summary generated", extra={"document_id": document_id, "summary_length": len(summary_content)})
            summary = db.query(Summary).filter(Summary.document_id == document_id).first()
            if summary:
                summary.content = summary_content
            else:
                summary = Summary(document_id=document_id, content=summary_content)
                db.add(summary)
            db.commit()
            db.refresh(summary)
            ingestion.summary_id = summary.id
            ingestion.progress = 0.8
            ingestion.last_event = "summary_generated"
            db.commit()
        except Exception as summary_exc:
            logger.warning("Summary generation failed: %s", summary_exc, extra={"document_id": document_id})
            ingestion.progress = 0.8
            ingestion.last_event = "summary_generated"
            db.commit()

        # ── Stage 5: Quiz generation ─────────────────────────────
        try:
            quiz_questions = generate_quiz(concepts, raw_text)
            if quiz_questions:
                logger.info("Quiz generated", extra={"document_id": document_id, "questions": len(quiz_questions)})
                quiz_title = f"Quiz tự động: {document.title}"
                quiz = (
                    db.query(Test)
                    .filter(Test.document_id == document_id, Test.title == quiz_title)
                    .first()
                )
                if quiz:
                    quiz.questions = quiz_questions
                else:
                    quiz = Test(
                        title=quiz_title,
                        subject=document.subject or "",
                        created_by=document.uploader_id,
                        document_id=document_id,
                        questions=quiz_questions,
                        duration_minutes=20,
                    )
                    db.add(quiz)
                db.commit()
                db.refresh(quiz)
                ingestion.quiz_test_id = quiz.id
        except Exception as quiz_exc:
            logger.warning("Quiz generation failed: %s", quiz_exc, extra={"document_id": document_id})

        # ── Finalize ─────────────────────────────────────────────
        ingestion.status = "completed"
        ingestion.progress = 1.0
        ingestion.last_event = "quiz_generated"
        ingestion.completed_at = datetime.utcnow()
        ingestion.error_message = None
        db.commit()
        logger.info("Ingestion completed", extra={"document_id": document_id})
    except Exception as exc:
        logger.exception("Ingestion failed", extra={"document_id": document_id})
        try:
            ingestion = db.query(DocumentIngestion).filter(DocumentIngestion.document_id == document_id).first()
            if ingestion:
                ingestion.status = "failed"
                ingestion.error_message = f"Pipeline thất bại: {exc}"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()
