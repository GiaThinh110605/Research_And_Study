import json
import logging
from typing import List, Dict, Optional

import google.generativeai as genai

from app.core.config import settings

logger = logging.getLogger(__name__)


def _get_model() -> Optional[genai.GenerativeModel]:
    api_key = settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY
    if not api_key:
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(settings.GEMINI_MODEL)


def _strip_fenced_block(content: str) -> str:
    cleaned = content.strip()
    if cleaned.startswith("```json"):
        return cleaned[7:-3].strip()
    if cleaned.startswith("```"):
        return cleaned[3:-3].strip()
    return cleaned

def generate_flashcards_from_text(text: str, count: int = 5) -> List[Dict[str, str]]:
    model = _get_model()
    if not model:
        return [
            {"front": f"Sample Question {i+1}", "back": f"Sample Answer {i+1}"}
            for i in range(count)
        ]

    prompt = f"""
    Create {count} flashcards from the following text.
    Each flashcard should have a 'front' (question/term) and a 'back' (answer/definition).
    Return the response as a valid JSON list of objects.
    
    Text:
    {text}
    
    JSON Format:
    [
        {{"front": "...", "back": "..."}},
        ...
    ]
    """
    
    response = model.generate_content(prompt)
    try:
        # Try to parse JSON from response text
        content = _strip_fenced_block(response.text)
        return json.loads(content)
    except Exception as e:
        logger.warning("Error parsing Gemini response: %s", e)
        # Fallback
        return [{"front": "Error generating flashcard", "back": "Please try again."}]


def generate_summary_from_text(text: str, max_points: int = 5) -> Optional[str]:
    model = _get_model()
    if not model:
        return None

    trimmed_text = text.strip()
    if not trimmed_text:
        return None

    context = trimmed_text[:12000]
    prompt = f"""
    Ban la tro ly hoc thuat. Hay tom tat noi dung tai lieu duoi dang bullet point.
    Yeu cau:
    - Viet bang tieng Viet, giong van hoc thuat.
    - Toi da {max_points} y.
    - Moi y la mot dong bat dau bang ky tu '•'.
    - Tap trung vao muc tieu, phuong phap, ket qua, va ket luan neu co.

    Noi dung:
    {context}
    """

    try:
        response = model.generate_content(prompt)
        content = _strip_fenced_block(response.text)
        return content.strip() if content.strip() else None
    except Exception as exc:
        logger.warning("Gemini summary failed: %s", exc)
        return None


def generate_quiz_from_text(
    text: str,
    max_questions: int = 6,
    concept_labels: Optional[List[str]] = None,
) -> Optional[List[Dict]]:
    """Generate diverse MCQ quiz questions using Gemini AI.

    Returns a list of question dicts compatible with the Test.questions JSON
    column, or ``None`` when the model is unavailable.
    """
    model = _get_model()
    if not model:
        return None

    trimmed = text.strip()
    if not trimmed:
        return None

    context = trimmed[:12000]
    concept_hint = ""
    if concept_labels:
        concept_hint = (
            "Cac khai niem trong tai lieu: "
            + ", ".join(concept_labels[:15])
            + ".\n"
        )

    prompt = f"""Ban la giang vien dai hoc. Hay tao {max_questions} cau hoi trac nghiem (MCQ) tu noi dung tai lieu.
Yeu cau:
- Viet bang tieng Viet, giong van hoc thuat.
- Moi cau hoi co dung 4 lua chon (A-D).
- Da dang kieu cau hoi: dinh nghia, so sanh, ung dung, phan tich.
- Chi co duy nhat 1 dap an dung.
- Kem theo giai thich ngan gon cho dap an dung.
{concept_hint}
Tra ve ket qua la JSON array, moi phan tu co dang:
{{
  "id": <so thu tu bat dau tu 1>,
  "text": "<noi dung cau hoi>",
  "options": ["<lua chon A>", "<lua chon B>", "<lua chon C>", "<lua chon D>"],
  "correct_answer": <chi so lua chon dung, 0-3>,
  "explanation": "<giai thich ngan>"
}}

Noi dung tai lieu:
{context}
"""

    try:
        response = model.generate_content(prompt)
        content = _strip_fenced_block(response.text)
        questions = json.loads(content)
        if isinstance(questions, list) and len(questions) > 0:
            # Validate & normalise each question
            validated: List[Dict] = []
            for idx, q in enumerate(questions[:max_questions]):
                validated.append({
                    "id": idx + 1,
                    "text": str(q.get("text", "")),
                    "options": list(q.get("options", []))[:4],
                    "correct_answer": int(q.get("correct_answer", 0)) % 4,
                    "explanation": str(q.get("explanation", "")),
                })
            return validated
        return None
    except Exception as exc:
        logger.warning("Gemini quiz generation failed: %s", exc)
        return None


def extract_concepts_from_text(
    text: str, max_concepts: int = 12
) -> Optional[List[Dict[str, object]]]:
    """Extract key concepts from text using Gemini AI.

    Returns a list of concept dicts with ``label``, ``category``
    (basic / advanced / applied) and ``score`` (0-1), or ``None``
    when the model is unavailable.
    """
    model = _get_model()
    if not model:
        return None

    trimmed = text.strip()
    if not trimmed:
        return None

    context = trimmed[:12000]
    prompt = f"""Ban la tro ly hoc thuat. Hay trich xuat toi da {max_concepts} khai niem quan trong tu tai lieu.
Yeu cau:
- Viet bang tieng Viet.
- Phan loai moi khai niem: "basic" (co ban), "advanced" (nang cao), "applied" (ung dung).
- Cho diem muc do quan trong (score) tu 0.0 den 1.0.
- Uu tien khai niem chuyen nganh, thuat ngu hoc thuat.

Tra ve ket qua la JSON array:
[
  {{"label": "<ten khai niem>", "category": "<basic|advanced|applied>", "score": <0.0-1.0>}},
  ...
]

Noi dung tai lieu:
{context}
"""

    try:
        response = model.generate_content(prompt)
        content = _strip_fenced_block(response.text)
        concepts = json.loads(content)
        if isinstance(concepts, list) and len(concepts) > 0:
            validated: List[Dict[str, object]] = []
            for item in concepts[:max_concepts]:
                label = str(item.get("label", "")).strip()
                if not label:
                    continue
                category = str(item.get("category", "basic"))
                if category not in ("basic", "advanced", "applied"):
                    category = "basic"
                score = float(item.get("score", 0.5))
                score = max(0.0, min(1.0, score))
                validated.append({
                    "label": label,
                    "category": category,
                    "score": score,
                })
            return validated if validated else None
        return None
    except Exception as exc:
        logger.warning("Gemini concept extraction failed: %s", exc)
        return None


def query_ai_with_context(
    question: str,
    context: str,
    document_title: str = ""
) -> Optional[str]:
    """
    Query AI with specific context (e.g., from highlight/document).
    Used for Q&A feature in learning interface.
    
    Args:
        question: Câu hỏi của người dùng
        context: Ngữ cảnh (đoạn text bôi đen hoặc mô tả tài liệu)
        document_title: Tiêu đề tài liệu (optional)
    
    Returns:
        Câu trả lời từ AI hoặc None nếu lỗi
    """
    model = _get_model()
    if not model:
        return None
    
    if not question or not question.strip():
        return None
    
    context_text = context.strip() if context else "Không có ngữ cảnh"
    if len(context_text) > 8000:
        context_text = context_text[:8000] + "..."
    
    document_hint = f" (Tài liệu: {document_title})" if document_title else ""
    
    prompt = f"""Bạn là trợ lý học thuật giúp sinh viên hiểu rõ nội dung tài liệu{document_hint}.
Trả lời câu hỏi dựa trên ngữ cảnh được cung cấp.

Yêu cầu:
- Trả lời bằng tiếng Việt, giọng học thuật, chuyên nghiệp
- Giải thích chi tiết, dễ hiểu
- Tham chiếu đến ngữ cảnh được cung cấp khi có liên quan
- Nếu không tìm thấy câu trả lời trong ngữ cảnh, hãy nói rõ điều đó
- Độ dài: 3-10 câu tùy mức độ phức tạp

Ngữ cảnh từ tài liệu:
{context_text}

Câu hỏi: {question}

Câu trả lời:"""
    
    try:
        response = model.generate_content(prompt)
        answer = response.text.strip() if response and response.text else None
        return answer if answer else None
    except Exception as exc:
        logger.error(f"Gemini Q&A failed: {exc}", exc_info=True)
        return None
