import os
import sys
from dotenv import load_dotenv
from google import genai

# Load env
load_dotenv()

def test_api():
    api_key = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    
    print(f"--- Testing API Key: {api_key[:10]}...{api_key[-4:]} ---")
    print(f"--- Model: {model_name} ---")
    
    if not api_key:
        print("ERROR: GEMINI_API_KEY not found in .env")
        return

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=model_name,
            contents="Respond in Vietnamese: 1+1 equals what?"
        )
        print("\n--- AI RESPONSE ---")
        print(response.text)
        print("\n=> API IS WORKING PERFECTLY!")
    except Exception as e:
        print("\n--- ERROR DETECTED ---")
        print(f"Details: {str(e)}")
        print("\n=> API HAS ISSUES. Please check if the key is enabled or restricted.")

if __name__ == "__main__":
    test_api()
