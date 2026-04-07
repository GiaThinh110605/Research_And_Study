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
| 1   | **Thịnh** (Nhóm trưởng) | **Auth + Layout + Landing + Dashboard** | - Trang chủ công khai (Landing Page)<br>- Đăng nhập <br>- Đăng ký<br>- Layout chung (Sidebar + Header)<br>- Trang chủ Sinh viên<br>- Trang chủ Giảng viên<br>- Tính năng <br>- Tài liệu <br>- Cộng đồng  | - Auth (login, register, JWT, role)<br>- User management<br>- Dashboard APIs (recent documents, stats theo role)<br>- Protected middleware | 05/04/2026     |
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
## 6. Hướng dẫn chạy project

### 6.1. Cách 1 (Khuyến nghị): Chạy bằng Docker Compose

Ưu điểm: nhanh, ít lỗi môi trường, không cần cài Python/Node/PostgreSQL thủ công.

1. Cài sẵn:
- Docker Desktop
- Docker Compose (đi kèm Docker Desktop)

2. Mở terminal tại thư mục gốc project rồi chạy:

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

3. Chạy migration database (nên làm 1 lần sau khi services đã lên):

```bash
docker compose -f docker-compose.dev.yml exec -T backend alembic upgrade head
```

4. Truy cập hệ thống:
- Frontend: http://localhost:3000
- Backend API Docs (Swagger): http://localhost:8000/docs
- Health check: http://localhost:8000/health

5. Theo dõi log khi cần debug:

```bash
docker compose -f docker-compose.dev.yml logs -f
```

6. Dừng hệ thống:

```bash
docker compose -f docker-compose.dev.yml down
```

7. Dừng và xóa luôn volume dữ liệu DB (chỉ dùng khi muốn reset sạch dữ liệu):

```bash
docker compose -f docker-compose.dev.yml down -v
```

### 6.2. Cách 2: Chạy local thủ công (không dùng Docker)

Ưu điểm: dễ debug từng service riêng lẻ.

#### Bước A - Chuẩn bị môi trường
- Python 3.10+
- Node.js 18+
- PostgreSQL 15+

Tạo database trong PostgreSQL:
- DB name: `ai_research_db`
- User: `postgres`
- Password: tùy bạn đặt
- Port: `5432`

#### Bước B - Chạy Backend (FastAPI)
1. Vào thư mục backend.
2. Tạo và kích hoạt virtual environment.
3. Cài dependencies từ `requirements.txt`.
4. Tạo file `.env` trong thư mục `backend` với nội dung ví dụ:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ai_research_db
SECRET_KEY=your-secret-key-here
```

5. Chạy migration:

```bash
alembic upgrade head
```

6. Chạy API:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

7. Kiểm tra backend:
- http://localhost:8000/health
- http://localhost:8000/docs

#### Bước C - Chạy Frontend (React)
1. Mở terminal mới, vào thư mục frontend.
2. Cài dependencies:

```bash
npm install
```

3. Chạy frontend:

```bash
npm start
```

4. Truy cập giao diện:
- http://localhost:3000

### 6.3. Checklist xác nhận chạy thành công
- [ ] Mở được trang frontend tại `localhost:3000`
- [ ] API trả về `{"status":"healthy"}` tại `/health`
- [ ] Swagger mở được tại `/docs`
- [ ] Đăng ký/đăng nhập test hoạt động bình thường

### 6.4. Lỗi thường gặp và cách xử lý nhanh
- Lỗi cổng 3000/8000/5432 đang bận: đổi cổng hoặc tắt service đang chiếm cổng.
- Frontend không gọi được API: kiểm tra backend có đang chạy ở `localhost:8000`.
- Lỗi kết nối DB: kiểm tra `DATABASE_URL`, tài khoản PostgreSQL và DB `ai_research_db`.
- Lỗi thiếu bảng dữ liệu: chạy lại `alembic upgrade head`.
- Docker build lỗi package: chạy lại với `--build` hoặc xóa image cũ rồi build lại.

### 6.5. Lệnh nhanh tham khảo

```bash
# Docker
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml exec -T backend alembic upgrade head
docker compose -f docker-compose.dev.yml logs -f
docker compose -f docker-compose.dev.yml down

# Backend local
cd backend
alembic upgrade head
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Frontend local
cd frontend
npm install
npm start
```

## 7. Tai lieu trien khai rieng cho thanh vien Anh

- Tai lieu huong dan chi tiet theo vai tro Quan ly Tai lieu:
  [HUONG_DAN_THUC_THI_MODULE_QUAN_LY_TAI_LIEU_NGUYEN_TUAN_ANH.md](HUONG_DAN_THUC_THI_MODULE_QUAN_LY_TAI_LIEU_NGUYEN_TUAN_ANH.md)

- Tai lieu nay gom:
  - Lo trinh M1-M4
  - Y nghia tung buoc
  - Chuc nang can dat
  - Bang theo doi tien do
  - Mau bao cao hoc thuat theo ngay
