# UC07 - UI/UX MVP (Learning Interface)

## Mục tiêu học thuật
- Chuyển từ "đọc tài liệu tĩnh" sang "tương tác học tập có hỗ trợ AI".
- Tối ưu hóa nhận thức: tóm tắt, hỏi đáp, quiz và ghi chú được gắn vào từng đoạn nội dung cụ thể.

## Phạm vi Backend (Cần triển khai)
- **Highlights**: API tạo (POST), danh sách (GET), cập nhật (PUT), xóa (DELETE) highlight cho từng tài liệu.
- **Questions**: API lưu câu hỏi và câu trả lời.
- **AI Q&A**: API `POST` hỏi AI theo đoạn văn bôi đen (ngữ cảnh từ highlight).
- **AI Summary & Quiz**: Đã triển khai ở UC06, tích hợp API hiện có.

## Phạm vi Frontend (Giao diện 3 vùng)
1. **Nội dung chính (Center)**: Trình xem PDF (PDF viewer) hoặc chế độ đọc Text trích xuất (Text Reader) để hỗ trợ tính năng bôi đen.
2. **Sidebar cấu trúc (Left)**: Outline tự động sinh từ tóm tắt AI để định hướng đọc, kèm theo danh sách các Highlight đã lưu.
3. **AI Panel (Right)**: Các tabs (Tóm tắt, Hỏi đáp, Quiz, Flashcards, Thảo luận).

## Quick Actions (Thao tác nhanh)
Khi người dùng bôi đen (select text) trong chế độ đọc:
- **Hỏi AI theo đoạn**: Chọn đoạn highlight -> Bấm hỏi AI -> Tự động chuyển đoạn văn thành ngữ cảnh cho AI Q&A.
- **Tạo flashcard**: Tự động lấy đoạn bôi đen làm mặt trước flashcard (hoặc nhờ AI chuyển đổi thành flashcard).
- **Lưu Highlight**: Lưu đoạn văn, chọn màu sắc, thêm ghi chú cá nhân.

## Data flow (Luồng dữ liệu)
- **Upload -> Ingestion**: Summary và Quiz đã sẵn sàng từ bước upload.
- **Vào trang Chi tiết**: Tự động load summary -> Sinh outline cấu trúc bên sidebar trái.
- **Highlight**: Bôi đen -> Lưu vào Database -> Có thể được gọi lên làm Context (ngữ cảnh) cho AI.
- **AI Q&A**: Nhận câu hỏi từ user + ngữ cảnh (nội dung highlight) -> Gọi Gemini AI -> Trả về câu trả lời.

## Kịch bản Demo (Demo Flow)
1. Upload 1 file PDF/TXT (qua UC06).
2. Mở trang Chi tiết tài liệu, quan sát giao diện 3 vùng (Outline bên trái, Nội dung ở giữa, AI Panel bên phải).
3. Bôi đen một đoạn văn bản (tạo Highlight) và chọn "Hỏi AI theo đoạn".
4. Mở tab Hỏi đáp ở AI Panel, quan sát AI trả lời dựa trên đoạn vừa bôi đen.
5. Mở tab Quiz để làm bài kiểm tra theo nội dung tài liệu.

## Metric đo lường hiệu quả (KPIs)
- **Avg session duration**: Thời gian trung bình của một phiên học trên trang chi tiết.
- **Highlight per session**: Số lượng highlight được tạo trong một phiên.
- **AI interaction rate**: Tỷ lệ người dùng có sử dụng tính năng "Hỏi AI" hoặc "Tạo Flashcard" từ highlight.
