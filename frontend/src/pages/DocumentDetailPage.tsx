import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ShareModal from '../components/documents/ShareModal';
import { authService } from '../services/auth';
import { documentService, DocumentItem, ShareItem } from '../services/documents';
import api from '../services/api';

interface DiscussionUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

interface DiscussionItem {
  id: number;
  content: string;
  created_at: string;
  user: DiscussionUser | null;
  replies?: DiscussionItem[];
}

interface QuestionItem {
  id: number;
  document_id: number;
  content: string;
  answer: string | null;
  created_at: string;
  user: DiscussionUser | null;
}

interface HighlightItem {
  id: number;
  page_number: number;
  text_content: string;
  color: string;
  note: string;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function getInitials(name: string) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
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
  const [discussionInput, setDiscussionInput] = useState(''); // Used in right sidebar AI

  // States for discussions (Thảo luận)
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [discLoading, setDiscLoading] = useState(false);

  // States for questions (Đặt câu hỏi)
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [answeringTo, setAnsweringTo] = useState<number | null>(null);
  const [answerContent, setAnswerContent] = useState('');

  // States for highlights
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [highLoading, setHighLoading] = useState(false);
  const [highPage, setHighPage] = useState(1);
  const [highText, setHighText] = useState('');
  const [highColor, setHighColor] = useState('yellow');
  const [highNote, setHighNote] = useState('');

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

  const fetchDiscussions = async (docId: number) => {
    setDiscLoading(true);
    try {
      const res = await api.get(`/api/v1/discussions/?document_id=${docId}`);
      setDiscussions(res.data);
    } catch (err) {
      console.error('Lỗi tải thảo luận:', err);
    } finally {
      setDiscLoading(false);
    }
  };

  const fetchQuestions = async (docId: number) => {
    setQuestionsLoading(true);
    try {
      const res = await api.get(`/api/v1/questions/?document_id=${docId}`);
      setQuestions(res.data);
    } catch (err) {
      console.error('Lỗi tải câu hỏi:', err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const fetchHighlights = async (docId: number) => {
    setHighLoading(true);
    try {
      const res = await api.get(`/api/v1/highlights/?document_id=${docId}`);
      setHighlights(res.data);
    } catch {
      console.error('Lỗi tải highlights');
    } finally {
      setHighLoading(false);
    }
  };

  useEffect(() => {
    if (parsedId) {
      if (activeTab === 'discussion') {
        fetchDiscussions(parsedId);
      } else if (activeTab === 'questions') {
        fetchQuestions(parsedId);
      } else if (activeTab === 'highlight') {
        fetchHighlights(parsedId);
      }
    }
  }, [parsedId, activeTab]);

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

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    if (!currentUserId) {
      alert('Vui lòng đăng nhập để bình luận.'); return;
    }

    try {
      await api.post('/api/v1/discussions/', {
        document_id: parsedId,
        content: newComment.trim(),
        parent_id: 0,
      });
      setNewComment('');
      await fetchDiscussions(parsedId);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gửi thất bại.');
    }
  };

  const handleReplySubmit = async (parentId: number) => {
    if (!replyContent.trim()) return;
    if (!currentUserId) {
      alert('Vui lòng đăng nhập để bình luận.'); return;
    }

    try {
      await api.post('/api/v1/discussions/', {
        document_id: parsedId,
        content: replyContent.trim(),
        parent_id: parentId,
      });
      setReplyContent('');
      setReplyingTo(null);
      await fetchDiscussions(parsedId);
    } catch {
      alert('Phản hồi thất bại.');
    }
  };

  const handleQuestionSubmit = async () => {
    if (!questionInput.trim()) return;
    if (!currentUserId) {
      alert('Vui lòng đăng nhập để đặt câu hỏi.'); return;
    }
    try {
      await api.post('/api/v1/questions/', {
        document_id: parsedId,
        content: questionInput.trim(),
      });
      setQuestionInput('');
      await fetchQuestions(parsedId);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gửi câu hỏi thất bại.');
    }
  };

  const handleAnswerSubmit = async (questionId: number) => {
    if (!answerContent.trim()) return;
    try {
      await api.put(`/api/v1/questions/${questionId}`, {
        answer: answerContent.trim(),
      });
      setAnswerContent('');
      setAnsweringTo(null);
      await fetchQuestions(parsedId);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Trả lời thất bại.');
    }
  };

  const handleHighlightSubmit = async () => {
    if (!highText.trim()) return;
    if (!currentUserId) {
      alert('Vui lòng đăng nhập để tạo highlight'); return;
    }
    try {
      await api.post('/api/v1/highlights/', {
        document_id: parsedId,
        page_number: highPage,
        text_content: highText.trim(),
        color: highColor,
        note: highNote.trim() || undefined,
      });
      setHighText('');
      setHighNote('');
      await fetchHighlights(parsedId);
    } catch {
      alert('Tạo highlight thất bại');
    }
  };

  const handleDeleteHighlight = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá thẻ highlight này?")) return;
    try {
      await api.delete(`/api/v1/highlights/${id}`);
      await fetchHighlights(parsedId);
    } catch {
      alert("Xóa thất bại");
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
    <div className="flex h-screen bg-[#F4F7FE] font-sans text-slate-900 border-t-4 border-[#3B66F5]">
      <main className="flex-1 flex flex-col overflow-hidden">

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
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900">Đặt câu hỏi về tài liệu</h3>
                  <p className="mt-1 text-sm text-slate-500">Đặt câu hỏi để giảng viên hoặc sinh viên khác giúp bạn giải đáp cặn kẽ hơn.</p>
                  <textarea
                    rows={3}
                    value={questionInput}
                    onChange={(event) => setQuestionInput(event.target.value)}
                    placeholder="Ví dụ: Giảng viên cho hỏi công thức này có được mang vào phòng thi không ạ?"
                    className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#3B66F5] focus:bg-white transition-colors"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleQuestionSubmit}
                      disabled={!questionInput.trim()}
                      className="rounded-lg bg-[#3B66F5] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      Gửi câu hỏi
                    </button>
                  </div>
                </div>

                {questionsLoading ? (
                  <div className="text-center text-slate-500 text-sm py-10">Đang tải danh sách câu hỏi...</div>
                ) : questions.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800">Q&A ({questions.length})</h3>
                    {questions.map((q) => (
                      <div key={q.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <div className="p-5">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ${q.user?.role === 'lecturer' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                                {q.user ? getInitials(q.user.full_name) : '?'}
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900 text-sm">{q.user?.full_name || 'Người dùng'} {q.user?.role === 'lecturer' && <span className="bg-blue-100 text-blue-700 text-[10px] uppercase px-1.5 py-0.5 rounded ml-1">GV</span>}</h4>
                                <span className="text-[11px] text-slate-500">{timeAgo(q.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <p className="mt-4 text-[14px] text-slate-800 font-medium">Q: {q.content}</p>

                          {q.answer ? (
                            <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 group relative">
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-sm font-bold text-emerald-800">A: Trả lời</p>
                                <button onClick={() => { setAnsweringTo(answeringTo === q.id ? null : q.id); setAnswerContent(q.answer || ''); }} className="text-[10px] px-2 py-1 bg-emerald-100 uppercase font-bold text-emerald-700 hover:bg-emerald-200 rounded transition-colors">Chỉnh sửa</button>
                              </div>
                              <p className="text-[13px] text-emerald-900 leading-relaxed whitespace-pre-wrap">{q.answer}</p>
                            </div>
                          ) : (
                            <div className="mt-4 flex flex-col gap-3">
                              <span className="inline-block px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded-full w-fit">Chưa có câu trả lời</span>
                              {(isOwner || (currentUserId && document.uploader_id === currentUserId) || true) && (
                                <button onClick={() => { setAnsweringTo(answeringTo === q.id ? null : q.id); setAnswerContent(''); }} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors self-start">VIẾT CÂU TRẢ LỜI</button>
                              )}
                            </div>
                          )}

                          {answeringTo === q.id && (
                            <div className="mt-3 flex gap-2">
                              <input
                                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                placeholder="Nhập câu trả lời chuyên môn..."
                                value={answerContent}
                                onChange={e => setAnswerContent(e.target.value)}
                                autoFocus
                              />
                              <button onClick={() => handleAnswerSubmit(q.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">Lưu lại</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-10 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    Chưa có câu hỏi nào. Đặt câu hỏi đầu tiên!
                  </div>
                )}
              </div>
            )}

            {activeTab === 'discussion' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Thảo luận môn học</h3>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">U</div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Hỏi đáp, trao đổi với những người cùng học tài liệu này..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#3B66F5] focus:bg-white transition-colors"
                        rows={3}
                      />
                      <div className="mt-3 flex justify-end">
                        <button onClick={handleCommentSubmit} disabled={!newComment.trim()} className="rounded-lg bg-[#3B66F5] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition-colors">Đăng thảo luận</button>
                      </div>
                    </div>
                  </div>
                </div>

                {discLoading ? (
                  <div className="text-center text-slate-500 text-sm py-10">Đang tải thảo luận...</div>
                ) : discussions.length > 0 ? (
                  <div className="space-y-6">
                    {discussions.map((disc) => (
                      <div key={disc.id} className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 pb-2 flex gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-sm shrink-0 ${disc.user?.role === 'lecturer' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                            {disc.user ? getInitials(disc.user.full_name) : '?'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-slate-900">{disc.user?.full_name || 'Người dùng Ẩn danh'}</h4>
                              {disc.user?.role === 'lecturer' && (
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Giảng viên</span>
                              )}
                              <span className="text-xs font-medium text-slate-400 ml-auto">{timeAgo(disc.created_at)}</span>
                            </div>
                            <p className="text-[15px] text-slate-700 leading-relaxed mt-2 whitespace-pre-wrap">{disc.content}</p>
                          </div>
                        </div>

                        {/* Nút Phản hồi */}
                        <div className="px-6 pb-3 flex items-center gap-4">
                          <button
                            onClick={() => {
                              setReplyingTo(replyingTo === disc.id ? null : disc.id);
                              setReplyContent('');
                            }}
                            className="text-[13px] font-bold text-slate-500 hover:text-blue-600 transition-colors ml-[64px]"
                          >
                            Bình luận ({disc.replies?.length || 0})
                          </button>
                        </div>

                        {/* Replies */}
                        {disc.replies && disc.replies.length > 0 && (
                          <div className="px-6 pb-4 space-y-3">
                            <hr className="border-slate-100 mb-3 ml-[64px]" />
                            {disc.replies.map((reply) => (
                              <div key={reply.id} className={`ml-[64px] pl-4 border-l-2 rounded-xl p-3 ${reply.user?.role === 'lecturer' ? 'bg-[#EEF2FF] border-blue-400' : 'bg-[#F8FAFC] border-slate-200'}`}>
                                <div className="flex gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${reply.user?.role === 'lecturer' ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                                    {reply.user ? getInitials(reply.user.full_name) : '?'}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-[13px] text-slate-900">{reply.user?.full_name || 'Ẩn danh'}</span>
                                      {reply.user?.role === 'lecturer' && (
                                        <span className="bg-blue-600 text-white text-[8px] font-bold uppercase tracking-wide px-1 py-0.5 rounded">GV</span>
                                      )}
                                      <span className="text-[10px] font-medium text-slate-400 ml-auto">{timeAgo(reply.created_at)}</span>
                                    </div>
                                    <p className="text-[13px] text-slate-600 leading-relaxed mt-1 whitespace-pre-wrap">{reply.content}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Khung nhập Reply Facebook style */}
                        {replyingTo === disc.id && (
                          <div className="px-6 pb-5 pt-2 flex gap-3 animate-fade-in ml-[48px]">
                            <div className="flex-1 bg-slate-100 rounded-[20px] flex items-center pr-2 pl-4 py-1.5 border border-slate-200 focus-within:border-blue-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                              <input
                                type="text"
                                autoFocus
                                placeholder="Viết bình luận..."
                                className="bg-transparent flex-1 outline-none text-[13px] text-slate-800 placeholder-slate-500"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(disc.id)}
                              />
                              <button
                                onClick={() => handleReplySubmit(disc.id)}
                                disabled={!replyContent.trim()}
                                className="w-7 h-7 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                              >
                                <svg className="w-4 h-4 ml-[2px]" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-10 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    Chưa có thảo luận nào. Bạn có thắc mắc gì không?
                  </div>
                )}
              </div>
            )}

            {activeTab === 'highlight' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900">Ghi chú & Nổi bật (Highlight)</h3>
                  <p className="mt-1 text-sm text-slate-500">Lưu lại những đoạn văn quan trọng từ tài liệu (trang cụ thể) kèm ghi chú cá nhân của bạn.</p>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Đoạn văn quan trọng *</label>
                      <textarea
                        value={highText}
                        onChange={e => setHighText(e.target.value)}
                        rows={3}
                        placeholder="Ví dụ: Công thức tính năng lượng E = mc^2..."
                        className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Trang số</label>
                      <input
                        type="number"
                        value={highPage}
                        onChange={e => setHighPage(Number(e.target.value))}
                        min={1}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Phân loại màu</label>
                      <select
                        value={highColor}
                        onChange={e => setHighColor(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-[9px] text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                      >
                        <option value="yellow">🟡 Vàng (Quan trọng)</option>
                        <option value="blue">🔵 Xanh dương (Ví dụ)</option>
                        <option value="green">🟢 Xanh lá (Định nghĩa)</option>
                        <option value="red">🔴 Đỏ (Cần hỏi lại)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ghi chú thêm (Tùy chọn)</label>
                      <input
                        value={highNote}
                        onChange={e => setHighNote(e.target.value)}
                        placeholder="Nhập ghi chú ý hiểu của bạn cho đoạn văn này..."
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <button
                      onClick={handleHighlightSubmit}
                      disabled={!highText.trim()}
                      className="bg-[#3B66F5] text-white px-5 py-2.5 rounded-lg font-bold text-[13px] hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm shadow-blue-200"
                    >
                      Lưu Highlight
                    </button>
                  </div>
                </div>

                {highLoading ? (
                  <div className="text-center py-10 text-slate-500 text-sm font-medium">Đang tải ghi chú...</div>
                ) : highlights.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {highlights.map(h => (
                      <div key={h.id} className={`rounded-xl border p-5 shadow-sm relative transition-all hover:shadow-md ${h.color === 'yellow' ? 'bg-[#FFFBEB] border-[#FEF3C7]' : h.color === 'blue' ? 'bg-[#EFF6FF] border-[#DBEAFE]' : h.color === 'green' ? 'bg-[#F0FDF4] border-[#DCFCE7]' : 'bg-[#FEF2F2] border-[#FEE2E2]'}`}>
                        <button onClick={() => handleDeleteHighlight(h.id)} className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-md bg-white bg-opacity-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors text-xs font-black">✕</button>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-full bg-white bg-opacity-70 tracking-wider text-slate-700">Trang {h.page_number}</span>
                          <span className="text-[11px] text-slate-500 font-medium">{timeAgo(h.created_at)}</span>
                        </div>

                        <div className="relative">
                          <div className={`absolute left-0 top-1 bottom-1 w-1 rounded-full ${h.color === 'yellow' ? 'bg-amber-400' : h.color === 'blue' ? 'bg-blue-400' : h.color === 'green' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                          <p className={`pl-4 font-semibold text-[14px] leading-relaxed ${h.color === 'yellow' ? 'text-amber-900' : h.color === 'blue' ? 'text-blue-900' : h.color === 'green' ? 'text-emerald-900' : 'text-red-900'}`}>{h.text_content}</p>
                        </div>

                        {h.note && (
                          <div className="mt-4 pt-3 border-t border-slate-300 border-opacity-30">
                            <p className="text-[13px] text-slate-700 font-semibold"><span className="opacity-70">💡 Ghi chú: </span>{h.note}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-500 text-sm font-medium">Bạn chưa lưu đoạn nổi bật nào.<br /><span className="text-xs font-normal opacity-70 mt-1 block">Tạo highlight để ghi nhớ bài tốt hơn!</span></div>
                )}
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
