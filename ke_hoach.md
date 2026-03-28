# KẾ HOẠCH PHÁT TRIỂN FULL MVP
**Hệ thống UniStudy - Hỗ trợ Học tập Thông minh IUH**

**Thời hạn hoàn thành MVP:** 12/04/2026  
**Tech Stack:**
- **Frontend:** React + Vite + Tailwind CSS + React Router + Axios + Zustand + react-pdf
- **Backend:** FastAPI + SQLAlchemy + Alembic + PostgreSQL + JWT
- **Database:** PostgreSQL

## 1. Thông tin chung
- Thành viên: 4 người (Thịnh - Nhóm trưởng, Anh, Nhật, Khang)
- Tất cả giao diện (text, button, label, menu…) **phải bằng tiếng Việt**.
- Thịnh đã có base backend → chịu trách nhiệm phần chung, review code và merge.
- Mỗi thành viên chịu trách nhiệm cả **Frontend pages** và **Backend APIs** của module mình.

## 2. Phân công nhiệm vụ chi tiết

| STT | Thành viên       | Module                              | Frontend Pages / Components (tiếng Việt)                                                                 | Backend (FastAPI)                                                                 | Deadline nội bộ |
|-----|------------------|-------------------------------------|----------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|-----------------|
| 1   | **Thịnh** (Nhóm trưởng) | **Auth + Layout + Landing + Dashboard** | - Trang chủ công khai (Landing Page)<br>- Đăng nhập<br>- Đăng ký<br>- Layout chung (Sidebar + Header)<br>- Trang chủ Sinh viên<br>- Trang chủ Giảng viên | - Auth (login, register, JWT, role)<br>- User management<br>- Dashboard APIs (recent documents, stats theo role)<br>- Protected middleware | 05/04/2026     |
| 2   | **Anh**          | **Quản lý Tài liệu**                | - Danh sách Tài liệu (Thư viện + Search/Filter)<br>- Tải tài liệu lên<br>- Chi tiết Tài liệu (tab Thông tin + PDF Viewer)<br>- Modal Chia sẻ Tài liệu | - Documents (CRUD, upload file)<br>- Document metadata<br>- Document_Shares (chia sẻ + permission)<br>- File handling | 08/04/2026     |
| 3   | **Nhật**         | **Tương tác & Thảo luận**           | - Chi tiết Tài liệu (tab Đặt câu hỏi, Thảo luận, Highlight)<br>- Thảo luận (Comments + Reply)<br>- Component Highlight trong PDF | - Questions (đặt câu hỏi về tài liệu)<br>- Discussions (comment + reply)<br>- Highlights (lưu theo trang, màu, ghi chú) | 08/04/2026     |
| 4   | **Khang**        | **Kiểm tra, Flashcard & GPA**       | - Danh sách Bài kiểm tra<br>- Làm bài kiểm tra<br>- Kết quả bài kiểm tra<br>- Học Flashcard<br>- Modal Tạo Flashcard<br>- Tính GPA cá nhân | - Tests + Test_Results<br>- Flashcards (CRUD + chế độ học)<br>- GPA logic (tính điểm hệ 10/4.0 + lịch sử)<br>- Test submission & scoring | 08/04/2026     |

### Component chung (Thịnh chịu trách nhiệm chính)
- Sidebar role-based (Sinh viên / Giảng viên)
- Header (tìm kiếm, thông báo, avatar)
- ProtectedRoute
- Loading spinner & Toast notification
- PDF Viewer component

## 3. Lịch trình thực hiện

### Tuần 1 (29/03/2026 – 05/04/2026)
- Thịnh: Landing Page + Auth + Layout + Dashboard (Frontend + Backend)
- Anh: Danh sách Tài liệu + Tải tài liệu lên (Frontend + Backend)
- Toàn nhóm: Setup project React + FastAPI + kết nối PostgreSQL

### Tuần 2 (06/04/2026 – 12/04/2026)
- Hoàn thiện Chi tiết Tài liệu (tất cả các tab)
- Hoàn thiện Bài kiểm tra, Flashcard, GPA
- Tích hợp Frontend ↔ Backend
- Testing (Unit + Integration + System)
- Deploy staging (Frontend: Vercel, Backend: Railway/Render)

## 4. Testing Plan (tóm tắt)
- Unit Testing: Jest (Frontend), Pytest (Backend)
- Integration Testing: Upload → lưu DB → hiển thị
- System Testing theo Use Case:
  - TC01: Landing → Đăng ký → Đăng nhập → Tải tài liệu → Chi tiết Tài liệu → Highlight → Đặt câu hỏi
  - TC02: Làm bài kiểm tra → Nộp bài → Xem kết quả
  - TC03: Tính GPA (hệ 10 → hệ 4.0) → Lưu lịch sử
- Usability Testing: Mời 5–10 sinh viên/giảng viên thử nghiệm
- Tiêu chí hoàn thành: ≥ 95% test case pass, không có bug critical

## 5. Chức năng MVP (phạm vi triển khai)
- Trang chủ công khai (Landing Page) + Liên kết IUH
- Đăng nhập / Đăng ký
- Trang chủ theo vai trò (Sinh viên & Giảng viên)
- Quản lý Tài liệu (upload, xem danh sách, chi tiết, chia sẻ)
- Tương tác với tài liệu (đặt câu hỏi, thảo luận, highlight)
- Bài kiểm tra trắc nghiệm + xem kết quả
- Tạo & Học Flashcard (thủ công)
- Tính điểm GPA cá nhân (hệ 10 và 4.0)
- Layout và navigation mượt mà

**Lưu ý quan trọng:**
- Không triển khai tính năng AI nâng cao, phát hiện đạo văn, bảng xếp hạng, Admin đầy đủ (dành cho phase sau).
- Tất cả text trên giao diện phải bằng tiếng Việt.

---

**Hướng dẫn sử dụng:**
1. Copy toàn bộ nội dung trên
2. Tạo file mới: `PLAN_MVP_FULL.md`
3. Paste và lưu
4. Mở bằng VS Code hoặc Typora để xem đẹp hơn

File này đã bao gồm:
- Landing Page (trang công khai)
- Toàn bộ use case trong diagram
- Phân công cân bằng giữa 4 thành viên
- Tech stack FastAPI + React + PostgreSQL

Bạn muốn tôi bổ sung thêm phần nào không?
- Danh sách API endpoints chi tiết theo module
- Cấu trúc thư mục chi tiết cho Frontend và Backend
- Template commit message & Git workflow

Cứ nói tôi sẽ cập nhật ngay!
