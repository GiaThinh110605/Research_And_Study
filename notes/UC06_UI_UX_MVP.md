# UC06 UI/UX MVP (Việt Nam)

## Mục tiêu
Biến tài liệu vừa upload thành một **pipeline học tập tự động** có thể quan sát, có tiến trình, và có kết quả cụ thể để người học thao tác tiếp. Đây là khởi nguồn của AI Study Loop.

## Phạm vi UC06
- Upload tài liệu (PDF, DOCX, PPTX, XLSX, TXT).
- Khởi động ingestion pipeline (chunking, trích xuất khái niệm, tóm tắt, quiz).
- Theo dõi trạng thái theo thời gian thực (real-time progress).
- Hiển thị kết quả học thuật: tóm tắt, khái niệm được phân loại, và quiz trắc nghiệm.

## Luồng chính (Primary Flow)
1. Người dùng tải tài liệu từ trang Upload.
2. Hệ thống lưu file + metadata, tự động chuyển đến trang Chi tiết kèm đếm ngược.
3. Pipeline chạy ngầm: `chunking` -> `concepts` -> `summary` -> `quiz`.
4. Trang Chi tiết cập nhật trạng thái pipeline và kết quả thông qua polling.
5. Người dùng có thể bắt đầu làm quiz, xem flashcard, hoặc tải tài liệu khác.

## Màn hình Upload
### Thành phần chính
- Ô kéo thả file + nhận dạng định dạng (badge PDF/DOC/PPT/XLS/TXT).
- Form nhập metadata: tiêu đề, môn học, mô tả, quyền riêng tư.
- Thanh thông báo “Đang tải lên” + thanh tiến trình upload thực (real progress).
- Thẻ “AI Study Loop” hiển thị 5 bước pipeline với hiệu ứng mô phỏng.

### Trạng thái
- **Idle**: Gợi ý kéo thả file hoặc chọn tệp.
- **Uploading**: Hiển thị % tiến trình tải lên với hiệu ứng mượt mà.
- **Success**: Thông báo thành công và đếm ngược chuyển trang.
- **Error**: Hiển thị lý do lỗi rõ ràng (ví dụ: file quá lớn, lỗi mạng) với biểu tượng.

## Màn hình Chi tiết tài liệu (Pipeline View)
### Thành phần chính
- **Pipeline card**: Thanh tiến trình (progress bar) + số lượng chunk/concept/quiz.
- **Stepper 5 bước**: Tải lên, Chia đoạn, Khái niệm, Tóm tắt, Quiz (với pulse animation).
- Nút “Khởi động lại Pipeline” khi trạng thái `failed`.
- Tóm tắt học thuật (hiển thị dạng bullet points).
- Danh sách khái niệm theo nhóm (basic/advanced/applied) với tag màu sắc.
- Thẻ thông báo Quiz đã sẵn sàng + nút Bắt đầu (CTA).

### Trạng thái UX
- **Queued/Processing**: Skeleton loading cho tóm tắt và khái niệm, spinner đồng bộ.
- **Completed**: Hiển thị đầy đủ kết quả, icon checkmark xanh.
- **Failed**: Hiển thị thông báo lỗi chi tiết, thanh tiến trình màu đỏ + nút retry.

## Ngôn ngữ và microcopy
- Văn phong học thuật, chính xác, ngắn gọn.
- Tập trung vào mục tiêu, phương pháp, kết quả.
- Hỗ trợ tiếng Việt có dấu đầy đủ trong mọi thông báo.

## Tiêu chí thành công (Acceptance Criteria)
- Thời gian từ upload đến tóm tắt < 60 giây với file text nhỏ.
- Có >= 30% người dùng bấm vào CTA quiz sau khi hoàn tất.
- Thanh tiến trình thực hiển thị đúng % thay vì thanh giả lập.
- Nút retry hoạt động mượt mà không cần refresh trang.

## Ghi chú kỹ thuật
- Pipeline event-driven (chạy bất đồng bộ qua `BackgroundTasks`).
- Lưu tiến trình chi tiết vào model `document_ingestions`.
- **Summary & Quiz**: Ưu tiên sử dụng Gemini AI để tạo nội dung chất lượng cao.
- **Concept Extraction**: Sử dụng Gemini AI phân loại khái niệm (kèm fallback TF).
- **Frontend polling**: Tự động gọi API `/ingestion` mỗi 5s khi đang `processing`.

## Người dùng mục tiêu
- **Sinh viên**: Muốn có tóm tắt nhanh, khái niệm rõ ràng, và quiz để ôn tập ngay lập tức.
- **Giảng viên**: Muốn kiểm tra chất lượng tài liệu và sinh bộ câu hỏi trắc nghiệm tự động.

## User stories
- Là sinh viên, tôi muốn tải tài liệu và thấy tiến trình xử lý chi tiết để biết hệ thống đang làm gì.
- Là sinh viên, tôi muốn có tóm tắt học thuật để đọc nhanh trước khi ôn tập sâu.
- Là sinh viên, tôi muốn mở quiz ngay khi hệ thống hoàn tất để kiểm tra kiến thức.
- Là giảng viên, tôi muốn chạy lại (retry) pipeline nếu việc trích xuất tự động bị lỗi.

## Trạng thái (State machine)
- `queued` -> `processing` -> `completed`
- `processing` -> `failed`
- `failed` -> `retry` -> `processing`

## Edge cases
- File rỗng/không đọc được chữ: Hiện lỗi “Không thể trích xuất nội dung từ tài liệu”.
- File quá lớn (HTTP 413): Thông báo giới hạn dung lượng 10MB rõ ràng.
- Mất API Key Gemini: Fallback về giải thuật TextRank (cho tóm tắt) và TF (cho concept).
