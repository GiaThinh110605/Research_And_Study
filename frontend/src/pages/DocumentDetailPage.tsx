import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import ShareModal from '../components/documents/ShareModal';
import { authService } from '../services/auth';
import { documentService, DocumentItem, ShareItem } from '../services/documents';
import { Flashcard as FlashcardItem } from '../services/flashcards';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/ai';

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
type DetailTab = 'info' | 'questions' | 'discussion' | 'highlight' | 'flashcards';

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
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') as DetailTab || 'info';
  const parsedId = Number(documentId);
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab);
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

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

  const [isQuestionInput, setIsQuestionInput] = useState(false);
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
  // States for flashcards
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [flashLoading, setFlashLoading] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyStats, setStudyStats] = useState({ known: 0, review: 0, unknown: 0 });

  const sampleFlashcards: FlashcardItem[] = [
    {
      id: -1,
      set_id: 0,
      document_id: parsedId,
      front: "Độ phức tạp thời gian (Time Complexity) của thuật toán Quick Sort trong trường hợp trung bình là gì?",
      back: "O(n log n). Quick Sort sử dụng chiến thuật chia để trị, phân chia mảng dựa trên phần tử chốt (pivot).",
      created_at: new Date().toISOString()
    },
    {
      id: -2,
      set_id: 0,
      document_id: parsedId,
      front: "Nguyên lý ACID trong hệ quản trị cơ sở dữ liệu (DBMS) là gì?",
      back: "Atomicity (Nguyên tử), Consistency (Nhất quán), Isolation (Cô lập), Durability (Bền vững).",
      created_at: new Date().toISOString()
    },
    {
      id: -3,
      set_id: 0,
      document_id: parsedId,
      front: "Sự khác biệt giữa REST và GraphQL là gì?",
      back: "REST dựa trên tài nguyên với các endpoint cố định. GraphQL cho phép client yêu cầu chính xác dữ liệu họ cần thông qua một endpoint duy nhất.",
      created_at: new Date().toISOString()
    }
  ];

  const effectiveFlashcards = flashcards.length > 0 ? flashcards : sampleFlashcards;
  const currentFlashcard = effectiveFlashcards[studyIndex];
  const progressPercent = Math.round(((studyIndex) / effectiveFlashcards.length) * 100);

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

  const fetchFlashcards = async (docId: number) => {
    setFlashLoading(true);
    try {
      const res = await api.get(`/api/v1/flashcards/?document_id=${docId}`);
      setFlashcards(res.data);
    } catch {
      console.error('Lỗi tải flashcards');
    } finally {
      setFlashLoading(false);
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
      } else if (activeTab === 'flashcards') {
        fetchFlashcards(parsedId);
      }
    }
  }, [parsedId, activeTab]);

  const openShare = async () => {
    setIsShareOpen(true);
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

  const handleCommentSubmit = async (isQuestion: boolean = false) => {
    if (!newComment.trim()) return;
    if (!currentUserId) {
      alert('Vui lòng đăng nhập để thực hiện thao tác này.');
      return;
    }

    try {
      await api.post('/api/v1/discussions/', {
        document_id: parsedId,
        content: newComment.trim(),
        parent_id: null,
        is_question: isQuestion
      });
      setNewComment('');
      await fetchDiscussions(parsedId);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gửi thất bại.');
    }
  };

  // ... (Update the UI part in the return)

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
  const handleGenerateAi = async (toolId: string) => {
    if (!document) return;
    if (!currentUserId) {
      alert('Vui lòng đăng nhập để sử dụng AI.');
      return;
    }

    setAiResult(`Đang xử lý ${toolId}...`);
    try {
      if (toolId === 'summary') {
        const res = await aiService.generateSummary(document.id);
        setAiResult(res.content);
      } else if (toolId === 'mindmap') {
        const res = await aiService.generateMindmap(document.id);
        setAiResult(`Đã tạo sơ đồ tư duy thành công!\n\n${JSON.stringify(res.data.root.children.map((c: any) => c.text), null, 2)}`);
      } else if (toolId === 'flashcard') {
        const res = await aiService.generateFlashcards(document.id, 5);
        setAiResult(`Đã tạo thành công ${res.length} flashcards cho tài liệu này.`);
        await fetchFlashcards(document.id);
      } else {
        setAiResult('Tính năng chưa được hỗ trợ.');
      }
    } catch (err: any) {
      setAiResult(`Lỗi AI: ${err.response?.data?.detail || 'Không thể thực hiện yêu cầu.'}`);
    }
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
          <button onClick={() => setActiveTab('flashcards')} className={activeTab === 'flashcards' ? 'text-[#3B66F5]' : 'hover:text-slate-800'}>Flashcards</button>
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
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 shadow-sm">
                      {currentUserId ? 'Me' : 'U'}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Hỏi đáp, trao đổi với những người cùng học tài liệu này..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none focus:border-[#3B66F5] focus:bg-white transition-all text-[15px]"
                        rows={3}
                      />
                      <div className="mt-4 flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <div className={`w-10 h-5 rounded-full transition-colors relative ${isQuestionInput ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                            <input 
                              type="checkbox" 
                              className="hidden" 
                              checked={isQuestionInput} 
                              onChange={e => setIsQuestionInput(e.target.checked)} 
                            />
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${isQuestionInput ? 'translate-x-5' : ''}`} />
                          </div>
                          <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">Đánh dấu là câu hỏi</span>
                        </label>
                        <button 
                          onClick={() => handleCommentSubmit(isQuestionInput)} 
                          disabled={!newComment.trim()} 
                          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 disabled:opacity-50 transition-all active:scale-95"
                        >
                          Đăng bài
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {discLoading ? (
                  <div className="text-center text-slate-500 text-sm py-12">
                    <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-medium">Đang tải thảo luận...</p>
                  </div>
                ) : discussions.length > 0 ? (
                  <div className="space-y-6">
                    {discussions.map((disc: any) => (
                      <div key={disc.id} className={`rounded-2xl bg-white border shadow-sm overflow-hidden transition-all hover:shadow-md ${disc.is_question ? 'border-indigo-200 ring-1 ring-indigo-50' : 'border-slate-100'}`}>
                        <div className="p-6">
                          <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-sm shrink-0 text-lg ${disc.user?.role === 'lecturer' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                              {disc.user ? getInitials(disc.user.full_name) : '?'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-bold text-slate-900">{disc.user?.full_name || 'Người dùng Ẩn danh'}</h4>
                                {disc.user?.role === 'lecturer' && (
                                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">Giảng viên</span>
                                )}
                                {disc.is_question && (
                                  <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" /></svg>
                                    Câu hỏi
                                  </span>
                                )}
                                <span className="text-[11px] font-bold text-slate-400 ml-auto">{timeAgo(disc.created_at)}</span>
                              </div>
                              <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{disc.content}</p>
                              
                              <div className="mt-4 flex items-center gap-6">
                                <button
                                  onClick={() => {
                                    setReplyingTo(replyingTo === disc.id ? null : disc.id);
                                    setReplyContent('');
                                  }}
                                  className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                  {disc.replies?.length > 0 ? `Bình luận (${disc.replies.length})` : 'Trả lời ngay'}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Replies */}
                          {disc.replies && disc.replies.length > 0 && (
                            <div className="mt-6 ml-16 space-y-4 border-l-2 border-slate-100 pl-6">
                              {disc.replies.map((reply: any) => (
                                <div key={reply.id} className="group">
                                  <div className="flex gap-3">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm ${reply.user?.role === 'lecturer' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                      {reply.user ? getInitials(reply.user.full_name) : '?'}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm text-slate-900">{reply.user?.full_name || 'Ẩn danh'}</span>
                                        {reply.user?.role === 'lecturer' && (
                                          <span className="bg-indigo-600 text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm">GV</span>
                                        )}
                                        <span className="text-[10px] font-bold text-slate-400 ml-auto">{timeAgo(reply.created_at)}</span>
                                      </div>
                                      <p className="text-[13px] text-slate-600 leading-relaxed font-medium">{reply.content}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Input */}
                          {replyingTo === disc.id && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-6 ml-16 bg-slate-50 rounded-2xl p-2 flex items-center gap-2 border border-slate-200"
                            >
                              <input
                                type="text"
                                autoFocus
                                placeholder="Viết phản hồi của bạn..."
                                className="bg-transparent flex-1 outline-none text-sm px-3 py-2 text-slate-800 placeholder:text-slate-400"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(disc.id)}
                              />
                              <button
                                onClick={() => handleReplySubmit(disc.id)}
                                disabled={!replyContent.trim()}
                                className="bg-indigo-600 text-white p-2 rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                              </button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    </div>
                    <p className="text-slate-400 font-bold tracking-wide">Chưa có thảo luận nào cho tài liệu này.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'highlight' && (
              <>
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
            </>
            )}

            {activeTab === 'flashcards' && (
              <>
                <div className="flex flex-col gap-6 lg:flex-row h-full">
                {/* Left Sidebar - Stats & Tips */}
                <div className="lg:w-80 flex flex-col gap-6 shrink-0">
                  {/* Progress Card */}
                  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col items-center">
                    <p className="text-[10px] font-black tracking-widest text-blue-500 uppercase mb-6 self-start">Tiến độ hôm nay</p>
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-blue-50" />
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * progressPercent) / 100} strokeLinecap="round" className="text-[#3B66F5] transition-all duration-1000" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-slate-800">{progressPercent}%</span>
                        <span className="text-[10px] font-bold text-slate-400">Hoàn thành</span>
                      </div>
                    </div>
                    <div className="w-full mt-8 flex justify-between gap-4">
                      <div className="flex-1 bg-slate-50 rounded-2xl p-3 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Đã học</p>
                        <p className="text-xl font-black text-slate-800">{studyIndex}</p>
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-2xl p-3 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Còn lại</p>
                        <p className="text-xl font-black text-slate-800">{effectiveFlashcards.length - studyIndex}</p>
                      </div>
                    </div>
                  </div>

                  {/* Achievement Card */}
                  <div className="bg-[#0A1A3F] rounded-[32px] p-8 text-white">
                    <div className="flex justify-between items-center mb-6">
                      <p className="text-[10px] font-black tracking-widest text-blue-300 uppercase">Thành tích</p>
                      <span className="text-lg">🔥</span>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">⚡</div>
                        <div>
                          <p className="text-[13px] font-black">Chuỗi ngày</p>
                          <p className="text-[11px] font-semibold text-blue-200">12 Ngày liên tiếp <span className="bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded-full ml-1">MỚI</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">🏆</div>
                        <div>
                          <p className="text-[13px] font-black">Điểm số</p>
                          <p className="text-[11px] font-semibold text-blue-200">1,450 XP</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tips Card */}
                  <div className="bg-[#EEF2FF] rounded-[32px] p-6 border border-blue-100 flex gap-4">
                    <div className="w-10 h-10 bg-[#3B66F5] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">💡</div>
                    <div>
                      <p className="text-[13px] font-black text-slate-800"><span className="text-[#3B66F5]">Mẹo học:</span> Việc ôn lại các thẻ "Không biết" ngay lập tức giúp tăng khả năng ghi nhớ lên 40%.</p>
                    </div>
                  </div>
                </div>

                {/* Main Content - Study Mode */}
                <div className="flex-1 bg-white rounded-[32px] p-12 shadow-sm border border-gray-100 flex flex-col items-center relative overflow-hidden">
                  <div className="absolute top-8 left-12 flex items-center gap-4">
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Câu hỏi #{studyIndex + 1}</p>
                  </div>

                  {/* Flashcard Component */}
                  <div className="mt-16 w-full max-w-2xl h-96 perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                    <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                      {/* Front */}
                      <div className="absolute inset-0 backface-hidden flex items-center justify-center p-12 bg-white rounded-[40px] shadow-2xl shadow-blue-100 border border-slate-50 border-b-4 border-b-slate-100">
                        <div className="flex flex-col items-center">
                          <h3 className="text-2xl font-black text-center text-slate-800 leading-tight">
                            {currentFlashcard?.front}
                          </h3>
                          <div className="mt-12 flex items-center gap-2 text-slate-400">
                            <span className="text-xs">👆</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Nhấn để xem đáp án</span>
                          </div>
                        </div>
                      </div>
                      {/* Back */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center p-12 bg-[#F8FAFC] rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100">
                        <div className="flex flex-col items-center">
                          <p className="text-lg font-bold text-center text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {currentFlashcard?.back}
                          </p>
                          <div className="mt-12 flex items-center gap-2 text-blue-400">
                            <span className="text-xs">🔙</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Quay lại mặt trước</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-16 flex items-end gap-12">
                    <div className="flex flex-col items-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setStudyStats(prev => ({ ...prev, unknown: prev.unknown + 1 }));
                          setStudyIndex((studyIndex + 1) % effectiveFlashcards.length);
                          setIsFlipped(false);
                        }}
                        className="w-16 h-16 rounded-full border-2 border-red-50 text-red-500 hover:bg-red-50 transition-all flex items-center justify-center text-2xl font-black shadow-lg shadow-red-100/50 hover:scale-110 active:scale-95"
                      >
                        ✕
                      </button>
                      <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Không biết</p>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setStudyStats(prev => ({ ...prev, review: prev.review + 1 }));
                          setStudyIndex((studyIndex + 1) % effectiveFlashcards.length);
                          setIsFlipped(false);
                        }}
                        className="w-20 h-20 rounded-full border-2 border-amber-50 text-amber-500 hover:bg-amber-50 transition-all flex items-center justify-center text-2xl font-black shadow-lg shadow-amber-100/50 hover:scale-110 active:scale-95"
                      >
                        <svg className="w-8 h-8 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      </button>
                      <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Ôn lại</p>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setStudyStats(prev => ({ ...prev, known: prev.known + 1 }));
                          setStudyIndex((studyIndex + 1) % effectiveFlashcards.length);
                          setIsFlipped(false);
                        }}
                        className="w-16 h-16 rounded-full border-2 border-emerald-50 text-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-100/50 hover:scale-110 active:scale-95"
                      >
                        ✓
                      </button>
                      <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Biết</p>
                    </div>
                  </div>

                  {/* Footer - Social Proof */}
                  <div className="mt-auto pt-16 flex items-center gap-4 text-slate-400">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100"></div>
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300"></div>
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-[#3B66F5] text-[10px] font-black text-white flex items-center justify-center">+12</div>
                    </div>
                    <p className="text-[12px] font-semibold">14 bạn khác đang học cùng bạn</p>
                  </div>
                </div>
                </div>
              </>
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
        onClose={() => setIsShareOpen(false)}
        onShareSuccess={() => {
          // Success callback if needed
        }}
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
