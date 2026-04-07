import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ShareModal from '../components/documents/ShareModal';
import { authService } from '../services/auth';
import { documentService, DocumentItem, ShareItem } from '../services/documents';

type DetailTab = 'info' | 'questions' | 'discussion' | 'highlight';

const aiTools = [
  {
    id: 'summary',
    title: 'Tóm tắt AI',
    description: 'Phân tích và tóm tắt các ý chính của tài liệu trong 30 giây.',
  },
  {
    id: 'mindmap',
    title: 'Sơ đồ tư duy',
    description: 'Tạo mindmap trực quan dựa trên cấu trúc chương bài giảng.',
  },
  {
    id: 'flashcard',
    title: 'Flashcard',
    description: 'Tự động tạo bộ thẻ ghi nhớ các công thức và định lý.',
  },
  {
    id: 'highlight',
    title: 'Highlight thông minh',
    description: 'Tự động đánh dấu từ khóa và khái niệm quan trọng.',
  },
];

const DocumentDetailPage: React.FC = () => {
  const { documentId } = useParams();
  const parsedId = Number(documentId);
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const [activeTab, setActiveTab] = useState<DetailTab>('info');
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareTargetEmail, setShareTargetEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit' | 'comment'>('view');
  const [shareItems, setShareItems] = useState<ShareItem[]>([]);
  const [shareError, setShareError] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editError, setEditError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [aiResult, setAiResult] = useState('Chọn một công cụ AI để tạo kết quả học tập nhanh.');
  const [discussionInput, setDiscussionInput] = useState('');

  const isOwner = Boolean(document && currentUserId && document.uploader_id === currentUserId);

  const resolveFileUrl = (fileUrl: string) => {
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    return `${apiBaseUrl}${fileUrl}`;
  };

  const fileUrl = document ? resolveFileUrl(document.file_url) : '';

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const me = await authService.getCurrentUser();
        setCurrentUserId(me.id ?? null);
      } catch {
        setCurrentUserId(null);
      }
    };

    const loadDocument = async () => {
      if (!Number.isFinite(parsedId)) {
        setError('Mã tài liệu không hợp lệ.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const detail = await documentService.detail(parsedId);
        setDocument(detail);
        setEditTitle(detail.title);
        setEditSubject(detail.subject || '');
        setEditDescription(detail.description || '');
        setEditIsPublic(detail.is_public);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Không thể tải chi tiết tài liệu.');
        setDocument(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
    loadDocument();
  }, [parsedId]);

  const openShare = async () => {
    if (!document) return;

    setShareError('');
    setShareItems([]);
    setIsShareOpen(true);

    try {
      const shares = await documentService.listShares(document.id);
      setShareItems(shares);
    } catch (err: any) {
      setShareError(err.response?.data?.detail || 'Không thể tải danh sách chia sẻ.');
    }
  };

  const handleShare = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!document) return;

    if (!shareTargetEmail.trim()) {
      setShareError('Vui lòng nhập email người nhận.');
      return;
    }

    setIsSharing(true);
    setShareError('');
    try {
      await documentService.share(document.id, {
        shared_with_email: shareTargetEmail.trim(),
        permission: sharePermission,
      });
      setShareTargetEmail('');
      const shares = await documentService.listShares(document.id);
      setShareItems(shares);
    } catch (err: any) {
      setShareError(err.response?.data?.detail || 'Chia sẻ tài liệu thất bại.');
    } finally {
      setIsSharing(false);
    }
  };

  const closeShareModal = () => {
    setIsShareOpen(false);
    setShareError('');
    setShareTargetEmail('');
    setSharePermission('view');
    setShareItems([]);
  };

  const handleUpdateDocument = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!document) return;

    if (!editTitle.trim()) {
      setEditError('Tiêu đề không được để trống.');
      return;
    }

    setIsUpdating(true);
    setEditError('');
    try {
      const updated = await documentService.update(document.id, {
        title: editTitle.trim(),
        subject: editSubject.trim() || undefined,
        description: editDescription.trim(),
        is_public: editIsPublic,
      });
      setDocument(updated);
      setIsEditOpen(false);
    } catch (err: any) {
      setEditError(err.response?.data?.detail || 'Không thể cập nhật tài liệu.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateAi = (toolId: string) => {
    if (!document) return;

    if (toolId === 'summary') {
      setAiResult(`Tóm tắt nhanh: ${document.title}. Tài liệu thuộc ${document.subject || 'chuyên đề tổng hợp'}, tập trung vào kiến thức cốt lõi và có thể học trong 3-5 ý chính.`);
      return;
    }

    if (toolId === 'mindmap') {
      setAiResult(`Sơ đồ tư duy đề xuất:\n1) Tổng quan ${document.subject || 'môn học'}\n2) Khái niệm nền tảng\n3) Công thức và ví dụ ứng dụng\n4) Bài tập tự luyện theo mức độ.`);
      return;
    }

    if (toolId === 'flashcard') {
      setAiResult(`Flashcard mẫu:\n- Q: Khái niệm trung tâm của tài liệu là gì?\n  A: ${document.subject || 'Kiến thức chuyên ngành'}\n- Q: Khi nào áp dụng công thức chính?\n  A: Khi dữ liệu thỏa điều kiện trong ví dụ.`);
      return;
    }

    setAiResult(`Highlight thông minh:\n- Từ khóa 1: ${document.subject || 'Chủ đề chính'}\n- Từ khóa 2: Định nghĩa trọng tâm\n- Từ khóa 3: Mô hình áp dụng\n- Từ khóa 4: Bài tập minh họa.`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F7FE]">
        <div className="rounded-xl bg-white px-6 py-4 text-slate-600 shadow">Đang tải chi tiết tài liệu...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F7FE]">
        <div className="rounded-xl border border-red-200 bg-white px-6 py-4 text-red-600 shadow">{error || 'Không tìm thấy tài liệu.'}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F4F7FE] font-sans text-slate-900">
      <aside className="w-[88px] bg-white border-r flex flex-col items-center py-5 gap-4 shrink-0">
        <Link to="/tai-lieu" className="h-10 w-10 rounded-xl bg-[#3B66F5] text-white flex items-center justify-center font-bold">U</Link>
        <Link to="/tai-lieu" className="h-10 w-10 rounded-xl bg-blue-50 text-[#3B66F5] flex items-center justify-center">📚</Link>
        <div className="h-10 w-10 rounded-xl text-slate-400 flex items-center justify-center">🏠</div>
        <div className="h-10 w-10 rounded-xl text-slate-400 flex items-center justify-center">📝</div>
        <div className="h-10 w-10 rounded-xl text-slate-400 flex items-center justify-center">📣</div>
        <div className="mt-auto h-10 w-10 rounded-xl text-slate-400 flex items-center justify-center">❔</div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 bg-white border-b px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6 text-sm font-semibold text-slate-500">
            <Link to="/dashboard" className="hover:text-slate-900">Trang chủ</Link>
            <Link to="/tai-lieu" className="text-[#3B66F5]">Thư viện</Link>
            <Link to="/dashboard" className="hover:text-slate-900">Bài kiểm tra</Link>
          </div>

          <div className="relative w-[320px]">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input placeholder="Tìm kiếm tài liệu..." className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm outline-none focus:border-[#3B66F5]" />
          </div>

          <div className="flex items-center gap-4">
            <button className="text-slate-400">🔔</button>
            <button className="text-slate-400">⚙️</button>
            <div className="h-8 w-8 rounded-full bg-blue-100" />
          </div>
        </div>

        <div className="h-[72px] bg-white border-b px-6 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-black text-slate-900">{document.title}</h1>
            <p className="text-xs text-slate-500">Cập nhật {new Date(document.created_at).toLocaleDateString('vi-VN')} • {document.file_type}</p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={openShare} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Chia sẻ</button>
            {isOwner && (
              <button onClick={() => setIsEditOpen(true)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Chỉnh sửa</button>
            )}
            <a href={fileUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-[#3B66F5] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Tải về</a>
          </div>
        </div>

        <div className="h-12 bg-white border-b px-6 flex items-center gap-8 text-sm font-semibold text-slate-500 shrink-0">
          <button onClick={() => setActiveTab('info')} className={activeTab === 'info' ? 'text-[#3B66F5]' : 'hover:text-slate-800'}>Thông tin</button>
          <button onClick={() => setActiveTab('questions')} className={activeTab === 'questions' ? 'text-[#3B66F5]' : 'hover:text-slate-800'}>Đặt câu hỏi</button>
          <button onClick={() => setActiveTab('discussion')} className={activeTab === 'discussion' ? 'text-[#3B66F5]' : 'hover:text-slate-800'}>Thảo luận</button>
          <button onClick={() => setActiveTab('highlight')} className={activeTab === 'highlight' ? 'text-[#3B66F5]' : 'hover:text-slate-800'}>Highlight</button>
        </div>

        <div className="flex-1 overflow-hidden grid grid-cols-1 xl:grid-cols-12">
          <section className="xl:col-span-9 h-full overflow-y-auto p-6">
            {activeTab === 'info' && (
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                {document.file_type.toUpperCase() === 'PDF' ? (
                  <iframe title="PDF Viewer" src={fileUrl} className="h-[580px] w-full rounded-xl border border-slate-100" />
                ) : (
                  <div className="h-[420px] rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-center px-8">
                    <div>
                      <p className="text-lg font-bold text-slate-700">Tài liệu không phải PDF</p>
                      <p className="mt-2 text-sm text-slate-500">Hệ thống vẫn hỗ trợ tải về và đọc bằng ứng dụng tương ứng.</p>
                      <a href={fileUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-lg bg-[#3B66F5] px-4 py-2 text-sm font-semibold text-white">Mở tài liệu gốc</a>
                    </div>
                  </div>
                )}

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs uppercase text-slate-400">Môn học</p>
                    <p className="font-semibold text-slate-800">{document.subject || 'Chưa phân loại'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs uppercase text-slate-400">Người đăng</p>
                    <p className="font-semibold text-slate-800">{document.uploader_name || 'Người dùng UniStudy'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 md:col-span-2">
                    <p className="text-xs uppercase text-slate-400">Mô tả</p>
                    <p className="font-medium text-slate-700">{document.description || 'Không có mô tả.'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Đặt câu hỏi về tài liệu</h3>
                <p className="mt-1 text-sm text-slate-500">Tính năng giúp tạo câu hỏi ôn tập và lưu lịch sử học theo tài liệu.</p>
                <textarea
                  rows={4}
                  value={discussionInput}
                  onChange={(event) => setDiscussionInput(event.target.value)}
                  placeholder="Ví dụ: Chương này có những công thức trọng tâm nào?"
                  className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#3B66F5]"
                />
                <button
                  type="button"
                  onClick={() => setAiResult(discussionInput ? `Trả lời nhanh: ${discussionInput} -> Hãy bắt đầu từ phần định nghĩa và ví dụ minh họa trong tài liệu.` : aiResult)}
                  className="mt-3 rounded-lg bg-[#3B66F5] px-4 py-2 text-sm font-semibold text-white"
                >
                  Gửi câu hỏi
                </button>
              </div>
            )}

            {activeTab === 'discussion' && (
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Thảo luận lớp học</h3>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Bạn Linh: Mình đề xuất ôn mục 2 và 3 trước khi làm bài tập cuối chương.</div>
                  <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Bạn Hùng: Có ai có sơ đồ mindmap cho chương này chưa?</div>
                </div>
                <input className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm" placeholder="Nhập bình luận..." />
              </div>
            )}

            {activeTab === 'highlight' && (
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Highlight thông minh</h3>
                <p className="mt-1 text-sm text-slate-500">Tự động đánh dấu nội dung quan trọng để ôn thi nhanh.</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Định nghĩa trọng tâm: Khái niệm và điều kiện áp dụng công thức chính.</div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">Ví dụ thực hành: Các bài toán mẫu ở phần giữa tài liệu.</div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Gợi ý ôn tập: Tổng hợp 5 câu hỏi tự kiểm tra cuối chương.</div>
                </div>
              </div>
            )}
          </section>

          <aside className="xl:col-span-3 border-l border-slate-100 bg-white h-full overflow-y-auto p-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#3B66F5]">Công cụ AI</h3>

            <div className="mt-4 space-y-3">
              {aiTools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => handleGenerateAi(tool.id)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-blue-300 hover:bg-blue-50"
                >
                  <p className="text-sm font-bold text-slate-900">{tool.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{tool.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase text-slate-500">Kết quả AI</p>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-700 font-sans">{aiResult}</pre>
            </div>

            <div className="mt-4 flex gap-2">
              <input
                placeholder="Đặt câu hỏi về tài liệu này..."
                value={discussionInput}
                onChange={(event) => setDiscussionInput(event.target.value)}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setAiResult(discussionInput ? `Trả lời trợ lý học tập: ${discussionInput}` : aiResult)}
                className="rounded-lg bg-[#3B66F5] px-3 py-2 text-sm font-semibold text-white"
              >
                ➤
              </button>
            </div>

            <p className="mt-3 text-[11px] text-emerald-600">• AI đang trực tuyến - UniGPT v4.0</p>
          </aside>
        </div>
      </main>

      <ShareModal
        isOpen={isShareOpen}
        document={document}
        shareTargetEmail={shareTargetEmail}
        sharePermission={sharePermission}
        shareItems={shareItems}
        shareError={shareError}
        isSharing={isSharing}
        onClose={closeShareModal}
        onSubmit={handleShare}
        onChangeShareTargetEmail={setShareTargetEmail}
        onChangeSharePermission={setSharePermission}
      />

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">Chỉnh sửa tài liệu</h3>
            <form onSubmit={handleUpdateDocument} className="mt-4 space-y-3">
              <input
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2"
                placeholder="Tiêu đề"
              />
              <input
                value={editSubject}
                onChange={(event) => setEditSubject(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2"
                placeholder="Môn học"
              />
              <textarea
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2"
                rows={4}
                placeholder="Mô tả"
              />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={editIsPublic} onChange={(event) => setEditIsPublic(event.target.checked)} />
                Cho phép công khai tài liệu
              </label>

              {editError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{editError}</div>}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsEditOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Hủy</button>
                <button type="submit" disabled={isUpdating} className="rounded-lg bg-[#3B66F5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  {isUpdating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetailPage;
