# UC07 - Learning Interface (Xem Tài Liệu & Tương Tác Học Tập)

## 📋 Tổng Quan

**Mục tiêu**: Chuyển từ "Đọc tài liệu tĩnh" → "Tương tác học tập có hỗ trợ AI"

UC07 cung cấp một giao diện học tập toàn diện với 3 vùng chính:
- **Vùng Trái**: Cấu trúc tài liệu + Danh sách Highlights
- **Vùng Giữa**: Nội dung tài liệu (PDF hoặc AI Reading mode)
- **Vùng Phải**: AI Panel (Hỏi đáp, Tóm tắt, Sơ đồ, Flashcards)

---

## 🏗️ Kiến Trúc Hệ Thống

### A. Database Layer

#### Model: `Highlight`
```python
# File: backend/app/models/highlight.py
class Highlight(Base):
    __tablename__ = "highlights"
    
    id: int (PK)
    document_id: int (FK → documents)
    user_id: int (FK → users)
    text_content: str (nội dung bôi đen)
    color: str (màu sắc: yellow, green, blue, pink)
    note: str (ghi chú cá nhân)
    page_number: int (trang/vị trí)
    created_at: datetime (timestamp)
```

#### Model: `Question` (AI Q&A)
```python
# File: backend/app/models/question.py
class Question(Base):
    __tablename__ = "questions"
    
    id: int (PK)
    document_id: int (FK → documents)
    user_id: int (FK → users)
    content: str (câu hỏi)
    answer: str (câu trả lời từ AI)
    created_at: datetime (timestamp)
```

---

### B. Backend API Endpoints

#### Highlights API
```
POST   /api/v1/highlights/              - Tạo highlight mới
GET    /api/v1/highlights/?document_id  - Danh sách highlights của tài liệu
PUT    /api/v1/highlights/{id}          - Cập nhật highlight (màu, ghi chú)
DELETE /api/v1/highlights/{id}          - Xóa highlight
```

**Schema Request/Response**:
```json
{
  "document_id": 1,
  "text_content": "Đoạn văn được bôi đen",
  "color": "yellow",           // Mặc định: "yellow"
  "note": "Ghi chú của bạn",   // Optional
  "page_number": 1             // Optional, mặc định: 1
}
```

#### AI Q&A API
```
POST   /api/v1/ai/qa/{document_id}  - Hỏi AI với context (highlight)
GET    /api/v1/ai/qa/{document_id}  - Lấy lịch sử Q&A của tài liệu
```

**Request Schema**:
```json
{
  "content": "Câu hỏi của bạn",
  "context": "(Optional) Đoạn text bôi đen làm ngữ cảnh"
}
```

**Response Schema**:
```json
{
  "id": 1,
  "document_id": 1,
  "content": "Câu hỏi",
  "answer": "Câu trả lời từ AI Gemini",
  "user_id": 1,
  "created_at": "2026-05-06T10:30:00Z"
}
```

#### Gemini Integration
```python
# File: backend/app/core/gemini.py
def query_ai_with_context(question: str, context: str, document_title: str) -> Optional[str]:
    """
    Gọi Gemini AI API với prompt có cấu trúc:
    - Vai trò: Trợ lý học thuật
    - Input: Câu hỏi + Ngữ cảnh (từ highlight)
    - Output: Giải thích chi tiết, đáp án, hay gợi ý học
    
    Logic:
    1. Kiểm tra API key
    2. Chuẩn bị prompt với context
    3. Gọi genai.GenerativeModel.generate_content()
    4. Parse response text
    5. Return kết quả hoặc None nếu lỗi
    """
```

---

### C. Frontend Components

#### 1. **AIQAPanel Component**
```tsx
// File: frontend/src/components/AIQAPanel.tsx

interface AIQAPanelProps {
  documentId: number;
  currentUserId: number | null;
  highlightText?: string;  // Tự động fill từ highlight đã chọn
}

// Features:
// - Hiển thị danh sách Q&A lịch sử
// - Input text area để nhập câu hỏi
// - Auto-fill câu hỏi từ highlight
// - Loading state & error handling
// - Responsive design, tương thích mobile
```

**Flow**:
1. User bôi đen text → Set `highlightText` prop
2. User click "Hỏi AI" → Component auto-fill câu hỏi
3. User submit → API POST /api/v1/ai/qa/{id}
4. Hiển thị loading → Fetch response → Display answer

#### 2. **DocumentDetailPage Enhancement**
```tsx
// File: frontend/src/pages/DocumentDetailPage.tsx

// Thay đổi:
// - Import AIQAPanel component
// - Thay thế old questions section bằng AIQAPanel
// - Cải thiện error handling cho highlight
// - Add selectedText state → pass vào AIQAPanel
```

**State Management**:
```tsx
const [highlights, setHighlights] = useState<HighlightItem[]>([]);
const [selectedText, setSelectedText] = useState('');
const [showHighlightModal, setShowHighlightModal] = useState(false);
const [highText, setHighText] = useState('');
const [highColor, setHighColor] = useState('yellow');
const [highNote, setHighNote] = useState('');
```

**Quick Actions Toolbar** (Hiển thị khi user bôi đen text):
- **Highlight**: Mở modal tạo highlight
- **Hỏi AI**: Pass text vào AIQAPanel, switch tab
- **Flashcard**: Auto-generate flashcard từ text

---

## 🔄 Luồng Dữ Liệu (Data Flow)

### Scenario 1: Tạo Highlight
```
1. User bôi đen text trong AI Reading mode
2. Floating toolbar xuất hiện (Highlight, Hỏi AI, Flashcard)
3. User click "Highlight"
4. Modal mở để chọn màu + ghi chú
5. User click "Lưu thẻ"
6. Frontend: POST /api/v1/highlights/
   {
     document_id: 1,
     text_content: "...",
     color: "yellow",
     note: "..."
   }
7. Backend: Lưu vào DB (Highlight model)
8. Frontend: Refetch highlights, update sidebar
9. Success toast: "✅ Lưu highlight thành công!"
```

### Scenario 2: Hỏi AI với Highlight Context
```
1. User bôi đen text → Floating toolbar
2. User click "Hỏi AI"
3. Text được auto-fill vào AIQAPanel input
4. User có thể sửa câu hỏi hoặc submit luôn
5. Frontend: POST /api/v1/ai/qa/{document_id}
   {
     content: "Câu hỏi",
     context: "Đoạn text bôi đen"
   }
6. Backend:
   - Gọi query_ai_with_context()
   - Tạo prompt: "Hãy giải thích: {context} \n Câu hỏi: {question}"
   - Gọi Gemini API
   - Lưu Q&A vào DB (Question model)
7. Frontend: Hiển thị answer trong AIQAPanel
8. User có thể tiếp tục hỏi câu hỏi khác
```

### Scenario 3: Xem Danh Sách Highlights
```
1. User vào document detail page
2. Sidebar Left load highlights list
3. Frontend: GET /api/v1/highlights/?document_id=1
4. Backend: Query tất cả highlights của user cho tài liệu
5. Frontend: Render danh sách với:
   - Text preview (line-clamp-3)
   - Ghi chú (nếu có)
   - Màu sắc (border-left-color)
   - Button xóa (hover to show)
6. User click một highlight → Scroll to đoạn đó
```

---

## 🎨 UI/UX Design

### Layout 3 Vùng (3-Panel Layout)

```
┌─────────────────────────────────────────────────────────────┐
│                         Header                               │
│          Document Title | Tải về PDF | Chia sẻ              │
├──────────────┬─────────────────────────────┬────────────────┤
│              │                             │                │
│   Left:      │    Center:                  │  Right:        │
│   Sidebar    │  Document Viewer            │  AI Panel      │
│              │  (PDF/AI Reading)           │                │
│ • Outline    │                             │ Tabs:          │
│ • Highlights │  [PDF/AI Reading Toggle]    │ ✓ Hỏi AI      │
│              │                             │ • Tóm tắt      │
│              │  Content...                 │ • Sơ đồ        │
│              │  {Floating Toolbar}         │ • Flashcards   │
│              │                             │ • Thảo luận    │
│              │                             │                │
│  Width:      │  Flex-1                     │  Width: 400px  │
│  280px       │                             │                │
└──────────────┴─────────────────────────────┴────────────────┘
```

### Color System
- **Primary**: #3B66F5 (Blue - AI actions)
- **Highlight Colors**: #FDE047 (Yellow), #86EFAC (Green), #93C5FD (Blue), #F9A8D4 (Pink)
- **Success**: #10B981 (Green)
- **Error**: #EF4444 (Red)
- **Background**: #F6F3EE (Warm beige)

### Typography
- **Headers**: 16px, bold
- **Body**: 14px, regular
- **Labels**: 12px, semibold
- **Timestamps**: 11px, gray-400

---

## 🚨 Error Handling & Validation

### Frontend Validation
```typescript
// Highlight creation
- Text không trống: if (!highText.trim()) return;
- User phải đăng nhập: if (!currentUserId) alert('Đăng nhập');
- Color phải hợp lệ: yellow|green|blue|pink

// AI Q&A
- Câu hỏi không trống: if (!questionInput.trim()) alert('Nhập câu hỏi');
- API timeout: 30s (default Gemini API)
```

### Backend Error Responses
```
400 Bad Request
  - Document không tìm thấy
  - Invalid color value
  - Empty question

401 Unauthorized
  - User chưa đăng nhập

403 Forbidden
  - User không phải owner (khi delete)

500 Internal Server Error
  - Gemini API lỗi
  - Database lỗi
  - Message: "Lỗi xảy ra khi gọi AI: {error_detail}"
```

### Error Recovery
```typescript
try {
  // API call
} catch (err: any) {
  const errorMsg = err.response?.data?.detail || err.message || 'Lỗi không xác định';
  setError(errorMsg);
  // Show error toast / modal
  setTimeout(() => setError(''), 5000);
}
```

---

## 📊 Performance Metrics (KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Avg Session Duration** | 15+ mins | Google Analytics / Backend logs |
| **Highlights per Session** | 3+ | Count POST requests to /highlights/ |
| **AI Interaction Rate** | 40%+ | % of users using "Hỏi AI" feature |
| **Response Time (AI Q&A)** | <5s | API latency (Gemini API + DB) |
| **Error Rate** | <5% | 5xx / total API requests |

---

## 📱 Responsive Design

### Desktop (> 1280px)
- Full 3-panel layout
- Sidebar: 280px
- Center: flex-1
- Right: 400px

### Tablet (768px - 1280px)
- 2-panel: Hide sidebar on scroll
- Center: expand
- Right: 380px (collapsed)

### Mobile (< 768px)
- Single panel stack
- Bottom tabs for panels
- Full-width content

---

## 🔐 Security Considerations

1. **Authentication**: Verify `current_user` from JWT token
2. **Authorization**: User chỉ có thể xem/edit highlights của mình
3. **SQL Injection**: SQLAlchemy ORM parameterized queries
4. **XSS Protection**: Sanitize text_content before DB
5. **Rate Limiting**: Limit AI Q&A requests (5 req/min per user)
6. **API Keys**: Gemini API key trong environment variables

---

## ✅ Testing Checklist

- [ ] Create highlight từ AI Reading mode
- [ ] Delete highlight và refresh
- [ ] Ask AI question với highlight context
- [ ] Load Q&A history
- [ ] Error handling (no text, no login, API error)
- [ ] Switch between PDF/AI Reading modes
- [ ] Responsive design on mobile
- [ ] Performance: load time < 3s

---

## 📝 Commit Message

```
feat(UC07): Implement Learning Interface with AI Q&A and Highlights

- Add Highlight model with page_number column
- Implement Highlights API (CRUD)
- Add AI Q&A endpoint with Gemini integration
- Create AIQAPanel component for Q&A interaction
- Enhance DocumentDetailPage with 3-panel layout
- Add quick actions toolbar for text selection
- Implement proper error handling and validation
- Add responsive design support

Fixes: Highlight creation failed, AI Q&A error handling
```

---

## 🔗 Related Files

### Backend
- `backend/app/models/highlight.py` - Highlight model
- `backend/app/models/question.py` - Question model
- `backend/app/schemas/highlight.py` - Highlight schema
- `backend/app/schemas/question.py` - Question schema
- `backend/app/api/v1/routes/highlights.py` - Highlights API
- `backend/app/api/v1/routes/ai.py` - AI Q&A endpoints
- `backend/app/core/gemini.py` - Gemini integration
- `backend/alembic/versions/` - Database migrations

### Frontend
- `frontend/src/pages/DocumentDetailPage.tsx` - Main page
- `frontend/src/components/AIQAPanel.tsx` - Q&A component
- `frontend/src/services/api.ts` - API client

---

## 🎯 Next Steps

1. ✅ Backend: Complete AI Q&A API
2. ✅ Frontend: Integrate AIQAPanel component
3. ⏳ Testing: Demo on UI and verify functionality
4. ⏳ Optimization: Performance tuning
5. ⏳ Documentation: Update API docs
6. ⏳ Deployment: Add to CI/CD pipeline
