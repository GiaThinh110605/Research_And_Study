# UC07 - Integration Summary

## Changes Made

### 1. Backend Models ✅

#### File: `backend/app/models/highlight.py`
**Change**: Added `page_number` column
```python
page_number = Column(Integer, default=1)
```
**Reason**: Track which page/position highlight created

#### File: `backend/app/models/question.py`
**Status**: Already exists, no changes needed

---

### 2. Backend Schemas ✅

#### File: `backend/app/schemas/highlight.py`
**Changes**:
- Added `page_number: Optional[int] = 1` to HighlightBase
- Added `page_number: Optional[int] = None` to HighlightUpdate
**Reason**: Support page_number in API

#### File: `backend/app/schemas/question.py`
**Status**: Already exists, no changes needed

---

### 3. Backend APIs ✅

#### File: `backend/app/api/v1/routes/highlights.py`
**Changes**:
- Updated `update_highlight()` to handle `page_number`

#### File: `backend/app/api/v1/routes/ai.py`
**Changes**:
1. **Added imports**:
   - `from app.models.question import Question`
   - `from app.schemas.question import QuestionCreate, QuestionOut`
   - `from app.core.gemini import query_ai_with_context`
   - `import logging`

2. **Added endpoints**:
   - `POST /api/v1/ai/qa/{document_id}` - Ask AI question
   - `GET /api/v1/ai/qa/{document_id}` - Get Q&A history

**Endpoint Details**:
```python
@router.post("/qa/{document_id}", response_model=QuestionOut)
def ask_ai_question(
    document_id: int,
    question_in: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> Any:
    """Ask AI with optional highlight context"""
    # 1. Fetch document
    # 2. Use context from question_in.context or document.description
    # 3. Call query_ai_with_context()
    # 4. Save to Question model
    # 5. Return response
```

#### File: `backend/app/core/gemini.py`
**Added function**:
```python
def query_ai_with_context(
    question: str,
    context: str,
    document_title: str = ""
) -> Optional[str]:
    """
    Query AI with specific context (e.g., from highlight/document).
    Used for Q&A feature in learning interface.
    
    - Gets Gemini model
    - Builds prompt with context
    - Handles errors gracefully
    - Returns AI response or None
    """
```

**Prompt Template**:
```
Bạn là trợ lý học thuật giúp sinh viên hiểu rõ nội dung tài liệu (Tài liệu: {title}).
Trả lời câu hỏi dựa trên ngữ cảnh được cung cấp.

Yêu cầu:
- Trả lời bằng tiếng Việt, giọng học thuật, chuyên nghiệp
- Giải thích chi tiết, dễ hiểu
- Tham chiếu đến ngữ cảnh được cung cấp khi có liên quan
- Nếu không tìm thấy câu trả lời trong ngữ cảnh, hãy nói rõ điều đó
- Độ dài: 3-10 câu tùy mức độ phức tạp

Ngữ cảnh từ tài liệu:
{context}

Câu hỏi: {question}

Câu trả lời:
```

---

### 4. Database Migrations ✅

#### File: `backend/alembic/versions/add_page_number_to_highlights.py`
**New migration**:
```python
def upgrade() -> None:
    op.add_column('highlights', 
        sa.Column('page_number', sa.Integer(), 
                 nullable=False, 
                 server_default='1'))

def downgrade() -> None:
    op.drop_column('highlights', 'page_number')
```

---

### 5. Frontend Components ✅

#### File: `frontend/src/components/AIQAPanel.tsx`
**New component**:
- Props: `{ documentId, currentUserId, highlightText }`
- Features:
  - Display Q&A history
  - Input textarea for questions
  - Auto-fill from highlight
  - Loading states
  - Error handling
  - Responsive layout

**Key Methods**:
- `fetchQuestions()` - GET /api/v1/ai/qa/{id}
- `handleAskQuestion()` - POST /api/v1/ai/qa/{id}

---

### 6. Frontend Pages ✅

#### File: `frontend/src/pages/DocumentDetailPage.tsx`
**Changes**:
1. **Import AIQAPanel**:
   ```tsx
   import AIQAPanel from '../components/AIQAPanel';
   ```

2. **Improved handleHighlightSubmit()**:
   - Added error logging
   - Better error messages
   - Success feedback

3. **Replaced questions section**:
   - Old: Manual form with api.post('/api/v1/questions/')
   - New: AIQAPanel component with better UX

---

### 7. API Router Registration ✅

#### File: `backend/app/api/v1/api.py`
**Status**: Already has highlights and questions routes registered
```python
api_router.include_router(highlights.router, prefix="/highlights", tags=["highlights"])
api_router.include_router(questions.router, prefix="/questions", tags=["questions"])
```

---

## Database Schema Changes

### Highlights Table - Before
```sql
CREATE TABLE highlights (
    id INTEGER PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    text_content TEXT NOT NULL,
    color VARCHAR(50) DEFAULT 'yellow',
    note TEXT,
    created_at TIMESTAMP DEFAULT now()
);
```

### Highlights Table - After
```sql
CREATE TABLE highlights (
    id INTEGER PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    text_content TEXT NOT NULL,
    color VARCHAR(50) DEFAULT 'yellow',
    note TEXT,
    page_number INTEGER DEFAULT 1,  ← NEW COLUMN
    created_at TIMESTAMP DEFAULT now()
);
```

---

## API Endpoints Summary

### Highlights (Existing - Enhanced)
```
POST   /api/v1/highlights/
  Request: { document_id, text_content, color?, note?, page_number? }
  Response: HighlightOut (id, document_id, user_id, text_content, color, note, page_number, created_at)
  Status: 201 Created

GET    /api/v1/highlights/?document_id=1
  Response: List[HighlightOut]
  Status: 200 OK

PUT    /api/v1/highlights/{id}
  Request: { color?, note?, page_number? }
  Response: HighlightOut
  Status: 200 OK

DELETE /api/v1/highlights/{id}
  Response: {"message": "Đã xóa highlight"}
  Status: 200 OK
```

### AI Q&A (New)
```
POST   /api/v1/ai/qa/{document_id}
  Request: QuestionCreate { content, context? }
  Response: QuestionOut { id, document_id, user_id, content, answer, created_at }
  Status: 201 Created
  Error: 400 (bad request), 404 (doc not found), 500 (AI error)

GET    /api/v1/ai/qa/{document_id}
  Response: List[QuestionOut]
  Status: 200 OK
```

---

## Component Hierarchy

```
DocumentDetailPage
├── Left Sidebar
│   ├── Outline (from summary)
│   └── Highlights List
│       └── HighlightItem (clickable, with delete)
├── Center Content
│   ├── PDF Viewer (iframe)
│   └── AI Reading Mode
│       ├── Text Content (selectable)
│       └── Floating Toolbar (on text select)
│           ├── Highlight Button
│           ├── Hỏi AI Button
│           └── Flashcard Button
└── Right AI Panel
    ├── Tabs Navigation
    │   ├── Summary
    │   ├── Hỏi AI (Questions) ← AIQAPanel
    │   ├── Mindmap
    │   ├── Flashcards
    │   └── Discussion
    └── [Tab Content Component]
        └── AIQAPanel (when Hỏi AI tab active)
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER ACTIONS                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Select Text          2. Ask Question                    │
│     ↓                       ↓                                │
│  ┌──────────────┐       ┌──────────────────┐               │
│  │ Floating     │       │ AIQAPanel Input  │               │
│  │ Toolbar      │       │ (auto-fill text) │               │
│  └──────────────┘       └──────────────────┘               │
│     ↓                       ↓                                │
│  "Highlight"             "Hỏi AI"                           │
│  Button                  Button                             │
│     ↓                       ↓                                │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│              FRONTEND (React/TypeScript)                    │
├─────────────────────────────────────────────────────────────┤
│     ↓                       ↓                                │
│  POST /highlights/      POST /ai/qa/{id}                   │
│  { text, color, note }  { content, context }              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│           BACKEND (FastAPI + SQLAlchemy)                    │
├─────────────────────────────────────────────────────────────┤
│     ↓                       ↓                                │
│  Create Highlight       Ask AI Question                    │
│  • Validate input       • Validate input                   │
│  • Check auth           • Check auth                       │
│  • Save to DB           • Call Gemini API                  │
│  • Return response      • Save Q&A to DB                  │
│                         • Return response                  │
│     ↓                       ↓                                │
│  Highlight                 Question                        │
│  Model                      Model                          │
│     ↓                       ↓                                │
│  PostgreSQL Database                                       │
│  ├── highlights table                                      │
│  └── questions table                                       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│           EXTERNAL SERVICES                                 │
├─────────────────────────────────────────────────────────────┤
│              ↓                                              │
│           Google Gemini API                                │
│           (AI Response Generation)                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing Checklist

### Backend Unit Tests
- [ ] `test_create_highlight()` - POST /highlights/
- [ ] `test_list_highlights()` - GET /highlights/
- [ ] `test_update_highlight()` - PUT /highlights/{id}
- [ ] `test_delete_highlight()` - DELETE /highlights/{id}
- [ ] `test_ask_ai_question()` - POST /ai/qa/{id}
- [ ] `test_get_qa_history()` - GET /ai/qa/{id}
- [ ] `test_gemini_query_with_context()` - Gemini integration
- [ ] `test_error_handling()` - 400/401/404/500 responses

### Frontend Integration Tests
- [ ] Render AIQAPanel component
- [ ] Submit question via form
- [ ] Load Q&A history
- [ ] Handle errors gracefully
- [ ] Update highlights in sidebar
- [ ] Text selection in AI Reading mode

### E2E Tests (Browser)
- [ ] Create highlight → See in sidebar
- [ ] Ask AI question → See response
- [ ] Delete highlight → Refresh → Gone
- [ ] Switch between PDF/AI Reading modes
- [ ] Responsive on mobile

---

## Deployment Notes

### Environment Variables
```bash
# .env.backend
GEMINI_API_KEY=xxx...
GOOGLE_API_KEY=xxx...
DATABASE_URL=postgresql://user:pass@localhost/dbname
```

### Database Migration
```bash
cd backend
python -m alembic upgrade head
```

### Run Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
# Visit http://localhost:8000/docs for Swagger UI
```

### Run Frontend
```bash
cd frontend
npm install
npm start
# Visit http://localhost:3000
```

---

## Files Modified/Created

### Created ✨
- `frontend/src/components/AIQAPanel.tsx`
- `backend/alembic/versions/add_page_number_to_highlights.py`
- `notes/UC07_Implementation_Guide.md`
- `notes/UC07_Demo_Workflow.md`

### Modified ✏️
- `backend/app/models/highlight.py` - Added page_number
- `backend/app/schemas/highlight.py` - Added page_number schema
- `backend/app/api/v1/routes/ai.py` - Added Q&A endpoints
- `backend/app/core/gemini.py` - Added query_ai_with_context()
- `frontend/src/pages/DocumentDetailPage.tsx` - Integrated AIQAPanel
- `backend/app/api/v1/routes/highlights.py` - Updated page_number handling

### Unchanged ✓
- `backend/app/models/question.py` - Already complete
- `backend/app/schemas/question.py` - Already complete
- `backend/app/api/v1/routes/questions.py` - Already complete
- `backend/app/api/v1/api.py` - Routes already registered

---

## Performance Optimization

### Caching (Future)
```python
@cache.cached(timeout=300)  # 5 minutes
def get_highlights(document_id: int):
    return db.query(Highlight).filter(...).all()
```

### Pagination (Future)
```python
@router.get("/")
def list_highlights(
    document_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    return db.query(Highlight).offset(skip).limit(limit).all()
```

### Lazy Loading (Current)
- Highlights load on sidebar scroll
- Q&A loads on tab switch
- Reduces initial page load time

---

## Git Commit Message

```
feat(UC07): Implement Learning Interface with AI Q&A & Highlights

## Summary
Completed UC07 with full backend-frontend integration for interactive learning experience:
- Highlight management (CRUD operations)
- AI Q&A with context awareness
- 3-panel responsive layout
- Gemini AI integration

## Changes
### Backend
- Add `page_number` column to highlights table
- Implement Q&A endpoints with Gemini integration
- Add `query_ai_with_context()` function
- Enhanced error handling and logging

### Frontend
- Create AIQAPanel component for Q&A interface
- Integrate with DocumentDetailPage
- Improve error handling for highlights
- Add text selection floating toolbar

### Database
- Migration: add_page_number_to_highlights

## Fixes
- Highlight creation was failing due to missing page_number column
- AI Q&A endpoint was returning generic errors
- Frontend error messages improved for better UX

## Testing
- Manual testing: Create, update, delete highlights
- Manual testing: Ask AI questions with highlight context
- Verified error handling and edge cases

## Breaking Changes
None

## Notes
- Requires Gemini API key in environment
- Migration must be run: `alembic upgrade head`
- Frontend components properly typed with TypeScript

Closes: UC07
```
