import logging
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.models.base import get_db
from app.models.document import Document
from app.models.summary import Summary
from app.models.mindmap import Mindmap
from app.models.flashcard import Flashcard, FlashcardSet
from app.schemas.ai import AIRequest, SummaryOut, MindmapOut, FlashcardGenerateRequest, FlashcardOut, AIAskRequest, AIAskResponse
from app.core.file_utils import extract_text_from_file

# Gemini AI functions
from app.core.gemini import (
    generate_mindmap_from_text as gemini_mindmap,
    ask_question_about_text as gemini_ask,
    generate_flashcards_from_text as gemini_flashcards,
    generate_summary_from_text as gemini_summary,
)

# Grok AI functions (fallback)
from app.core.grok import (
    generate_mindmap_from_text as grok_mindmap,
    ask_question_about_text as grok_ask,
    generate_summary_from_text as grok_summary,
)

# Local fallback (ingestion)
from app.core.ingestion import generate_summary as local_summary

logger = logging.getLogger(__name__)

router = APIRouter()


def _get_document_text(document: Document) -> str:
    """Extract text from document file with fallback to description."""
    raw_text = extract_text_from_file(document.file_path) or document.description or ""
    if not raw_text:
        logger.warning("No text could be extracted from document %d", document.id)
    return raw_text


# ─── UC08: Summary ────────────────────────────────────────────────────

@router.post("/summary/{document_id}", response_model=SummaryOut)
def create_document_summary(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> Any:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    raw_text = _get_document_text(document)

    # Fallback chain: Gemini → Grok → Local TF-based
    summary_content = None

    summary_content = gemini_summary(raw_text)
    if summary_content:
        logger.info("Summary generated via Gemini for doc %d", document_id)
    else:
        summary_content = grok_summary(raw_text)
        if summary_content:
            logger.info("Summary generated via Grok for doc %d", document_id)
        else:
            summary_content = local_summary(raw_text)
            logger.info("Summary generated via local fallback for doc %d", document_id)

    existing_summary = db.query(Summary).filter(Summary.document_id == document_id).first()
    if existing_summary:
        existing_summary.content = summary_content
        db.commit()
        db.refresh(existing_summary)
        return existing_summary

    summary = Summary(
        document_id=document_id,
        content=summary_content
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)
    return summary


# ─── UC09: Mindmap ────────────────────────────────────────────────────

@router.post("/mindmap/{document_id}", response_model=MindmapOut)
def generate_mindmap(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> Any:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    raw_text = _get_document_text(document)

    # Fallback chain: Gemini → Grok → simple fallback
    mindmap_data = gemini_mindmap(raw_text)
    if mindmap_data:
        logger.info("Mindmap generated via Gemini for doc %d", document_id)
    else:
        mindmap_data = grok_mindmap(raw_text)
        if mindmap_data:
            logger.info("Mindmap generated via Grok for doc %d", document_id)
        else:
            logger.warning("Mindmap generation failed for doc %d, using fallback", document_id)
            mindmap_data = {
                "root": {
                    "text": document.title,
                    "children": [{"text": "Không thể tạo sơ đồ chi tiết. Vui lòng thử lại."}]
                }
            }

    existing_mindmap = db.query(Mindmap).filter(Mindmap.document_id == document_id).first()
    if existing_mindmap:
        existing_mindmap.content = mindmap_data
        db.commit()
        db.refresh(existing_mindmap)
        return existing_mindmap

    mindmap = Mindmap(
        document_id=document_id,
        content=mindmap_data
    )
    db.add(mindmap)
    db.commit()
    db.refresh(mindmap)
    return mindmap


# ─── AI Ask (used in discussion sidebar) ──────────────────────────────

@router.post("/ask/{document_id}", response_model=AIAskResponse)
def ask_ai(
    document_id: int,
    request: AIAskRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> Any:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    raw_text = _get_document_text(document)

    # Fallback chain: Gemini → Grok
    answer = gemini_ask(raw_text, request.question)
    if answer:
        logger.info("AI Q&A answered by Gemini for doc %d", document_id)
    else:
        answer = grok_ask(raw_text, request.question)
        if answer:
            logger.info("AI Q&A answered by Grok for doc %d", document_id)

    if not answer:
        raise HTTPException(status_code=500, detail="Không thể tạo câu trả lời. Vui lòng thử lại sau.")

    return {"answer": answer}


# ─── Flashcard Generation ─────────────────────────────────────────────

@router.post("/flashcards/generate/{document_id}")
def generate_flashcards(
    document_id: int,
    payload: FlashcardGenerateRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> Any:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    raw_text = _get_document_text(document)
    num_cards = payload.count or 5
    flashcards_data = gemini_flashcards(raw_text, count=num_cards)

    if not flashcards_data:
        raise HTTPException(status_code=500, detail="Could not generate flashcards via AI")

    # Save to a new set or existing AI set
    set_title = f"AI Generated: {document.title}"
    fset = db.query(FlashcardSet).filter(
        FlashcardSet.document_id == document_id,
        FlashcardSet.owner_id == current_user.id,
        FlashcardSet.is_ai_generated == True
    ).first()

    if not fset:
        fset = FlashcardSet(
            title=set_title,
            subject=document.subject,
            owner_id=current_user.id,
            document_id=document_id,
            is_ai_generated=True
        )
        db.add(fset)
        db.commit()
        db.refresh(fset)

    new_cards = []
    for item in flashcards_data:
        card = Flashcard(
            set_id=fset.id,
            front=item.get("front", ""),
            back=item.get("back", ""),
            status="new"
        )
        db.add(card)
        new_cards.append(card)

    db.commit()

    return {
        "message": f"Successfully generated {len(new_cards)} flashcards",
        "set_id": fset.id,
        "flashcards": [{"id": c.id, "front": c.front, "back": c.back} for c in new_cards]
    }
