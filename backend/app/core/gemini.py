import google.generativeai as genai
from app.core.config import settings
import json
from typing import List, Dict

def generate_flashcards_from_text(text: str, count: int = 5) -> List[Dict[str, str]]:
    if not settings.GOOGLE_API_KEY:
        return [
            {"front": f"Sample Question {i+1}", "back": f"Sample Answer {i+1}"}
            for i in range(count)
        ]

    genai.configure(api_key=settings.GOOGLE_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
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
        content = response.text.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        return json.loads(content)
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        # Fallback
        return [{"front": "Error generating flashcard", "back": "Please try again."}]
