# BIEN BAN TEST M4 - MODULE DOCUMENTS/SHARE

## 1. Muc tieu kiem thu
- Xac nhan API Documents/Share hoat dong dung nghiep vu
- Xac nhan cac rang buoc quyen truy cap (public/private, owner/non-owner, edit permission)
- Tao minh chung test de nop mon theo tieu chi hoc thuat

## 2. Moi truong test
- Backend: FastAPI
- DB test: SQLite (test_documents.db)
- Framework test: pytest + FastAPI TestClient
- File test: [backend/tests/test_documents_api.py](backend/tests/test_documents_api.py)

## 3. Danh sach test case M4

1. TC-M4-01 - Guest chi thay tai lieu public
- Muc tieu: User khong dang nhap khong duoc thay tai lieu private
- Buoc chinh: Tao 1 public + 1 private, goi GET /documents voi guest
- Ky vong: Chi co public
- Ket qua: PASS

2. TC-M4-02 - Guest khong xem duoc detail tai lieu private
- Muc tieu: Chan truy cap detail private khi khong co quyen
- Buoc chinh: Tao private document, guest goi GET /documents/{id}
- Ky vong: 403
- Ket qua: PASS

3. TC-M4-03 - Chia se private tai lieu cho user dich
- Muc tieu: User duoc share co the thay tai lieu private
- Buoc chinh: Owner share theo email, viewer goi list/search
- Ky vong: Viewer thay duoc tai lieu da share
- Ket qua: PASS

4. TC-M4-04 - Update can owner hoac quyen edit
- Muc tieu: Nguoi co quyen comment khong duoc update; edit duoc update
- Buoc chinh:
  - Owner share permission=comment -> user comment update
  - Owner share permission=edit -> user edit update
- Ky vong:
  - comment update -> 403
  - edit update -> 200
- Ket qua: PASS

5. TC-M4-05 - Chi owner moi duoc chia se tai lieu
- Muc tieu: Nguoi khac (khong phai uploader) khong duoc share
- Buoc chinh: Non-owner goi POST /documents/{id}/share
- Ky vong: 403
- Ket qua: PASS

6. TC-M4-06 - Chi owner moi duoc xem danh sach chia se
- Muc tieu: User duoc share co the xem tai lieu nhung khong duoc xem toan bo share list
- Buoc chinh:
  - Owner share tai lieu cho viewer
  - Viewer goi GET /documents/{id}/shares
  - Owner goi GET /documents/{id}/shares
- Ky vong:
  - Viewer -> 403
  - Owner -> 200
- Ket qua: PASS

7. TC-M4-07 - Xoa tai lieu chi owner duoc xoa
- Muc tieu: User co permission edit khong duoc xoa tai lieu
- Buoc chinh:
  - Owner share permission=edit cho user khac
  - User edit goi DELETE /documents/{id}
  - Owner goi DELETE /documents/{id}
- Ky vong:
  - User edit -> 403
  - Owner -> 200, document khong con ton tai
- Ket qua: PASS

8. TC-M4-08 - E2E flow upload -> share -> view -> cleanup
- Muc tieu: Xac nhan luong nghiep vu chinh chay thong suot tu dau den cuoi
- Buoc chinh:
  - Owner upload private document
  - Viewer bi chan detail truoc khi duoc share
  - Owner share cho viewer va viewer xem duoc detail + search thay tai lieu
  - Owner xoa tai lieu de cleanup du lieu test
- Ky vong:
  - Truoc share: 403
  - Sau share: 200
  - Xoa boi owner: 200
- Ket qua: PASS

## 4. Tong ket ket qua
- Tong so test case: 8
- Pass: 8
- Fail: 0
- Ty le dat: 100%

## 5. Y nghia hoc thuat
- Chung minh tinh dung dan cua API contract
- Chung minh he thong co co che Access Control ro rang
- Co du lieu test lap lai duoc de danh gia va bao tri

## 6. Tep lien quan de nop
- Test code: [backend/tests/test_documents_api.py](backend/tests/test_documents_api.py)
- Backend route: [backend/app/api/v1/routes/documents.py](backend/app/api/v1/routes/documents.py)
- Bien ban tien do: [BIEN_BAN_TIEN_DO_LAN_1_MODULE_QUAN_LY_TAI_LIEU_NGUYEN_TUAN_ANH.md](BIEN_BAN_TIEN_DO_LAN_1_MODULE_QUAN_LY_TAI_LIEU_NGUYEN_TUAN_ANH.md)
