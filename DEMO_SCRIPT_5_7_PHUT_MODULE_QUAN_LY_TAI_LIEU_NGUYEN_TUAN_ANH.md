# DEMO SCRIPT 5-7 PHUT - MODULE QUAN LY TAI LIEU (NGUYEN TUAN ANH)

## 1. Mo dau (30-45 giay)
- Gioi thieu vai tro: phu trach module Quan ly Tai lieu
- Muc tieu module: giup nguoi dung tim, tai len, xem va chia se tai lieu hoc tap
- Pham vi theo phan cong: Documents + Document_Shares (frontend + backend)

## 2. Demo chuc nang chinh (3-4 phut)

### Buoc 1 - Danh sach tai lieu
- Mo trang /tai-lieu
- Trinh bay search/filter theo mon hoc
- Neu khong co du lieu: empty state

### Buoc 2 - Tai tai lieu
- Bam nut "Tai tai lieu"
- Nhap title, description, subject, chon file
- Trinh bay validate file type/file size
- Sau khi tai len: card xuat hien trong danh sach

### Buoc 3 - Chi tiet tai lieu
- Bam "Chi tiet"
- Neu la PDF: hien PDF viewer
- Neu khong phai PDF: mo file bang link tai lieu

### Buoc 4 - Chia se tai lieu
- Bam "Chia se tai lieu"
- Nhap email, chon permission (view/comment/edit)
- Gui loi moi va hien danh sach da chia se

## 3. Demo rang buoc quyen (1-1.5 phut)
- Non-owner khong duoc share tai lieu
- User permission=comment khong duoc update
- User permission=edit duoc update
- Chi owner duoc xem danh sach share list

## 4. Minh chung kiem thu (45-60 giay)
- Mo file test: backend/tests/test_documents_api.py
- Neu ket qua test: 8 passed
- Mo bien ban test: BIEN_BAN_TEST_M4_DOCUMENTS_SHARE.md

## 5. Ket luan (30 giay)
- Module da hoan thanh dung pham vi ke hoach
- Dap ung chuyen nghiep (kien truc ro), sang tao (UX flow thuc te), hoc thuat (co test va bien ban)
- San sang tich hop voi cac module con lai trong MVP
