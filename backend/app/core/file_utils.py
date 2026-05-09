import os
from pypdf import PdfReader
import docx
from typing import Optional

def extract_text_from_file(file_path: str) -> Optional[str]:
    # Adjust file path to local path if it's a URL-like path
    if file_path.startswith("/uploads/"):
        file_path = os.path.join("uploads", file_path.replace("/uploads/", "", 1))
    
    if not os.path.exists(file_path):
        return None
        
    ext = os.path.splitext(file_path)[1].lower()
    
    try:
        if ext == '.pdf':
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip() if text.strip() else None
            
        elif ext == '.docx':
            doc = docx.Document(file_path)
            text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
            return text if text.strip() else None
            
        elif ext == '.txt':
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                return content.strip() if content.strip() else None
        else:
            return None
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        return None
