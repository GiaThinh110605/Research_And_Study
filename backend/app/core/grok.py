import json
import logging
from typing import List, Dict, Optional

from openai import OpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)

def _get_client() -> Optional[OpenAI]:
    if not settings.GROK_API_KEY:
        return None
    return OpenAI(
        api_key=settings.GROK_API_KEY,
        base_url=settings.GROK_BASE_URL,
    )

def _strip_fenced_block(content: str) -> str:
    cleaned = content.strip()
    if cleaned.startswith("```json"):
        return cleaned[7:-3].strip()
    if cleaned.startswith("```"):
        return cleaned[3:-3].strip()
    return cleaned

def generate_summary_from_text(text: str, max_points: int = 5) -> Optional[str]:
    client = _get_client()
    if not client:
        return None

    context = text.strip()[:15000]
    prompt = f"""
    Bạn là trợ lý học thuật Grok. Hãy tóm tắt nội dung tài liệu dưới dạng bullet point.
    Yêu cầu:
    - Viết bằng tiếng Việt, giọng văn học thuật.
    - Tối đa {max_points} ý.
    - Mỗi ý là một dòng bắt đầu bằng ký tự '•'.
    
    Nội dung tài liệu:
    {context}
    """

    try:
        response = client.chat.completions.create(
            model=settings.GROK_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:
        logger.warning("Grok summary failed: %s", exc)
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
        concept_hint = "Các khái niệm quan trọng: " + ", ".join(concept_labels[:15])

    prompt = f"""Bạn là giảng viên đại học. Hãy tạo {max_questions} câu hỏi trắc nghiệm (MCQ) từ nội dung tài liệu.
Yêu cầu:
- Viết bằng tiếng Việt.
- Mỗi câu hỏi có đúng 4 lựa chọn (A-D).
- Chỉ có duy nhất 1 đáp án đúng.
- Kèm theo giải thích ngắn gọn.
{concept_hint}

Trả về kết quả là JSON array:
[
  {{
    "id": 1,
    "text": "...",
    "options": ["A", "B", "C", "D"],
    "correct_answer": 0,
    "explanation": "..."
  }}
]

Nội dung tài liệu:
{context}
"""

    try:
        response = client.chat.completions.create(
            model=settings.GROK_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"} if "reasoning" not in settings.GROK_MODEL else None,
        )
        content = _strip_fenced_block(response.choices[0].message.content)
        data = json.loads(content)
        # Handle cases where the response might be wrapped in a key
        if isinstance(data, dict) and "questions" in data:
            return data["questions"]
        return data if isinstance(data, list) else None
    except Exception as exc:
        logger.warning("Grok quiz failed: %s", exc)
        return None

def extract_concepts_from_text(text: str, max_concepts: int = 12) -> Optional[List[Dict]]:
    client = _get_client()
    if not client:
        return None

    context = text.strip()[:15000]
    prompt = f"""Trích xuất tối đa {max_concepts} khái niệm chính từ tài liệu sau.
Trả về JSON array các object có: label (tên khái niệm), category (basic|advanced|applied), score (0.0-1.0).
Viết bằng tiếng Việt.

Nội dung:
{context}
"""

    try:
        response = client.chat.completions.create(
            model=settings.GROK_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        content = _strip_fenced_block(response.choices[0].message.content)
        return json.loads(content)
    except Exception as exc:
        logger.warning("Grok concepts failed: %s", exc)
        return None

def generate_mindmap_from_text(text: str) -> Optional[Dict]:
    client = _get_client()
    if not client:
        return None

    context = text.strip()[:15000]
    prompt = f"""Tạo sơ đồ tư duy (mindmap) dạng JSON từ nội dung sau.
Cấu trúc: {{"root": {{"text": "...", "children": [ {{"text": "...", "children": [...]}} ]}} }}
Viết bằng tiếng Việt.

Nội dung:
{context}
"""

    try:
        response = client.chat.completions.create(
            model=settings.GROK_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        content = _strip_fenced_block(response.choices[0].message.content)
        return json.loads(content)
    except Exception as exc:
        logger.warning("Grok mindmap failed: %s", exc)
        return None

def ask_question_about_text(text: str, question: str) -> Optional[str]:
    client = _get_client()
    if not client:
        return None

    context = text.strip()[:20000]
    prompt = f"""Dựa trên tài liệu sau, hãy trả lời câu hỏi của người dùng bằng tiếng Việt.
Tài liệu: {context}
Câu hỏi: {question}
"""

    try:
        response = client.chat.completions.create(
            model=settings.GROK_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:
        logger.warning("Grok chat failed: %s", exc)
        return None
