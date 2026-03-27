# KẾ HOẠCH PHÁT TRIỂN FRONTEND & BACKEND CHO MVP
**Thời hạn hoàn thành MVP: 12/04/2026**

## 1. Thông tin chung
- **Thành viên**: 4 người (Thịnh - Nhóm trưởng, Anh, Nhật, Khang)
- **Tech stack dự kiến**:
  - **Frontend**: React.js + Vite + Tailwind CSS + React Router + Axios + Zustand + react-pdf
  - **Backend**: Fastapi (base đã có) + JWT + PostgreSQL
- Mỗi thành viên chịu trách nhiệm **toàn bộ một module** (Frontend pages + Backend APIs tương ứng)
- Thịnh đã làm base backend → sẽ tập trung review, tích hợp và module Auth + Dashboard

## 2. Phân công công việc chi tiết

| STT | Thành viên       | Module                              | Frontend Pages                                                                 | Backend APIs & Logic                                      | Deadline nội bộ |
|-----|------------------|-------------------------------------|--------------------------------------------------------------------------------|-----------------------------------------------------------|-----------------|
| 1   | **Thịnh**        | **Auth + Dashboard + Core**         | - Login<br>- Register<br>- Dashboard (Student & Lecturer)                      | - Auth (login/register/role)<br>- User profile<br>- Dashboard APIs (recent documents, ongoing tests, lecturer stats)<br>- Role-based middleware | 05/04/2026     |
| 2   | **Anh**          | **Document Management**             | - Documents List (Library + Search/Filter)<br>- Upload Document<br>- Document Detail (tab Info + PDF Viewer) | - Documents CRUD<br>- Upload file (Multer + lưu file_url)<br>- Document metadata<br>- Document_Shares (chia sẻ + permission) | 08/04/2026     |
| 3   | **Nhật**         | **Interactive Study**               | - Document Detail (tab Q&A, Comments, Highlights)<br>- Highlight component trong PDF | - Questions (hỏi đáp cơ bản)<br>- Discussions (comment + reply)<br>- Highlights (lưu theo page, color, note) | 08/04/2026     |
| 4   | **Khang**        | **Assessment & Tools**              | - Tests (List Tests + Take Test + Result)<br>- Flashcards (Create + Study Mode)<br>- GPA Calculator | - Tests + Test_Results<br>- Flashcards (CRUD + study)<br>- GPA logic (tính điểm hệ 10 ↔ 4.0 + lưu lịch sử) | 08/04/2026     |

### Ghi chú phân công:
- Mỗi người làm **đều** về số lượng pages và bảng database.
- Các component chung (Navbar, Sidebar, ProtectedRoute, Toast notification, Loading spinner) → **Thịnh** làm trước và share cho cả nhóm.
- Tất cả code phát triển trên **branch riêng** (`feature/module-tên-thành-viên`), sau đó tạo Pull Request merge vào `dev`.

## 3. Lịch trình thực hiện (2 tuần)

### Tuần 1 (29/03/2026 – 05/04/2026)
- Hoàn thiện Auth + Dashboard
- Xây dựng Documents List + Upload Document
- Setup PDF Viewer + Highlight component cơ bản
- Daily meeting: 14:00 (Discord/Telegram)

### Tuần 2 (06/04/2026 – 12/04/2026)
- Hoàn thiện Document Detail (Q&A, Comments, Highlights)
- Làm Tests, Flashcards, GPA Calculator
- Testing + Fix bug
- Deploy lên Staging (Vercel / Render / Railway)
- Hoàn thiện MVP & chạy test case

## 4. Testing Plan cho MVP (tóm tắt)
- **Unit Testing**: Jest (Frontend), Jest/Pytest (Backend)
- **Integration Testing**: Upload → lưu DB → hiển thị
- **System Testing**: Theo Use Case
  - TC01: Đăng ký → Đăng nhập → Upload → Xem chi tiết → Highlight → Đặt câu hỏi
  - TC02: Làm test → Submit → Xem kết quả
  - TC03: Tính GPA (hệ 10 → hệ 4.0) → Lưu lịch sử
- **Usability Testing**: Mời 5–10 sinh viên/giảng viên thử (từ Singapore)
- **Tiêu chí hoàn thành**: ≥ 95% test case pass, không bug critical/high, ≥ 80% feedback tích cực

## 5. Chức năng MVP (nhắc lại)
- Đăng ký / Đăng nhập (Student, Lecturer; Admin dùng tài khoản mặc định)
- Upload tài liệu (PDF)
- Xem chi tiết tài liệu (PDF viewer + hỏi đáp cơ bản + comment)
- Làm bài test trắc nghiệm + xem kết quả
- Tạo & học Flashcard (thủ công)
- Highlight trong PDF
- Tính điểm GPA cá nhân (hệ 10 và 4.0)
- Chia sẻ tài liệu
- Dashboard cơ bản theo role

---

**Hướng dẫn sử dụng file này:**
1. Copy toàn bộ nội dung trên
2. Tạo file mới `PLAN_MVP.md`
3. Paste và lưu
4. Có thể mở bằng VS Code hoặc Typora để xem đẹp hơn

Bạn muốn tôi bổ sung thêm phần nào không?
- Danh sách API endpoints chi tiết theo module?
- Template Git branch & commit message?
- Checklist task chi tiết hơn cho từng người?
- Hoặc bảng tiến độ hàng ngày?

Cứ nói tôi sẽ chỉnh và đưa phiên bản mới ngay.
