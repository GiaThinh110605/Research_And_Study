# KẾ HOẠCH PHÁT TRIỂN FRONTEND & BACKEND CHO MVP
**Thời hạn hoàn thành MVP: 12/04/2026**

## 1. Thông tin chung
- **Thành viên**: 4 người (Thịnh - Nhóm trưởng, Anh, Nhật, Khang)
- **Tech stack dự kiến**:
  - **Frontend**: React.js + Axios + Zustand + react-pdf
  - **Backend**: FastApi (base đã có) + Multer (upload file) + JWT + PostgreSQL
- Mỗi thành viên chịu trách nhiệm **toàn bộ một module** (Frontend pages + Backend APIs tương ứng).  
  **Tất cả tên trang và component trên Frontend đều phải dùng tiếng Việt** (theo thiết kế UI đã cung cấp).
- Thịnh đã làm base backend → tập trung review, tích hợp và module Auth + Trang chủ.

## 2. Phân công công việc chi tiết (đã chuyển hết sang tiếng Việt)

| STT | Thành viên       | Module                              | Frontend Pages (tiếng Việt)                                                                 | Backend APIs & Logic                                      | Deadline nội bộ |
|-----|------------------|-------------------------------------|---------------------------------------------------------------------------------------------|-----------------------------------------------------------|-----------------|
| 1   | **Thịnh**        | **Xác thực + Trang chủ + Core**     | - Đăng nhập<br>- Đăng ký<br>- Trang chủ Sinh viên<br>- Trang chủ Giảng viên                | - Auth (đăng nhập/đăng ký/vai trò)<br>- Thông tin người dùng<br>- Dashboard APIs (tài liệu gần đây, bài test đang làm, thống kê giảng viên)<br>- Middleware kiểm tra vai trò | 05/04/2026     |
| 2   | **Anh**          | **Quản lý Tài liệu**                | - Danh sách Tài liệu (Thư viện + Tìm kiếm/Lọc)<br>- Tải tài liệu lên<br>- Chi tiết Tài liệu (tab Thông tin + Trình xem PDF) | - Documents CRUD<br>- Upload file (Multer + lưu file_url)<br>- Metadata tài liệu<br>- Chia sẻ tài liệu (Document_Shares + quyền) | 08/04/2026     |
| 3   | **Nhật**         | **Tương tác Học tập**               | - Chi tiết Tài liệu (tab Đặt câu hỏi, Thảo luận, Highlight)<br>- Component Highlight trong PDF | - Questions (đặt câu hỏi cơ bản)<br>- Discussions (bình luận + trả lời)<br>- Highlights (lưu theo trang, màu, ghi chú) | 08/04/2026     |
| 4   | **Khang**        | **Kiểm tra & Công cụ**              | - Danh sách Bài kiểm tra + Làm bài kiểm tra + Kết quả bài kiểm tra<br>- Học Flashcard (Tạo + Chế độ học)<br>- Tính GPA cá nhân | - Tests + Test_Results<br>- Flashcards (CRUD + chế độ học)<br>- Logic tính GPA (hệ 10 ↔ 4.0 + lịch sử) | 08/04/2026     |

### Ghi chú phân công:
- Tất cả giao diện (button, label, modal, toast…) **phải ghi bằng tiếng Việt** theo đúng thiết kế screenshot (không dùng tiếng Anh).
- Các component chung (Thanh điều hướng, Sidebar, Protected Route, Toast thông báo, Loading spinner) → **Thịnh** làm trước và share cho cả nhóm.
- Code phát triển trên **branch riêng** (`feature/module-tên-thành-viên`), sau đó tạo Pull Request merge vào `dev`.

## 3. Lịch trình thực hiện (2 tuần)

### Tuần 1 (29/03/2026 – 05/04/2026)
- Hoàn thiện Đăng nhập, Đăng ký, Trang chủ Sinh viên & Trang chủ Giảng viên
- Xây dựng Danh sách Tài liệu + Tải tài liệu lên
- Setup Trình xem PDF + Component Highlight
- Daily meeting: 14:00 (Discord/Telegram)

### Tuần 2 (06/04/2026 – 12/04/2026)
- Hoàn thiện Chi tiết Tài liệu (tab Đặt câu hỏi, Thảo luận, Highlight)
- Làm Bài kiểm tra, Kết quả bài kiểm tra, Học Flashcard, Tính GPA cá nhân
- Testing + Sửa lỗi
- Deploy lên Staging (Vercel / Render / Railway)
- Hoàn thiện MVP & chạy đầy đủ test case

## 4. Testing Plan cho MVP (tóm tắt)
- **Unit Testing**: Jest (Frontend), Jest/Pytest (Backend)
- **Integration Testing**: Upload → lưu DB → hiển thị Trang chủ
- **System Testing**: Theo Use Case
  - TC01: Đăng ký → Đăng nhập → Tải tài liệu lên → Xem Chi tiết Tài liệu → Highlight → Đặt câu hỏi
  - TC02: Làm bài kiểm tra → Nộp bài → Xem Kết quả bài kiểm tra
  - TC03: Tính GPA (hệ 10 → hệ 4.0) → Lưu lịch sử
- **Usability Testing**: Mời 5–10 sinh viên/giảng viên thực tế (từ Singapore) thử nghiệm
- **Tiêu chí hoàn thành**: ≥ 95% test case pass, không bug critical/high, ≥ 80% feedback tích cực

## 5. Chức năng MVP (nhắc lại – chỉ tập trung MVP)
- Đăng nhập / Đăng ký (Sinh viên, Giảng viên; Admin dùng tài khoản mặc định)
- Tải tài liệu lên (PDF)
- Xem Chi tiết Tài liệu (trình xem PDF + đặt câu hỏi cơ bản + Thảo luận)
- Làm bài kiểm tra trắc nghiệm + xem kết quả ngay
- Tạo & Học Flashcard (thủ công)
- Highlight nội dung trong PDF
- Tính điểm GPA cá nhân (hệ 10 và 4.0)
- Chia sẻ tài liệu
- Trang chủ cơ bản theo vai trò

---

**Hướng dẫn sử dụng file này:**
1. Copy toàn bộ nội dung trên
2. Tạo file mới `PLAN_MVP.md`
3. Paste và lưu
4. Mở bằng VS Code hoặc Typora để xem đẹp

File đã được **kiểm tra kỹ**:
- Tất cả tên trang đều chuyển sang tiếng Việt theo đúng thiết kế screenshot bạn cung cấp.
- Phân công đều, không thay đổi workload.
- Giữ nguyên phạm vi MVP (không thêm Bảng xếp hạng, Admin đầy đủ, Tạo đề thi nâng cao… vì thuộc phase sau).

Bạn muốn thêm **danh sách API endpoints chi tiết** theo module không? Hoặc template commit message? Cứ nói tôi chỉnh ngay! 🚀
