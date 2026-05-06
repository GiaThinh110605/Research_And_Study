# UC07 - Demo Workflow

## Demo Script: Learning Interface with AI Support

### Prerequisites
- ✅ Backend running on `http://localhost:8000`
- ✅ Frontend running on `http://localhost:3000`
- ✅ User logged in
- ✅ Document uploaded (UC06)
- ✅ Gemini API key configured

---

## Demo Flow (5-7 minutes)

### Step 1: Open Document Detail Page
**What to show:**
- Navigate to uploaded document
- Show 3-panel layout:
  - Left: Outline & Highlights
  - Center: Document content
  - Right: AI Panel with tabs

**Expected UI:**
```
┌─ Tài liệu > AI_Document.pdf
├─ [Left] Cấu trúc tài liệu (skeleton load)
├─ [Center] PDF Gốc (embedded iframe) / AI Reading (text view)
└─ [Right] 
   ├─ Tab 1: Tóm tắt (Summary)
   ├─ Tab 2: Hỏi AI (Q&A) ← We'll use this
   ├─ Tab 3: Sơ đồ (Mindmap)
   ├─ Tab 4: Flashcards
   └─ Tab 5: Thảo luận
```

---

### Step 2: Switch to AI Reading Mode
**Action:**
1. Click "AI Reading" button (next to PDF Gốc)
2. Wait for content to load

**Expected Result:**
- Content rendered as selectable text
- Floating toolbar hidden (no selection yet)
- Sidebar shows outline

**Console Check:**
```javascript
// Verify chunks loaded
console.log(chunks.length)  // Should be > 0
```

---

### Step 3: Create Highlight by Text Selection
**Action:**
1. Click and drag to select a meaningful sentence, e.g.:
   > "Deep Learning là một nhánh của Machine Learning"

**Expected Result:**
- Text highlighted with blue background
- Floating toolbar appears above selection:
  ```
  [● Highlight] [| Chat AI] [| Flashcard]
  ```

**Action (continued):**
1. Click "Highlight" button
2. Modal opens with:
   - Color selector (4 colors)
   - Note textarea
   - Cancel / Lưu thẻ buttons

3. Select color (e.g., Green #86EFAC)
4. Type note: "Khái niệm cơ bản"
5. Click "Lưu thẻ"

**Expected Result:**
```
✅ Alert: "Lưu highlight thành công!"
```

**In Sidebar Left:**
- Highlight appears in "Highlight của bạn" section
- Shows truncated text + color indicator
- Hover to see delete button

**Console:**
```
POST /api/v1/highlights/
{
  "document_id": 1,
  "text_content": "Deep Learning là một nhánh...",
  "color": "#86EFAC",
  "note": "Khái niệm cơ bản",
  "page_number": 1
}

Response:
{
  "id": 42,
  "document_id": 1,
  "user_id": 5,
  "text_content": "Deep Learning...",
  "color": "#86EFAC",
  "note": "Khái niệm cơ bản",
  "page_number": 1,
  "created_at": "2026-05-06T10:30:00Z"
}
```

---

### Step 4: Ask AI Question with Highlight Context
**Action:**
1. Select another sentence from content, e.g.:
   > "Neural Networks có cấu trúc gồm input layer, hidden layers, output layer"

2. Click "Hỏi AI" button in floating toolbar

**Expected Result:**
- Auto-switch to "Hỏi AI" tab in Right panel
- Selected text auto-filled in input textarea

**Action (continued):**
1. Modify question or keep as-is
2. Type full question: "Tại sao cần có hidden layers?"
3. Click "✨ Hỏi AI" button

**Expected Result:**
- Button shows: "⏳ Đang xử lý..."
- Loading spinner appears
- After 3-5 seconds, AI response shows:

```
💡 Câu trả lời:
Hidden layers giúp mô hình học các tính năng phức tạp từ dữ liệu 
thô. Mỗi hidden layer thực hiện các phép biến đổi phi tuyến 
trên dữ liệu từ layer trước đó, cho phép mạng học các mẫu 
ẩn sâu hơn. Các hidden layers có vai trò là "feature extractors" 
trong mạng nơ-ron.

[Timestamp: 06/05/2026 10:31:00]
```

**Console:**
```
POST /api/v1/ai/qa/1
{
  "content": "Tại sao cần có hidden layers?",
  "context": "Neural Networks có cấu trúc gồm input layer, hidden layers, output layer"
}

Response:
{
  "id": 99,
  "document_id": 1,
  "user_id": 5,
  "content": "Tại sao cần có hidden layers?",
  "answer": "Hidden layers giúp mô hình học các tính năng phức tạp từ dữ liệu...",
  "created_at": "2026-05-06T10:31:00Z"
}
```

---

### Step 5: Continue with More Questions
**Action:**
1. User can scroll up in Q&A panel to see previous questions
2. Ask another question: "Hyperparameter tuning quan trọng như thế nào?"
3. Submit question

**Expected Result:**
- Question added to history
- AI response appears below previous Q&A
- Can continue conversation naturally

---

### Step 6: View All Highlights
**Action:**
1. Check left sidebar
2. Scroll in "Highlight của bạn" section

**Expected Result:**
Shows all highlights created:
1. ✓ "Deep Learning là một nhánh..." (Green, "Khái niệm cơ bản")
2. ✓ More highlights with different colors

**Action (Test Delete):**
1. Hover over a highlight
2. Click delete button (✕)
3. Confirm dialog appears

**Expected Result:**
```
Bạn có chắc chắn muốn xoá thẻ highlight này?
[Không] [Có]
```

- After delete:
```
DELETE /api/v1/highlights/42
Response: {"message": "Đã xóa highlight"}
```

- Sidebar updates, highlight removed

---

### Step 7: Error Handling Demo

#### 7a. Highlight without text
**Action:**
1. Don't select any text
2. Try clicking "Highlight"

**Expected Result:**
- Nothing happens (handler prevents)

#### 7b: API Error Simulation
**Action:**
1. Open DevTools → Network tab
2. Select text, create highlight
3. Pause network request
4. Network error occurs

**Expected Result:**
```
❌ Alert: "Tạo highlight thất bại"
```

#### 7c: AI API Error
**Action:**
1. Pause network request during Q&A
2. Timeout occurs

**Expected Result:**
```
AIQAPanel shows error:
"❌ Lỗi xảy ra khi gọi AI. Vui lòng thử lại."
```

---

## Expected Performance

| Action | Time | Notes |
|--------|------|-------|
| Switch to AI Reading | < 2s | Load chunks from server |
| Create Highlight | < 1s | DB write + sidebar update |
| Ask AI Question | 3-5s | Gemini API latency |
| Load Q&A History | < 1s | SELECT from DB |
| Delete Highlight | < 1s | DB delete + sidebar update |

---

## Success Criteria ✅

- [x] Text selection in AI Reading mode works
- [x] Floating toolbar appears on text selection
- [x] Create highlight saves to DB
- [x] Highlights appear in sidebar with correct color
- [x] Ask AI question sends to backend
- [x] Gemini AI returns response
- [x] Q&A history displays correctly
- [x] Error messages show up clearly
- [x] Delete highlight works
- [x] UI is responsive and intuitive

---

## Screenshots / Recordings

### Before (Without UC07)
- Simple document viewer
- No interactivity
- No highlight support

### After (With UC07)
- 3-panel layout
- Text selection with floating toolbar
- Highlights persist in sidebar
- AI Q&A panel with history
- Professional, academic-focused design

---

## Troubleshooting

### Problem: "Tạo highlight thất bại"
**Solution:**
1. Check backend logs: `python -m alembic upgrade head`
2. Verify highlights route registered: `GET /api/v1/highlights/?document_id=1`
3. Check user auth: `GET /api/v1/users/me` should work

### Problem: "Lỗi xảy ra khi gọi AI"
**Solution:**
1. Check Gemini API key: `echo $GEMINI_API_KEY`
2. Verify API quota not exceeded
3. Check network in DevTools
4. Retry after few seconds

### Problem: AI Reading mode not loading
**Solution:**
1. Check document file exists
2. Verify chunking completed in UC06
3. Refresh page: F5
4. Clear browser cache

---

## Next Improvements

1. **Batch Operations**: Select multiple highlights to delete
2. **Export**: Export highlights to PDF/Word
3. **Tags**: Tag highlights with topics
4. **Search**: Search highlights by text/tag
5. **Sharing**: Share specific highlights with classmates
6. **Offline**: Sync highlights when online
