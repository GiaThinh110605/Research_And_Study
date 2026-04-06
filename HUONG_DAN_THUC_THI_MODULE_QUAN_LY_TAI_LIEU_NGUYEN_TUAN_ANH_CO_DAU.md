# HƯỚNG DẪN THỰC THI MODULE QUẢN LÝ TÀI LIỆU - Nguyễn Tuấn Anh

## 1. Vai trò và mục tiêu

Bạn được phân công module Quản lý Tài liệu trong kế hoạch MVP, gồm:
- Danh sách Tài liệu (thư viện + tìm kiếm/lọc)
- Tải tài liệu lên
- Chi tiết Tài liệu (tab Thông tin + PDF Viewer)
- Modal Chia sẻ Tài liệu
- Backend Documents (CRUD, upload)
- Backend metadata và Document Shares

Mục tiêu học thuật:
- Hoàn thành đúng phạm vi module theo kế hoạch
- Có quy trình thiết kế UX/UI và triển khai phần mềm rõ ràng
- Có minh chứng tiến độ theo từng bước, có tiêu chí đánh giá

## 2. Hiện trạng codebase (đã kiểm tra)

Frontend:
- Đã có trang danh sách mẫu tại [frontend/src/pages/DocumentsPage.tsx](frontend/src/pages/DocumentsPage.tsx)
- Trang này trước đó dùng dữ liệu mock, hiện đã gọi API thật

Backend:
- Đã có model [backend/app/models/document.py](backend/app/models/document.py)
- Đã có model [backend/app/models/document_share.py](backend/app/models/document_share.py)
- Đã bổ sung route API cho documents/shares trong [backend/app/api/v1/routes/documents.py](backend/app/api/v1/routes/documents.py)

Nhận định:
- Cần duy trì 3 hướng song song: UX/UI, API, tích hợp FE-BE

## 3. Phương pháp làm việc chuyên nghiệp

Nguyên tắc 1: Product first
- Mỗi màn hình phải trả lời: người dùng là ai, làm được gì, thông tin nào quan trọng

Nguyên tắc 2: UX trước, UI sau
- Chốt user flow, empty state, error state trước khi trau chuốt giao diện

Nguyên tắc 3: API contract rõ ràng
- Định nghĩa request/response schema trước khi code UI gọi API

Nguyên tắc 4: Đo lường được
- Mỗi bước đều có DoD (Definition of Done) và bảng kiểm

Nguyên tắc 5: Báo cáo học thuật
- Mỗi ngày ghi: mục tiêu, việc đã làm, kết quả, vấn đề, bước tiếp theo

## 4. Lộ trình thực thi theo giai đoạn

### Giai đoạn M1 - Nghiên cứu và định nghĩa bài toán (0.5 ngày)

Việc cần làm:
1. Phân tích users và use-cases cho module tài liệu
2. Định nghĩa user flow chính
3. Chốt danh sách API cần có
4. Chốt data model cần dùng trên UI

Ý nghĩa:
- Tránh code vô hướng và tránh sửa giao diện nhiều lần

Kết quả đầu ra:
- Tài liệu user flow
- Danh sách API và schema
- Backlog task có thứ tự ưu tiên

DoD:
- Có ít nhất 4 flow: xem danh sách, tìm lọc, upload, chia sẻ

Hướng dẫn test đầu ra (tự kiểm tra M1):
1. Kiểm tra đủ 4 flow trong tài liệu:
- Flow 1: xem danh sách
- Flow 2: tìm kiếm/lọc
- Flow 3: upload
- Flow 4: chia sẻ
2. Kiểm tra tính logic của từng flow:
- Mỗi flow phải có: điểm bắt đầu, thao tác chính, kết quả mong đợi, lỗi thường gặp.
3. Kiểm tra API contract có bám flow:
- Mỗi flow phải map được endpoint tương ứng trong backend.
4. Tiêu chí pass M1:
- Có thể giải thích rõ: "vì sao cần endpoint này" và "nếu endpoint lỗi thì flow nào hỏng".

Checklist pass/fail M1:
- Pass nếu: tài liệu giúp người khác trong nhóm đọc 5-10 phút là hiểu cách module vận hành.
- Fail nếu: chỉ liệt kê chức năng mà chưa mô tả đường đi dữ liệu và hành vi người dùng.

### Giai đoạn M2 - Backend core (1.5 ngày)

Việc cần làm:
1. Tạo schemas cho Document và DocumentShare
2. Tạo routes:
- GET /documents
- GET /documents/{id}
- POST /documents (upload)
- PUT /documents/{id}
- DELETE /documents/{id}
- POST /documents/{id}/share
- GET /documents/{id}/shares
3. Thêm phân trang, tìm kiếm, filter theo môn học/loại
4. Kiểm tra quyền:
- owner mới được sửa/xóa
- chia sẻ theo permission view/edit/comment

Ý nghĩa:
- Đặt nền dữ liệu và logic nghiệp vụ chuẩn

Kết quả đầu ra:
- API docs cập nhật trên /docs
- Test API bằng Swagger, Postman và pytest

DoD:
- Tất cả endpoint trả mã lỗi đúng ngữ cảnh (200/201/400/401/403/404)

Hướng dẫn test đầu ra (tự kiểm tra M2):
1. Test nhanh trên Swagger:
- Mở /docs và gọi lần lượt 7 endpoint documents/share.
2. Test quyền truy cập theo vai trò:
- Owner: sửa/xóa/share được.
- Non-owner: không được share.
- User được share với permission=view/comment/edit phải có hành vi đúng theo quyền.
3. Test dữ liệu đầu vào xấu:
- Upload sai định dạng file.
- Upload file quá kích thước.
- Request thiếu trường bắt buộc.
4. Test phân trang và tìm kiếm:
- Dùng q, subject, page, page_size để chắc chắn trả về đúng số lượng và thứ tự.
5. Chạy test tự động backend:

```bash
docker compose -f docker-compose.dev.yml exec -T backend sh -lc "python -m pytest tests/test_documents_api.py -q"
```

Kết quả mong đợi hiện tại: 8 passed.

Checklist pass/fail M2:
- Pass nếu: API trả mã đúng ngữ cảnh, quyền không bị hở, test backend pass.
- Fail nếu: user trái quyền vẫn sửa/xóa/share được hoặc dữ liệu private bị lộ.

### Giai đoạn M3 - Frontend UX/UI + tích hợp API (2 ngày)

Việc cần làm:
1. Danh sách tài liệu
- Search theo tiêu đề
- Filter theo môn học/loại tài liệu
- Sort (mới nhất)
- Empty state và loading skeleton
2. Upload tài liệu
- Form metadata
- Chọn file
- Validate file type/file size
3. Chi tiết tài liệu
- Tab thông tin
- PDF viewer
4. Modal chia sẻ
- Nhập user/email
- Chọn permission
- Gửi request share

Ý nghĩa:
- Biến mock UI thành sản phẩm có thể dùng được thật

Kết quả đầu ra:
- Trang [frontend/src/pages/DocumentsPage.tsx](frontend/src/pages/DocumentsPage.tsx) gọi API thật
- Tách component nhỏ để dễ bảo trì/chấm điểm

DoD:
- User đăng nhập có thể upload, xem, tìm, lọc, chia sẻ tài liệu

Hướng dẫn test đầu ra (tự kiểm tra M3):
1. Test luồng danh sách + tìm/lọc:
- Tìm từ khóa có kết quả và không có kết quả.
- Đổi bộ lọc môn học, kiểm tra dữ liệu thay đổi đúng.
- Bấm Trước/Sau để kiểm tra pagination UI và dữ liệu trang hiện tại.
2. Test luồng upload:
- Upload file hợp lệ: hiển thị thành công và tài liệu xuất hiện trong danh sách.
- Upload file sai định dạng hoặc quá dung lượng: hiển thị lỗi đúng.
3. Test chi tiết tài liệu:
- Mở modal chi tiết và kiểm tra đủ 2 tab: Thông tin, PDF Viewer.
- Với file không phải PDF: có nút mở tài liệu gốc.
4. Test chia sẻ:
- Chỉ owner thấy nút chia sẻ.
- Share thành công thì danh sách người được share cập nhật.
5. Build frontend để xác nhận không lỗi tích hợp:

```bash
docker compose -f docker-compose.dev.yml exec -T frontend npm run build
```

Checklist pass/fail M3:
- Pass nếu: người dùng có thể thực hiện trọn luồng upload -> xem chi tiết -> chia sẻ mà không bị nghẽn UI.
- Fail nếu: UI chỉ đẹp nhưng không gọi API thật hoặc trạng thái lỗi/loading không rõ ràng.

### Giai đoạn M4 - Kiểm thử, hoàn thiện và báo cáo (1 ngày)

Việc cần làm:
1. Unit/integration test cơ bản cho API documents
2. Automated E2E nghiệp vụ mức API (pytest + TestClient)
3. Sửa bug và tối ưu thông điệp lỗi cho người dùng
4. Chuẩn hóa tài liệu nộp môn

Ý nghĩa:
- Đảm bảo module đạt chất lượng học thuật và dễ demo

Kết quả đầu ra:
- Biên bản test
- Danh sách bug đã fix
- Báo cáo tổng kết module

DoD:
- Luồng TC chính pass >= 95%, không còn bug critical

Hướng dẫn test đầu ra (tự kiểm tra M4):
1. Đối chiếu code test và biên bản test:
- File test: [backend/tests/test_documents_api.py](backend/tests/test_documents_api.py)
- Biên bản: [BIEN_BAN_TEST_M4_DOCUMENTS_SHARE.md](BIEN_BAN_TEST_M4_DOCUMENTS_SHARE.md)
- Số test case trong biên bản phải khớp số test thực tế.
2. Chạy regression sau khi fix bug:

```bash
docker compose -f docker-compose.dev.yml exec -T backend sh -lc "python -m pytest tests/test_documents_api.py -q"
docker compose -f docker-compose.dev.yml exec -T frontend npm run build
```

3. Test nhanh luồng nghiệp vụ cuối:
- Guest chỉ thấy public.
- User được share mới xem được private.
- Chỉ owner mới xem danh sách shares và xóa tài liệu.
4. Chuẩn hóa báo cáo nộp môn:
- Bằng chứng test, ảnh/chứng cứ chạy lệnh, checklist nghiệm thu phải nhất quán.

Checklist pass/fail M4:
- Pass nếu: test tự động pass, build pass, tài liệu phản ánh đúng số liệu và đúng phạm vi phân công.
- Fail nếu: số liệu trong báo cáo khác kết quả chạy thực tế hoặc còn bug critical chưa xử lý.

## 5. Kế hoạch tiến độ để xác nhận đang đi đúng hướng

Ngày 1:
- Hoàn tất M1
- Bắt đầu M2 (schemas + list/create)

Ngày 2:
- Hoàn tất M2 (share + authz + filter)
- Smoke test API

Ngày 3:
- Hoàn tất M3 phần danh sách + upload

Ngày 4:
- Hoàn tất M3 phần chi tiết + share modal
- Tích hợp full frontend-backend

Ngày 5:
- M4 test, fix bug, chốt tài liệu nộp

## 6. Bảng theo dõi tiến độ (đánh dấu mỗi ngày)

- [x] M1.1 Xác định user flow
- [x] M1.2 Chốt API contract
- [x] M2.1 CRUD document
- [x] M2.2 Upload file + metadata
- [x] M2.3 Share document + permission
- [x] M2.4 Search/filter/pagination
- [x] M3.1 Danh sách tài liệu gọi API thật
- [x] M3.2 Form upload + validate
- [x] M3.3 Chi tiết + PDF viewer
- [x] M3.4 Modal chia sẻ
- [x] M4.1 Test backend
- [x] M4.2 Test E2E nghiệp vụ
- [x] M4.3 Chốt báo cáo học thuật (đóng gói bản nộp cuối cùng)

## 7. Chuẩn UX/UI cho module tài liệu

Mục tiêu UX:
- Tìm thấy tài liệu dưới 3 thao tác
- Upload hoàn tất dưới 60 giây với user quen
- Lỗi hiển thị dễ hiểu, có hướng dẫn cách sửa

Tiêu chuẩn UI cần giữ:
- Văn bản tiếng Việt nhất quán
- Khoảng trắng rõ ràng, ưu tiên khả năng đọc
- Trạng thái đầy đủ: loading, empty, error, success
- Thành phần thao tác quan trọng đặt ở vị trí dễ thấy

Khái niệm cần xuất hiện trong báo cáo học thuật:
- Usability heuristics
- Information hierarchy
- Feedback loop cho user
- Error prevention và recovery

## 8. API contract đề xuất (ban đầu)

Document object:
- id, title, description, subject, file_type, file_url, is_public, uploader_id, created_at

Danh sách:
- query: q, subject, file_type, page, page_size, sort
- response: items, total, page, page_size

Share request:
- document_id, shared_with_user_id/shared_with_email, permission

## 9. Mẫu báo cáo mỗi bước (copy dùng hằng ngày)

Mục tiêu bước:
- ...

Việc đã làm:
- ...

Ý nghĩa chức năng:
- ...

Kết quả kiểm thử:
- ...

Vấn đề gặp phải:
- ...

Hướng xử lý:
- ...

Trạng thái tiến độ:
- Hoàn thành: ...%
- Đúng deadline: Có/Không

Bước tiếp theo:
- ...

## 10. Danh sách deliverables để nộp

- Tài liệu user flow + wireframe
- API list + schema
- Code backend documents/shares
- Code frontend pages/components module tài liệu
- Biên bản test
- Báo cáo tổng kết module của Nguyễn Tuấn Anh

## 11. Hướng dẫn ra quyết định nhanh khi bị kẹt

Nếu lỗi do môi trường local (Python/psycopg2/pydantic):
- Ưu tiên Docker flow để tiếp tục tiến độ

Nếu UI đẹp nhưng chưa đúng:
- Ưu tiên fix UX và flow nghiệp vụ trước

Nếu API đủ nhưng front chưa kịp:
- Đóng băng scope, đảm bảo 4 flow core hoạt động trước

## 12. Cam kết scope đúng với kế hoạch nhóm

Tất cả công việc trong tài liệu này giữ đúng phạm vi phân công của bạn Anh trong bảng phân công:
- Quản lý Tài liệu
- Upload
- Chi tiết tài liệu
- Chia sẻ tài liệu
- Backend Documents + Document_Shares

## 13. Cập nhật thực thi (lần 2)

Đã hoàn thành thêm các hạng mục theo yêu cầu chuyên môn:

1. Tách UI thành component nhỏ, dễ chấm và dễ bảo trì:
- [frontend/src/components/documents/DocumentCard.tsx](frontend/src/components/documents/DocumentCard.tsx)
- [frontend/src/components/documents/UploadModal.tsx](frontend/src/components/documents/UploadModal.tsx)
- [frontend/src/components/documents/DetailModal.tsx](frontend/src/components/documents/DetailModal.tsx)
- [frontend/src/components/documents/ShareModal.tsx](frontend/src/components/documents/ShareModal.tsx)
- [frontend/src/pages/DocumentsPage.tsx](frontend/src/pages/DocumentsPage.tsx)
- DetailModal đã có đủ tab "Thông tin" + "PDF Viewer" đúng acceptance
- Trang danh sách đã có pagination UI (Trước/Sau + chỉ số trang)

2. Tăng cường ràng buộc quyền truy cập backend:
- owner hoặc user có permission=edit mới được update tài liệu
- non-owner không được chia sẻ tài liệu
- private document chỉ owner hoặc user được share approved mới xem được
- File: [backend/app/api/v1/routes/documents.py](backend/app/api/v1/routes/documents.py)

3. Bổ sung test case M4 và biên bản test nộp môn:
- Test API: [backend/tests/test_documents_api.py](backend/tests/test_documents_api.py)
- Biên bản test M4: [BIEN_BAN_TEST_M4_DOCUMENTS_SHARE.md](BIEN_BAN_TEST_M4_DOCUMENTS_SHARE.md)
- Đã bổ sung test E2E nghiệp vụ mức API: upload -> share -> view -> cleanup

Kết quả hiện tại:
- Backend tests: 8 passed
- Frontend: compiled successfully (docker)

## 14. Đánh giá hiện trạng theo yêu cầu "chuyên nghiệp - sáng tạo - học thuật"

### 14.1. Tiến độ hiện tại theo giai đoạn

| Giai đoạn | Trạng thái | Tỷ lệ | Bằng chứng |
|---|---|---:|---|
| M1 - Phân tích bài toán | Hoàn thành | 100% | User flow, API contract trong tài liệu này |
| M2 - Backend Documents/Share | Hoàn thành | 100% | [backend/app/api/v1/routes/documents.py](backend/app/api/v1/routes/documents.py), test pass |
| M3 - Frontend UX/UI + API thật | Cơ bản hoàn thành | 90% | Component tách nhỏ + page call API thật |
| M4 - Kiểm thử và báo cáo | Hoàn thành | 100% | [backend/tests/test_documents_api.py](backend/tests/test_documents_api.py), [BIEN_BAN_TEST_M4_DOCUMENTS_SHARE.md](BIEN_BAN_TEST_M4_DOCUMENTS_SHARE.md), checklist nghiệm thu |

Nhận xét tổng quan:
- Đang đi đúng hướng project và đúng phạm vi được giao.
- M4.3 đã hoàn tất với đầy đủ biên bản test, checklist nghiệm thu và demo script.

### 14.2. Đã đáp ứng yêu cầu đóng vai chuyên nghiệp đến đâu?

1. Chuyên nghiệp:
- Tách logic rõ ràng FE/BE/service/component.
- Có ranh giới trách nhiệm từng phần (separation of concerns).
- Có test và biên bản minh chứng.

2. Sáng tạo:
- UI đã nâng cấp flow thực tế upload/share/detail thay vì mock tĩnh.
- Tối ưu trạng thái UX cho thao tác quan trọng.

3. Chuẩn học thuật:
- Có roadmap M1-M4, DoD, checklist, biên bản tiến độ, biên bản test.
- Có minh chứng kiểm thử lặp lại được (pytest + TestClient).

Kết luận mức độ đáp ứng hiện tại:
- Chuyên nghiệp: Đạt
- Sáng tạo: Đạt
- Chuẩn học thuật: Đạt

## 15. Bản hướng dẫn "từng giai đoạn" để ghi vào báo cáo

### Giai đoạn M1
- Cách thức làm:
  - Phân tích users, use-cases, user-flow trước khi code.
  - Chốt API contract và data model.
- Đầu ra:
  - Danh sách flow nghiệp vụ + API contract ban đầu.
- Ý nghĩa:
  - Tránh code sai hướng, giảm sửa đổi về sau.
- Nguyên nhân tại sao phải làm:
  - UX và nghiệp vụ là nền tảng, không thể bỏ qua.

### Giai đoạn M2
- Cách thức làm:
  - Xây route Documents/Share đầy đủ + ràng buộc quyền.
  - Kiểm thử từng endpoint theo mã trạng thái.
- Đầu ra:
  - CRUD + upload + share + list shares hoạt động.
  - API docs cập nhật, backend route chạy được.
- Ý nghĩa:
  - Hoàn thành cột sống nghiệp vụ module tài liệu.
- Nguyên nhân tại sao phải làm:
  - Không có backend đúng thì frontend chỉ là giao diện giả lập.

### Giai đoạn M3
- Cách thức làm:
  - Tách component nhỏ (DocumentCard, UploadModal, ShareModal, DetailModal).
  - Gọi API thật thay dữ liệu mock.
  - Tối ưu UX state và thông điệp lỗi.
- Đầu ra:
  - Trang tài liệu dùng được trong thực tế với luồng upload/share/detail.
- Ý nghĩa:
  - Tăng khả năng bảo trì, dễ chấm, dễ review, dễ mở rộng.
- Nguyên nhân tại sao phải làm:
  - Component architecture giúp project chuyên nghiệp và dễ chấm điểm kỹ thuật.

### Giai đoạn M4
- Cách thức làm:
  - Viết test case nghiệp vụ và access-control.
  - Tổng hợp kết quả vào biên bản test.
  - Đóng gói hồ sơ nộp môn.
- Đầu ra:
  - Test code, kết quả pass, biên bản test, báo cáo tổng kết.
- Ý nghĩa:
  - Chứng minh tính đúng đắn, tính lặp lại và chất lượng sản phẩm.
- Nguyên nhân tại sao phải làm:
  - Đây là căn cứ học thuật để bảo vệ kết quả và điểm số.

## 16. Chuẩn đầu ra cuối cùng để "đúng project, đúng nhiệm vụ"

Bản nộp được xem là đạt nếu có đủ các nhóm đầu ra sau:

1. Đầu ra kỹ thuật (bắt buộc):
- Backend Documents/Share chạy ổn định.
- Frontend module tài liệu gọi API thật, không còn mock flow chính.

2. Đầu ra UX/UI (bắt buộc):
- Có đầy đủ loading/empty/error/success.
- Có upload/detail/share flow thông suốt.

3. Đầu ra kiểm thử (bắt buộc):
- Test case M4 + kết quả pass được ghi biên bản.

4. Đầu ra học thuật (bắt buộc):
- Có biên bản tiến độ, biên bản test, mô tả ý nghĩa từng giai đoạn.
- Có đối chiếu rõ ràng với phân công trong [ke_hoach.md](ke_hoach.md).

5. Đầu ra trình bày (khuyến nghị để đạt điểm tốt):
- Có slide/demo script ngắn 5-7 phút: problem -> solution -> demo -> test evidence.

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
