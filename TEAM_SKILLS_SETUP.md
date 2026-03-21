# TEAM SKILLS / SETUP PLAYBOOK (React + FastAPI)

Tài liệu này tóm tắt requirement từ `PTUD_CK.docx` và chuẩn hoá cách làm việc để cả nhóm code đồng bộ, ít conflict, dễ review và tối ưu tiến độ.

## 1) MVP scope (chốt theo proposal)
**Deadline MVP:** 12/04/2026.

### 1.1. MVP features (phải có)
- **Auth**
  - Đăng ký / đăng nhập (Student, Lecturer)
  - Admin dùng tài khoản mặc định
- **Documents**
  - Upload PDF (lưu metadata: title, description, subject)
  - Document list + Document detail (xem PDF)
  - **Highlight** nội dung quan trọng (cá nhân)
  - **Share** tài liệu (view/comment)
- **Q&A cơ bản trên tài liệu**
  - Đặt câu hỏi và lưu lịch sử (MVP có thể để rule-based / stub AI; AI nâng cao làm sau)
- **Discussion / Comments**
  - Comment đơn giản dưới tài liệu
- **Tests / Quiz**
  - Làm bài trắc nghiệm, submit, xem kết quả
- **Flashcards**
  - Tạo thủ công từ tài liệu, học flip-card
- **GPA calculator**
  - Nhập điểm hệ 10 + quy đổi hệ 4.0, lưu history
- **Dashboard cơ bản**
  - Student: tài liệu gần đây, test gần đây
  - Lecturer: tài liệu đã upload, kết quả test sinh viên

### 1.2. Out-of-scope (để sau MVP / Beta)
- TOEIC chuyên sâu
- External search (Google Scholar/API ngoài)
- Generate đề tương tự đề cũ bằng ML
- Plagiarism nâng cao
- Leaderboard
- Admin monitoring full (mức nâng cao)

## 2) Chia module theo “mảnh ghép” (UI ↔ API ↔ DB)
Dưới đây là cách chia theo module để ai làm phần nào thì ownership rõ ràng.

### 2.1. Auth & Users
- **Frontend**
  - Login/Register pages
  - Route protection (PrivateRoute)
- **Backend**
  - `/auth/register`, `/auth/login`, `/auth/me`
  - RBAC: student/lecturer/admin
- **DB**
  - `users`

### 2.2. Documents
- **Frontend**
  - Upload page
  - Document list
  - Document detail: PDF viewer + highlight + Q&A + discussion
- **Backend**
  - `/documents` CRUD + upload
  - Serve file (hoặc trả `file_url`)
- **DB**
  - `documents`

### 2.3. Shares
- **Frontend**
  - Share modal + danh sách user được share
- **Backend**
  - `/document-shares` create/update status
- **DB**
  - `document_shares`

### 2.4. Q&A
- **Frontend**
  - Q&A box trong Document detail
- **Backend**
  - `/questions` create/list by document
- **DB**
  - `questions`

### 2.5. Discussions
- **Frontend**
  - Comment thread (có thể reply sau)
- **Backend**
  - `/discussions` create/list
- **DB**
  - `discussions`

### 2.6. Highlights
- **Frontend**
  - Highlight UI (MVP có thể highlight theo text selection + page number)
- **Backend**
  - `/highlights` create/list/delete
- **DB**
  - `highlights`

### 2.7. Tests & Results
- **Frontend**
  - Test page: làm bài, submit, kết quả
- **Backend**
  - `/tests` create/list/detail
  - `/test-results` submit/list
- **DB**
  - `tests`, `test_results`

### 2.8. Flashcards
- **Frontend**
  - Flashcard page: create + study
- **Backend**
  - `/flashcards` CRUD
- **DB**
  - `flashcards`

### 2.9. GPA calculator
- **Frontend**
  - GPA page: form nhập môn + bảng kết quả + history
- **Backend**
  - `/gpa` calculate + history (nếu lưu)
- **DB**
  - có thể dùng `calculator_logs` hoặc bảng GPA riêng (tối giản MVP)

## 3) React skills/setup (chuẩn code để không rối)
### 3.1. Cấu trúc frontend đề xuất
```
frontend/src/
  components/
    layout/
    common/
    documents/
    tests/
    flashcards/
  pages/
  hooks/
  services/
    api.ts
    auth.ts
    documents.ts
  utils/
  styles/
```

### 3.2. Quy ước bắt buộc
- **Component naming**: PascalCase
- **File naming**: camelCase hoặc PascalCase (chốt 1 kiểu trong team)
- **Không gọi API trực tiếp trong component**: luôn qua `services/*`
- **State**
  - MVP: React state + hooks là đủ
  - Tránh lạm dụng global state khi chưa cần

### 3.3. API client chuẩn
- Dùng `axios` 1 instance trong `services/api.ts`
- Auto-attach `Authorization: Bearer <token>`
- Centralized error handling (401 -> logout)

### 3.4. UI checklist cho mỗi page
- Loading state
- Empty state
- Error state
- Basic validation (form)

## 4) FastAPI skills/setup (chuẩn backend để dễ mở rộng)
### 4.1. Cấu trúc backend đề xuất
```
backend/
  app/
    api/
      v1/
        routes/
    core/
      config.py
      security.py
    models/
    schemas/
    services/
    utils/
  main.py
```

### 4.2. Quy ước bắt buộc
- **Pydantic schemas** tách riêng `schemas/` (request/response)
- **Service layer**: business logic nằm ở `services/`, router chỉ điều phối
- **RBAC**: dependency `get_current_user` + check role
- **Consistent response**
  - success: `{ data, message }`
  - error: `{ detail }` (theo FastAPI)

### 4.3. Database & migrations
- MVP nên dùng **SQLAlchemy + Alembic**
- Mọi thay đổi schema phải đi qua migration (không sửa tay DB)

## 5) Git/GitHub workflow (để tối ưu làm việc nhóm)
### 5.1. Branching
- `main`: ổn định, luôn deploy được
- `dev`: tích hợp
- feature branches: `feature/<module>-<short-desc>`

### 5.2. PR rules
- PR nhỏ, 1 module/1 feature
- Bắt buộc có:
  - mô tả tính năng
  - ảnh UI (nếu là FE)
  - cách test (steps)

### 5.3. Commit message
- `feat: ...`, `fix: ...`, `chore: ...`, `refactor: ...`

## 6) “Definition of Done” (checklist bắt buộc trước khi merge)
Mỗi task chỉ được coi là DONE khi:
- chạy được local (docker compose hoặc run manual)
- có test tối thiểu (unit hoặc smoke test) cho backend route / frontend component
- không có lỗi lint/type nghiêm trọng
- có mô tả ngắn trong PR

## 7) Testing plan (tối giản theo proposal)
- **Frontend**: Jest (smoke test 1-2 component quan trọng/module)
- **Backend**: pytest (test auth + 1 route/module)
- Test cases ưu tiên:
  - TC01: register -> login -> upload -> detail -> highlight -> hỏi đáp
  - TC02: làm test -> submit -> xem kết quả
  - TC03: tính GPA -> lưu history

## 8) Mapping phân công theo `ke_hoach.md` (để team follow)
Dùng file `ke_hoach.md` làm nguồn phân công và deadline theo tuần. Mọi thay đổi phân công phải update `ke_hoach.md` + GitHub Issues.

---

## Quick start (dev)
- Start services: `docker compose -f docker-compose.dev.yml up -d --build`
- Backend: `http://localhost:8000/health`
- Frontend: `http://localhost:3000`

> Ghi chú: nếu port Postgres bị chiếm, đổi port host trong `docker-compose.dev.yml` (VD: `5434:5432`).
