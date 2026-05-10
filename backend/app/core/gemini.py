import json
import logging
from typing import List, Dict, Optional

from google import genai
from app.core.config import settings

logger = logging.getLogger(__name__)

def _get_client() -> Optional[genai.Client]:
    api_key = settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY
    if not api_key:
        return None
    return genai.Client(api_key=api_key)

def _strip_fenced_block(content: str) -> str:
    cleaned = content.strip()
    if cleaned.startswith("```json"):
        return cleaned[7:-3].strip()
    if cleaned.startswith("```"):
        return cleaned[3:-3].strip()
    return cleaned

def generate_flashcards_from_text(text: str, count: int = 5) -> List[Dict[str, str]]:
    client = _get_client()
    if not client:
        return [{"front": "Error", "back": "No API Key"}]

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
    
    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt
        )
        content = _strip_fenced_block(response.text)
        return json.loads(content)
    except Exception as e:
        logger.warning("Error generating flashcards: %s", e)
        return [{"front": "Error generating flashcard", "back": "Please try again."}]

def generate_summary_from_text(text: str, max_points: int = 5) -> Optional[str]:
    client = _get_client()
    if not client:
        return None

    context = text.strip()[:15000]
    prompt = f"""
    Bạn là trợ lý học thuật. Hãy tóm tắt nội dung tài liệu dưới dạng bullet point.
    Yêu cầu:
    - Viết bằng tiếng Việt, giọng văn học thuật.
    - Tối đa {max_points} ý.
    - Mỗi ý là một dòng bắt đầu bằng ký tự '•'.

    Nội dung:
    {context}
    """

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt
        )
        return response.text.strip()
    except Exception as exc:
        logger.warning("Gemini summary failed: %s", exc)
        return None

def generate_quiz_from_text(
    text: str,
    max_questions: int = 6,
    concept_labels: Optional[List[str]] = None,
) -> Optional[List[Dict]]:
    client = _get_client()
    if not client:
        return None

    context = text.strip()[:15000]
    concept_hint = ""
    if concept_labels:
        concept_hint = f"Các khái niệm quan trọng: {', '.join(concept_labels[:15])}\n"

    prompt = f"""Bạn là giảng viên đại học. Hãy tạo {max_questions} câu hỏi trắc nghiệm (MCQ) từ nội dung tài liệu.
Yêu cầu:
- Viết bằng tiếng Việt.
- Mỗi câu hỏi có đúng 4 lựa chọn (A-D).
- Chi duy nhất 1 đáp án đúng.
{concept_hint}
Trả về kết quả là JSON array:
[
  {{
    "id": 1,
    "text": "...",
    "options": ["...", "...", "...", "..."],
    "correct_answer": 0,
    "explanation": "..."
  }}
]

Nội dung tài liệu:
{context}
"""

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config={'response_mime_type': 'application/json'}
        )
        content = _strip_fenced_block(response.text)
        questions = json.loads(content)
        if isinstance(questions, list):
            return questions
        if isinstance(questions, dict) and "questions" in questions:
            return questions["questions"]
        return None
    except Exception as exc:
        logger.warning("Gemini quiz failed: %s", exc)
        return None

def extract_concepts_from_text(text: str, max_concepts: int = 12) -> Optional[List[Dict]]:
    client = _get_client()
    if not client:
        return None

    context = text.strip()[:15000]
    prompt = f"""Bạn là trợ lý học thuật. Hãy trích xuất tối đa {max_concepts} khái niệm quan trọng bằng tiếng Việt.
Trả về JSON array các object: label (tên), category (basic|advanced|applied), score (0.0-1.0).

Nội dung:
{context}
"""

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config={'response_mime_type': 'application/json'}
        )
        content = _strip_fenced_block(response.text)
        return json.loads(content)
    except Exception as exc:
        logger.warning("Gemini concepts failed: %s", exc)
        return None

def generate_mindmap_from_text(text: str) -> Optional[Dict]:
    client = _get_client()
    if not client:
        return None

    context = text.strip()[:15000]
    prompt = f"""Bạn là trợ lý học thuật. Hãy tạo sơ đồ tư duy (mindmap) bằng tiếng Việt dạng JSON.
Cấu trúc: {{"root": {{"text": "...", "children": [...]}}}}

Nội dung:
{context}
"""

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config={'response_mime_type': 'application/json'}
        )
        content = _strip_fenced_block(response.text)
        return json.loads(content)
    except Exception as exc:
        logger.warning("Gemini mindmap failed: %s", exc)
        return None

def ask_question_about_text(text: str, question: str) -> Optional[str]:
    client = _get_client()
    if not client:
        return None

    context = text.strip()[:20000]
    prompt = f"""Dựa trên tài liệu sau, hãy trả lời câu hỏi bằng tiếng Việt.
Tài liệu: {context}
Câu hỏi: {question}
"""

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt
        )
        return response.text.strip()
    except Exception as exc:
        logger.warning("Gemini Q&A failed: %s", exc)
        return None
