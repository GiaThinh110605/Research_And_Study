# SLIDE 1 — TRANG TIÊU ĐỀ

# Đồ án: HỆ THỐNG UNISTUDY - HỖ TRỢ HỌC TẬP THÔNG MINH IUH
## Môn học: Phát triển ứng dụng Web

---

**Giảng viên hướng dẫn:** [Họ Tên Giảng Viên]

**Nhóm thực hiện:** Nhóm Phát triển UniStudy
**Thành viên:**
1. Lâm Gia Thịnh (Leader) - DHKHMT19A
2. [Họ Tên Anh] - [MSSV]
3. [Họ Tên Nhật] - [MSSV]
4. [Họ Tên Khang] - [MSSV]

---

# SLIDE 2 — GIỚI THIỆU BÀI TOÁN

* **Bối cảnh:** Sinh viên gặp khó khăn trong việc quản lý tài liệu học tập, thảo luận và theo dõi tiến độ học tập (GPA).
* **Vấn đề:** Các ứng dụng rời rạc, không tập trung, thiếu tính tương tác trực tiếp trên tài liệu.
* **Giải pháp:** Xây dựng hệ thống UniStudy - nền tảng học tập tập trung, thông minh và dễ sử dụng dành riêng cho sinh viên IUH.

---

# SLIDE 3 — MỤC TIÊU HỆ THỐNG

* **Công nghệ:** FastAPI, ReactJS, PostgreSQL, Docker.
* **Chức năng chính:**
    * Quản lý tài liệu học tập (Xem PDF, Chia sẻ, Ghi chú trực tiếp).
    * Hệ thống tương tác: Đặt câu hỏi, thảo luận, Highlight tài liệu.
    * Công cụ học tập: Bài kiểm tra trắc nghiệm, Flashcard, Tính điểm GPA.
* **Nền tảng:** Web-based, Responsive, Hỗ trợ đa vai trò (Sinh viên/Giảng viên).

---

# SLIDE 4 — PHÂN CÔNG NHIỆM VỤ

* **Gia Thịnh:** Quản lý chung, Auth, Layout, Landing Page, Dashboard.
* **Anh:** Module Quản lý Tài liệu (Library, Upload, PDF Viewer, Share).
* **Nhật:** Module Tương tác & Thảo luận (Comments, Question, Highlights).
* **Khang:** Module Học tập (Tests, Flashcards, GPA Calculation).

---

# SLIDE 5 — KIẾN TRÚC HỆ THỐNG

* **Frontend:** React + Vite + Tailwind CSS + Zustand.
* **Backend:** FastAPI + SQLAlchemy + PostgreSQL.
* **DevOps:** GitHub Actions (CI/CD), Docker, Deploy on Render/Vercel.
* **Database:** PostgreSQL (Lưu trữ quan hệ User-Doc-Interaction).

---

# SLIDE 6 — DEMO SẢN PHẨM

* **Link Online:** https://research-and-study.onrender.com
* **Link Local:** `http://localhost:3000`
* **Health Check:** `http://localhost:8000/health`
* **Tài khoản Demo:** `student@iuh.edu.vn / 123456`

---

# SLIDE 7 — SỬ DỤNG AI & KIỂM THỬ

* **AI Tool:** ChatGPT, GitHub Copilot hỗ trợ viết Backend APIs và UI Components.
* **Kiểm thử:**
    * Unit Test: Pytest (Backend), Jest (Frontend).
    * System Test theo lộ trình: Landing -> Auth -> Management -> Interaction -> Quiz.
* **Tự động hóa:** CI/CD chạy test tự động khi push code lên GitHub.

---

# SLIDE 8 — TỔNG KẾT & HƯỚNG PHÁT TRIỂN

* **Kết quả:** Hoàn thành các tính năng MVP cốt lõi, hệ thống vận hành ổn định trên Render.
* **Hạn chế:** Chưa tích hợp AI sâu (tự động tóm tắt), chưa có thông báo thời gian thực.
* **Hướng phát triển:**
    * Tích hợp AI (Chat với tài liệu, tự động tạo câu hỏi ôn tập).
    * Mobile App (React Native).
    * Kết nối trực tiếp hệ thống quản lý học tập của trường.
