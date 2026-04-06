# HUONG DAN THUC THI MODULE QUAN LY TAI LIEU - Nguyen Tuan Anh

> Ban phien ban co dau de nop giang vien:
> [HUONG_DAN_THUC_THI_MODULE_QUAN_LY_TAI_LIEU_NGUYEN_TUAN_ANH_CO_DAU.md](HUONG_DAN_THUC_THI_MODULE_QUAN_LY_TAI_LIEU_NGUYEN_TUAN_ANH_CO_DAU.md)

## 1. Vai tro va muc tieu

Ban duoc phan cong module Quan ly Tai lieu trong ke hoach MVP, gom:
- Danh sach Tai lieu (thu vien + search/filter)
- Tai tai lieu len
- Chi tiet Tai lieu (tab Thong tin + PDF Viewer)
- Modal Chia se Tai lieu
- Backend Documents (CRUD, upload)
- Backend metadata va Document Shares

Muc tieu hoc thuat:
- Hoan thanh dung pham vi module theo ke hoach
- Co quy trinh thiet ke UX/UI va trien khai phan mem ro rang
- Co minh chung tien do theo tung buoc, co tieu chi danh gia

## 2. Hien trang codebase (da kiem tra)

Frontend:
- Da co trang danh sach mau tai [frontend/src/pages/DocumentsPage.tsx](frontend/src/pages/DocumentsPage.tsx)
- Trang nay hien tai dung du lieu mock, chua goi API that

Backend:
- Da co model [backend/app/models/document.py](backend/app/models/document.py)
- Da co model [backend/app/models/document_share.py](backend/app/models/document_share.py)
- Chua co route API cho documents/shares trong [backend/app/api/v1/routes](backend/app/api/v1/routes)

Nhan dinh:
- Ban can day manh 3 huong song song: UX/UI, API, tich hop FE-BE

## 3. Phuong phap lam viec chuyen nghiep

Nguyen tac 1: Product first
- Moi man hinh phai tra loi: nguoi dung la ai, lam duoc gi, thong tin nao quan trong

Nguyen tac 2: UX truoc, UI sau
- Chot user flow, empty state, error state truoc khi chau chuot mau sac

Nguyen tac 3: API contract ro rang
- Dinh nghia request/response schema truoc khi code UI call API

Nguyen tac 4: Do luong duoc
- Moi buoc deu co DoD (Definition of Done) va bang kiem

Nguyen tac 5: Bao cao hoc thuat
- Moi ngay ghi: muc tieu, viec da lam, ket qua, van de, buoc tiep theo

## 4. Lo trinh thuc thi theo giai doan

### Giai doan M1 - Nghien cuu va dinh nghia bai toan (0.5 ngay)

Viec can lam:
1. Phan tich users va use-cases cho module tai lieu
2. Dinh nghia user flow chinh
3. Chot danh sach API can co
4. Chot data model can dung tren UI

Y nghia:
- Tranh code vo huong va tranh sua giao dien nhieu lan

Ket qua dau ra:
- Tai lieu user flow
- Danh sach API va schema
- Backlog task co thu tu uu tien

DoD:
- Co it nhat 4 flow: xem danh sach, tim loc, upload, chia se

### Giai doan M2 - Backend core (1.5 ngay)

Viec can lam:
1. Tao schemas cho Document va DocumentShare
2. Tao routes:
- GET /documents
- GET /documents/{id}
- POST /documents (upload)
- PUT /documents/{id}
- DELETE /documents/{id}
- POST /documents/{id}/share
- GET /documents/{id}/shares
3. Them phan trang, tim kiem, filter theo mon hoc/loai
4. Kiem tra quyen:
- owner moi duoc sua/xoa
- chia se theo permission view/edit/comment

Y nghia:
- Dat nen du lieu va logic nghiep vu chuan

Ket qua dau ra:
- API docs cap nhat tren /docs
- Test API bang Swagger va Postman

DoD:
- Tat ca endpoint tra ma loi dung nguu canh (200/201/400/401/403/404)

### Giai doan M3 - Frontend UX/UI + tich hop API (2 ngay)

Viec can lam:
1. Danh sach tai lieu
- Search theo tieu de
- Filter theo mon hoc/loai tai lieu
- Sort (moi nhat)
- Empty state va loading skeleton
2. Upload tai lieu
- Form metadata
- Chon file
- Validate file type/file size
3. Chi tiet tai lieu
- Tab thong tin
- PDF viewer
4. Modal chia se
- Nhap user/email
- Chon permission
- Gui request share

Y nghia:
- Bien mock UI thanh san pham co the dung duoc that

Ket qua dau ra:
- Trang [frontend/src/pages/DocumentsPage.tsx](frontend/src/pages/DocumentsPage.tsx) call API that
- Them cac component tach nho de de bao tri

DoD:
- User dang nhap co the upload, xem, tim, loc, chia se tai lieu

### Giai doan M4 - Kiem thu, hoan thien va bao cao (1 ngay)

Viec can lam:
1. Unit/integration test muc co ban cho API documents
2. Automated E2E nghiep vu muc API (pytest + TestClient)
3. Sua bug va toi uu thong diep loi cho nguoi dung
4. Chuan hoa tai lieu nop mon

Y nghia:
- Dam bao module dat chat luong hoc thuat va de demo

Ket qua dau ra:
- Bien ban test
- Danh sach bug da fix
- Bao cao tong ket module

DoD:
- Luong TC chinh pass >= 95%, khong con bug critical

## 5. Ke hoach tien do de xac nhan dang di dung huong

Ngay 1:
- Hoan tat M1
- Bat dau M2 (schemas + list/create)

Ngay 2:
- Hoan tat M2 (share + authz + filter)
- Smoke test API

Ngay 3:
- Hoan tat M3 phan danh sach + upload

Ngay 4:
- Hoan tat M3 phan chi tiet + share modal
- Tich hop full frontend-backend

Ngay 5:
- M4 test, fix bug, chot tai lieu nop

## 6. Bang theo doi tien do (danh dau moi ngay)

- [x] M1.1 Xac dinh user flow
- [x] M1.2 Chot API contract
- [x] M2.1 CRUD document
- [x] M2.2 Upload file + metadata
- [x] M2.3 Share document + permission
- [x] M2.4 Search/filter/pagination
- [x] M3.1 Danh sach tai lieu goi API that
- [x] M3.2 Form upload + validate
- [x] M3.3 Chi tiet + PDF viewer
- [x] M3.4 Modal chia se
- [x] M4.1 Test backend
- [x] M4.2 Test E2E nghiep vu
- [x] M4.3 Chot bao cao hoc thuat (dong goi ban nop cuoi cung)

## 7. Chuan UX/UI cho module tai lieu

Muc tieu UX:
- Tim thay tai lieu duoi 3 thao tac
- Upload hoan tat duoi 60 giay voi user quen
- Loi hien thi de hieu, co huong dan cach sua

Tieu chuan UI can giu:
- Van ban tieng Viet nhat quan
- Khoang trang ro rang, uu tien kha nang doc
- Trang thai day du: loading, empty, error, success
- Thanh phan thao tac quan trong dat o vi tri de thay

Khai niem can xuat hien trong bao cao hoc thuat:
- Usability heuristics
- Information hierarchy
- Feedback loop cho user
- Error prevention va recovery

## 8. API contract de xuat (ban dau)

Document object:
- id, title, description, subject, file_type, file_url, is_public, uploader_id, created_at

Danh sach:
- query: q, subject, file_type, page, page_size, sort
- response: items, total, page, page_size

Share request:
- document_id, shared_with_user_id, permission

## 9. Mau bao cao moi buoc (ban copy dung hang ngay)

Muc tieu buoc:
- ...

Viec da lam:
- ...

Y nghia chuc nang:
- ...

Ket qua kiem thu:
- ...

Van de gap phai:
- ...

Huong xu ly:
- ...

Trang thai tien do:
- Hoan thanh: ...%
- Dung deadline: Co/Khong

Buoc tiep theo:
- ...

## 10. Danh sach deliverables de nop

- Tai lieu user flow + wireframe
- API list + schema
- Code backend documents/shares
- Code frontend pages/components module tai lieu
- Bien ban test
- Bao cao tong ket module cua Nguyen Tuan Anh

## 11. Huong dan ra quyet dinh nhanh khi bi ket

Neu loi do moi truong local (Python/psycopg2/pydantic):
- Uu tien Docker flow de tiep tuc tien do

Neu UI dep nhung khong dung:
- Uu tien fix UX va flow nghiep vu truoc

Neu API du nhung front chua kip:
- Dong bang scope, dam bao 4 flow core hoat dong truoc

## 12. Cam ket scope dung voi ke hoach nhom

Tat ca cong viec trong tai lieu nay giu dung pham vi phan cong cua ban Anh trong bang phan cong:
- Quan ly Tai lieu
- Upload
- Chi tiet tai lieu
- Chia se tai lieu
- Backend Documents + Document_Shares

Ban co the dung file nay lam suon bao cao tien do va checklist hoan thanh module theo dung quy trinh chuyen nghiep.

## 13. Cap nhat thuc thi (lan 2)

Da hoan thanh them cac hang muc theo yeu cau chuyen mon:

1. Tach UI thanh component nho, de cham va de bao tri:
- [frontend/src/components/documents/DocumentCard.tsx](frontend/src/components/documents/DocumentCard.tsx)
- [frontend/src/components/documents/UploadModal.tsx](frontend/src/components/documents/UploadModal.tsx)
- [frontend/src/components/documents/DetailModal.tsx](frontend/src/components/documents/DetailModal.tsx)
- [frontend/src/components/documents/ShareModal.tsx](frontend/src/components/documents/ShareModal.tsx)
- [frontend/src/pages/DocumentsPage.tsx](frontend/src/pages/DocumentsPage.tsx)
- DetailModal da co du tab "Thong tin" + "PDF Viewer" dung acceptance
- Trang danh sach da co pagination UI (Truoc/Sau + chi so trang)

2. Tang cuong rang buoc quyen truy cap backend:
- owner hoac user co permission=edit moi duoc update tai lieu
- non-owner khong duoc chia se tai lieu
- private document chi owner hoac user duoc share approved moi xem duoc
- File: [backend/app/api/v1/routes/documents.py](backend/app/api/v1/routes/documents.py)

3. Bo sung test case M4 va bien ban test nop mon:
- Test API: [backend/tests/test_documents_api.py](backend/tests/test_documents_api.py)
- Bien ban test M4: [BIEN_BAN_TEST_M4_DOCUMENTS_SHARE.md](BIEN_BAN_TEST_M4_DOCUMENTS_SHARE.md)
- Da bo sung test E2E nghiep vu muc API: upload -> share -> view -> cleanup

Ket qua hien tai:
- Backend tests: 8 passed
- Frontend: compiled successfully (docker)

## 14. Danh gia hien trang theo yeu cau "chuyen nghiep - sang tao - hoc thuat"

### 14.1. Tien do hien tai theo giai doan

| Giai doan | Trang thai | Ty le | Bang chung |
|---|---|---:|---|
| M1 - Phan tich bai toan | Hoan thanh | 100% | User flow, API contract trong tai lieu nay |
| M2 - Backend Documents/Share | Hoan thanh | 100% | [backend/app/api/v1/routes/documents.py](backend/app/api/v1/routes/documents.py), test pass |
| M3 - Frontend UX/UI + API that | Co ban hoan thanh | 90% | Component tach nho + page call API that |
| M4 - Kiem thu va bao cao | Hoan thanh | 100% | [backend/tests/test_documents_api.py](backend/tests/test_documents_api.py), [BIEN_BAN_TEST_M4_DOCUMENTS_SHARE.md](BIEN_BAN_TEST_M4_DOCUMENTS_SHARE.md), checklist nghiem thu |

Nhan xet tong quan:
- Ban dang di dung huong project va dung pham vi duoc giao.
- M4.3 da hoan tat voi day du bien ban test, checklist nghiem thu va demo script.

### 14.2. Da dap ung yeu cau dong vai chuyen nghiep den dau?

1. Chuyen nghiep:
- Da tach logic ro rang FE/BE/service/component.
- Da co ranh gioi trach nhiem tung phan (separation of concerns).
- Da co test va bien ban minh chung.

2. Sang tao:
- UI khong dung mau mock ban dau, da nang cap flow thuc te upload/share/detail.
- Da toi uu trang thai UX (loading/empty/error/success) cho thao tac quan trong.

3. Chuan hoc thuat:
- Co roadmap M1-M4, DoD, checklist, bien ban tien do, bien ban test.
- Co minh chung kiem thu lap lai duoc (pytest + TestClient).

Ket luan muc do dap ung hien tai:
- Chuyen nghiep: Dat
- Sang tao: Dat
- Chuan hoc thuat: Dat

## 15. Ban huong dan "tung giai doan" de ghi vao bao cao

### Giai doan M1
- Cach thuc lam:
	- Phan tich users, use-cases, user-flow truoc khi code.
	- Chot API contract va data model.
- Dau ra:
	- Danh sach flow nghiep vu + API contract ban dau.
- Y nghia:
	- Tranh code sai huong, giam sua doi ve sau.
- Nguyen nhan tai sao phai lam:
	- UX va nghiep vu la nen tang, khong the bo qua.

### Giai doan M2
- Cach thuc lam:
	- Xay route Documents/Share day du + rang buoc quyen.
	- Kiem thu tung endpoint theo ma trang thai.
- Dau ra:
	- CRUD + upload + share + list shares hoat dong.
	- API docs cap nhat, backend route chay duoc.
- Y nghia:
	- Hoan thanh cot song nghiep vu module tai lieu.
- Nguyen nhan tai sao phai lam:
	- Khong co backend dung thi frontend chi la giao dien gia lap.

### Giai doan M3
- Cach thuc lam:
	- Tach component nho (DocumentCard, UploadModal, ShareModal, DetailModal).
	- Goi API that thay du lieu mock.
	- Toi uu UX state va thong diep loi.
- Dau ra:
	- Trang tai lieu dung duoc trong thuc te voi luong upload/share/detail.
- Y nghia:
	- Tang kha nang bao tri, de cham, de review, de mo rong.
- Nguyen nhan tai sao phai lam:
	- Component architecture giup project chuyen nghiep va de cham diem ky thuat.

### Giai doan M4
- Cach thuc lam:
	- Viet test case nghiep vu va access-control.
	- Tong hop ket qua vao bien ban test.
	- Dong goi ho so nop mon.
- Dau ra:
	- Test code, ket qua pass, bien ban test, bao cao tong ket.
- Y nghia:
	- Chung minh tinh dung dan, tinh lap lai va chat luong san pham.
- Nguyen nhan tai sao phai lam:
	- Day la can cu hoc thuat de bao ve ket qua va diem so.

## 16. Chuan dau ra cuoi cung de "dung project, dung nhiem vu"

Ban nop duoc xem la dat neu co du cac nhom dau ra sau:

1. Dau ra ky thuat (bat buoc):
- Backend Documents/Share chay on dinh.
- Frontend module tai lieu goi API that, khong con mock flow chinh.

2. Dau ra UX/UI (bat buoc):
- Co day du loading/empty/error/success.
- Co upload/detail/share flow thong suot.

3. Dau ra kiem thu (bat buoc):
- Test case M4 + ket qua pass duoc ghi bien ban.

4. Dau ra hoc thuat (bat buoc):
- Co bien ban tien do, bien ban test, mo ta y nghia tung giai doan.
- Co doi chieu ro rang voi phan cong trong [ke_hoach.md](ke_hoach.md).

5. Dau ra trinh bay (khuyen nghi de duoc diem tot):
- Co slide/demo script ngan 5-7 phut: problem -> solution -> demo -> test evidence.

## 17. Ho so nop mon da dong goi (M4.3)

1. Bien ban tien do:
- [BIEN_BAN_TIEN_DO_LAN_1_MODULE_QUAN_LY_TAI_LIEU_NGUYEN_TUAN_ANH.md](BIEN_BAN_TIEN_DO_LAN_1_MODULE_QUAN_LY_TAI_LIEU_NGUYEN_TUAN_ANH.md)

2. Bien ban test M4:
- [BIEN_BAN_TEST_M4_DOCUMENTS_SHARE.md](BIEN_BAN_TEST_M4_DOCUMENTS_SHARE.md)

3. Checklist nghiem thu cuoi:
- [CHECKLIST_NGHIEM_THU_CUOI_MODULE_QUAN_LY_TAI_LIEU_NGUYEN_TUAN_ANH.md](CHECKLIST_NGHIEM_THU_CUOI_MODULE_QUAN_LY_TAI_LIEU_NGUYEN_TUAN_ANH.md)

4. Demo script 5-7 phut:
- [DEMO_SCRIPT_5_7_PHUT_MODULE_QUAN_LY_TAI_LIEU_NGUYEN_TUAN_ANH.md](DEMO_SCRIPT_5_7_PHUT_MODULE_QUAN_LY_TAI_LIEU_NGUYEN_TUAN_ANH.md)

Trang thai cuoi cung:
- Muc tieu module: DAT
- Pham vi phan cong: DAT
- San sang nop giang vien: DAT
