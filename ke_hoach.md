# 📌 TEAM PLAN – Research And Study

## 👥 Team Members
- Thịnh (Leader - Fullstack + Architecture)
- Nhật (Frontend + UI/UX)
- Khang (Backend + Database)
- Anh (Testing + Integration + Support FE/BE)

---

# 🎯 MỤC TIÊU
- Hoàn thành MVP trước: 12/04/2026
- Đảm bảo:
  - Code chạy ổn định
  - Có test
  - Có UI đầy đủ (16 pages)
  - Có API đầy đủ theo schema

---

# 🧠 NGUYÊN TẮC CHIA VIỆC
- Mỗi người đều:
  - Có frontend
  - Có backend
  - Có testing
- Không ai chỉ làm 1 phần
- Chia theo **feature**, không chia theo tech

---

# 🧩 CHIA THEO MODULE (MVP)

## 1. AUTH + USER + DASHBOARD
👤 Thịnh

### Backend
- Auth API (register, login)
- JWT / session
- User profile
- Role (student, lecturer)

### Frontend
- Login page
- Register page
- Dashboard (basic)

### Testing
- Unit test auth
- Test login flow
- Security basic (JWT, invalid login)

---

## 2. DOCUMENT MODULE
👤 Khang

### Backend
- Upload document
- Get document
- Document detail
- Share document

### DB liên quan
- documents
- document_shares

### Frontend
- Upload UI
- Document list
- Document detail view

### Testing
- Upload file test
- Permission test
- API test

---

## 3. STUDY FEATURES (FLASHCARD + HIGHLIGHT + GPA)
👤 Nhật

### Backend
- Flashcard CRUD
- Highlight
- GPA calculator

### DB
- flashcards
- highlights
- users (gpa)

### Frontend
- Flashcard UI (flip card)
- Highlight UI (PDF)
- GPA calculator page

### Testing
- Logic GPA
- Flashcard CRUD
- Highlight lưu đúng

---

## 4. TEST + DISCUSSION + RESULT
👤 Anh

### Backend
- Create test
- Submit test
- Result
- Discussion

### DB
- tests
- test_results
- discussions

### Frontend
- Test UI
- Submit bài
- Result view
- Comment section

### Testing
- Submit test
- Score calculation
- Discussion flow

---

# 🎨 FRONTEND (16 PAGES) – CHIA CỤ THỂ

## Thịnh
- Login
- Register
- Dashboard
- Profile

## Nhật
- Flashcard page
- GPA page
- Highlight UI
- Study tools

## Khang
- Upload document
- Document list
- Document detail

## Anh
- Test page
- Result page
- Discussion UI
- Share UI

---

# ⚙️ BACKEND – CHIA API

## Thịnh
- /auth/*
- /users/*
- middleware auth

## Khang
- /documents/*
- /shares/*

## Nhật
- /flashcards/*
- /highlights/*
- /gpa

## Anh
- /tests/*
- /results/*
- /discussions/*

---

# 🧪 TESTING PLAN (PHÂN CÔNG)

## Thịnh
- Auth test
- Security test

## Nhật
- UI test (UX)
- Flashcard test

## Khang
- API test document
- DB consistency

## Anh
- End-to-end test
- Integration test

---

# 🔄 WORKFLOW

## Git Branch
- main
- dev
- feature/*

## Rule
- Mỗi feature = 1 branch
- Pull request phải có:
  - code
  - test
  - demo

---

# 📅 TIMELINE

## Week 1
- Setup project
- Auth + DB

## Week 2
- Document + Flashcard

## Week 3
- Test + GPA + Highlight

## Week 4
- Fix bug + Testing + Deploy

---

# 🚀 MVP CHECKLIST

- [ ] Login/Register
- [ ] Upload document
- [ ] View document
- [ ] Flashcard
- [ ] Highlight
- [ ] Test system
- [ ] GPA calculator
- [ ] Basic dashboard

---

# 📌 LƯU Ý QUAN TRỌNG

- Không làm AI ở MVP
- Không làm feature thừa
- Ưu tiên chạy được end-to-end

---

# 🔥 STRATEGY

- Làm nhanh → chạy được → fix sau
- Luôn test ngay khi code xong
- Mỗi ngày phải có progress

---

# 📊 BONUS (NÊN CÓ)

- Docker (Thịnh)
- CI/CD Github Action (Thịnh + Anh)
- Logging (Khang)
- UI đẹp (Nhật)

---

# ✅ DONE CRITERIA

- 95% test pass
- Không crash
- Demo được full flow:
  - Login → Upload → Study → Test → Result