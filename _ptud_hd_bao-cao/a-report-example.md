# BÁO CÁO ĐỒ ÁN

## PHÁT TRIỂN ỨNG DỤNG WEB

### Hệ thống To-Do List Multi User

---

# 1. GIỚI THIỆU ĐỀ TÀI

## 1.1 Mô tả bài toán

Việc quản lý công việc cá nhân thường được thực hiện bằng ghi chú thủ công hoặc các ứng dụng offline, gây khó khăn trong việc truy cập trên nhiều thiết bị và chia sẻ giữa nhiều người dùng. Ngoài ra, nhiều ứng dụng đơn giản không hỗ trợ quản lý nhiều user riêng biệt.

Hệ thống To-Do List Multi User được xây dựng nhằm cung cấp ứng dụng web cho phép nhiều người dùng quản lý danh sách công việc cá nhân. Mỗi người dùng có tài khoản riêng và chỉ xem được dữ liệu của mình.

---

## 1.2 Mục tiêu hệ thống

* Xây dựng hệ thống quản lý To-Do dạng web
* Hỗ trợ nhiều người dùng (multi-user)
* Chức năng CRUD task
* Login / logout
* Lưu dữ liệu bằng SQLite
* Backend FastAPI
* Frontend ReactJS
* Deploy hệ thống

---

## 1.3 Phạm vi hệ thống

### Bao gồm

* Đăng ký tài khoản
* Đăng nhập
* Thêm task
* Sửa task
* Xóa task
* Đánh dấu hoàn thành
* Mỗi user quản lý task riêng

### Không bao gồm

* Chia sẻ task giữa user
* Mobile app
* Notification email
* OAuth login

---

# 2. PHÂN TÍCH YÊU CẦU HỆ THỐNG

## 2.1 Actors

* Guest
* User

---

## 2.2 Danh sách Use Case

| ID   | Use Case Name  | Actors | Description         |
| ---- | -------------- | ------ | ------------------- |
| UC01 | Register       | Guest  | đăng ký tài khoản   |
| UC02 | Login          | User   | đăng nhập hệ thống  |
| UC03 | Logout         | User   | đăng xuất           |
| UC04 | Create task    | User   | thêm task           |
| UC05 | Update task    | User   | sửa task            |
| UC06 | Delete task    | User   | xóa task            |
| UC07 | View task list | User   | xem danh sách task  |
| UC08 | Mark complete  | User   | đánh dấu hoàn thành |

---

## 2.3 Use Case Diagram

Actors:

* Guest
* User

Guest:

* register
* login

User:

* CRUD task
* mark complete
* logout

---

## 2.4 Đặc tả Use Case

### UC04 — Create Task

Actors: User

Description: User tạo task mới

Pre-condition:
User đã login

Post-condition:
Task được lưu database

Main Flow:

1 User nhập title
2 User nhập description
3 User chọn status
4 User click Add
5 Frontend gọi API
6 Backend lưu database
7 System trả response
8 UI cập nhật danh sách

Alternative Flow:

3a Title rỗng
4a hiển thị lỗi validation

---

# 3. THIẾT KẾ HỆ THỐNG

## 3.1 System Architecture

React Frontend
↓
FastAPI Backend
↓
SQLite Database

REST API communication

---

## 3.2 Database Design

### Tables

users

| Field    | Type   |
| -------- | ------ |
| id       | int    |
| username | string |
| password | string |

tasks

| Field       | Type   |
| ----------- | ------ |
| id          | int    |
| title       | string |
| description | string |
| completed   | bool   |
| user_id     | int    |

Relationship:

users 1 — n tasks

---

## 3.3 UI Design

Pages:

* Login page
* Register page
* Task list page
* Add task modal

---

# 4. TRIỂN KHAI HỆ THỐNG

## 4.1 Môi trường phát triển

Frontend: ReactJS
Backend: FastAPI
Database: SQLite
Tools: VSCode, Postman

---

## 4.2 Cấu trúc hệ thống

Backend

```
app/
 ├── main.py
 ├── models.py
 ├── database.py
 ├── schemas.py
 ├── routers/
```

Frontend

```
src/
 components/
 pages/
 services/
```

---

## 4.3 Chức năng đã triển khai

* Register
* Login
* Logout
* Create task
* Update task
* Delete task
* Mark complete
* Multi user isolation

---

## 4.4 API thiết kế

### Auth

| Method | API       | Description |
| ------ | --------- | ----------- |
| POST   | /register | tạo user    |
| POST   | /login    | login       |

### Task

| Method | API         | Description |
| ------ | ----------- | ----------- |
| GET    | /tasks      | list task   |
| POST   | /tasks      | create      |
| PUT    | /tasks/{id} | update      |
| DELETE | /tasks/{id} | delete      |

---

## 4.5 Giao diện đã triển khai

* Login page
* Register page
* Task list
* Add task
* Edit task

---

## 4.6 Luồng hoạt động hệ thống

Ví dụ: Create task

1 User nhập task
2 React gửi POST /tasks
3 FastAPI nhận request
4 kiểm tra token
5 lưu SQLite
6 trả JSON
7 React update UI

---

# 5. TEST CASE

| ID   | Use Case   | Input      | Expected Output  | Result |
| ---- | ---------- | ---------- | ---------------- | ------ |
| TC01 | register   | hợp lệ     | tạo user         | pass   |
| TC02 | login      | đúng       | login ok         | pass   |
| TC03 | login      | sai        | error            | pass   |
| TC04 | add task   | hợp lệ     | thêm task        | pass   |
| TC05 | delete     | id tồn tại | xóa ok           | pass   |
| TC06 | multi user | user2      | không thấy user1 | pass   |

---

# 6. DEMO HỆ THỐNG

Demo link:
[http://localhost:3000](http://localhost:3000)

User:
user1 / 123456

Admin:
không có

---

# 7. SỬ DỤNG AI TRONG ĐỒ ÁN

| AI Tool | Mục đích sử dụng      |
| ------- | --------------------- |
| ChatGPT | generate FastAPI CRUD |
| Copilot | autocomplete code     |
| ChatGPT | viết React component  |

---

## Prompt sử dụng

"create todo CRUD using FastAPI with sqlite"

---

## Đánh giá AI

AI giúp:

* tạo CRUD nhanh
* generate schema

AI sai:

* lỗi async
* sai relationship

Chỉnh sửa:

* sửa query
* thêm validation

---

# 8. PHÂN CÔNG NHÓM

| Member | Task     |
| ------ | -------- |
| A      | frontend |
| B      | backend  |
| C      | database |
| D      | testing  |

---

# 9. KẾT LUẬN

Hệ thống đã xây dựng thành công To-Do List multi user sử dụng React và FastAPI. Người dùng có thể quản lý task cá nhân. Hệ thống hoạt động ổn định với SQLite.

Hướng phát triển:

* pagination
* deadline
* notification
* deploy cloud

---

# 10. TÀI LIỆU THAM KHẢO

[1] FastAPI Documentation — [https://fastapi.tiangolo.com](https://fastapi.tiangolo.com)
[2] React Documentation — [https://react.dev](https://react.dev)
[3] SQLite Documentation — [https://sqlite.org](https://sqlite.org)
[4] ChatGPT — [https://chat.openai.com](https://chat.openai.com)
