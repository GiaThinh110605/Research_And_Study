import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ShareModal from '../components/documents/ShareModal';
import AIQAPanel from '../components/AIQAPanel';
import { authService } from '../services/auth';
import { documentService, DocumentIngestionStatus, DocumentItem, ShareItem } from '../services/documents';
import { Flashcard as FlashcardItem } from '../services/flashcards';
import api from '../services/api';
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
  user?: DiscussionUser | null;
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

function getIngestionStatusLabel(status?: string) {
  if (!status) return 'Đang chuẩn bị';
  if (status === 'completed') return 'Hoàn tất';
  if (status === 'failed') return 'Thất bại';
  if (status === 'processing') return 'Đang xử lý';
  if (status === 'queued') return 'Đang xếp hàng';
  return 'Đang xử lý';
}

const ingestionSteps = [
  { id: 'document_uploaded', label: 'Tải lên' },
  { id: 'chunking_completed', label: 'Chunking' },
  { id: 'concepts_extracted', label: 'Khái niệm' },
  { id: 'summary_generated', label: 'Tóm tắt' },
  { id: 'quiz_generated', label: 'Quiz' },
];
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
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') as DetailTab || 'info';
  const parsedId = Number(documentId);
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab);
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [ingestion, setIngestion] = useState<DocumentIngestionStatus | null>(null);
  const [ingestionLoading, setIngestionLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');

  // UC07 UI States
  const [readingMode, setReadingMode] = useState<'pdf' | 'text'>('pdf');
  const [chunks, setChunks] = useState<{id: number, content: string, chunk_index: number}[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRect, setSelectionRect] = useState<{top: number, left: number, width: number} | null>(null);
  const [showHighlightModal, setShowHighlightModal] = useState(false);

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
  const [reactions, setReactions] = useState<Record<number, string>>({});

  const handleReaction = (discId: number, emoji: string) => {
    setReactions(prev => ({
      ...prev,
      [discId]: prev[discId] === emoji ? '' : emoji
    }));
  };

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
      status: "new",
      mastery_level: 0,
      created_at: new Date().toISOString()
    },
    {
      id: -2,
      set_id: 0,
      document_id: parsedId,
      front: "Nguyên lý ACID trong hệ quản trị cơ sở dữ liệu (DBMS) là gì?",
      back: "Atomicity (Nguyên tử), Consistency (Nhất quán), Isolation (Cô lập), Durability (Bền vững).",
      status: "new",
      mastery_level: 0,
      created_at: new Date().toISOString()
    },
    {
      id: -3,
      set_id: 0,
      document_id: parsedId,
      front: "Sự khác biệt giữa REST và GraphQL là gì?",
      back: "REST dựa trên tài nguyên với các endpoint cố định. GraphQL cho phép client yêu cầu chính xác dữ liệu họ cần thông qua một endpoint duy nhất.",
      status: "new",
      mastery_level: 0,
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
  const summaryLines = (ingestion?.summary_content || '')
    .split('\n')
    .map((line: string) => line.replace(/^•\s*/, '').trim())
    .filter(Boolean);
  const conceptItems = ingestion?.concepts || [];
  const quizAvailable = Boolean(ingestion?.quiz_test_id && (ingestion?.quiz_questions_count || 0) > 0);
  const stepIndexMap: Record<string, number> = {
    document_uploaded: 0,
    chunking_completed: 1,
    concepts_extracted: 2,
    summary_generated: 3,
    quiz_generated: 4,
  };
  const currentStepIndex = ingestion?.status === 'failed'
    ? -1
    : stepIndexMap[ingestion?.last_event || 'document_uploaded'] ?? 0;

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

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const loadIngestion = async () => {
      if (!Number.isFinite(parsedId)) return;
      setIngestionLoading(true);
      try {
        const data = await documentService.getIngestion(parsedId);
        setIngestion(data);
        if (data.status !== 'completed' && data.status !== 'failed') {
          timeoutId = setTimeout(loadIngestion, 5000);
        }
      } catch {
        setIngestion(null);
      } finally {
        setIngestionLoading(false);
      }
    };

    loadIngestion();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
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

  const fetchChunks = async (docId: number) => {
    try {
      const res = await api.get(`/api/v1/documents/${docId}/chunks`);
      setChunks(res.data);
    } catch (err) {
      console.error('Lỗi tải chunks:', err);
    }
  };

  useEffect(() => {
    if (parsedId) {
      fetchChunks(parsedId);
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

  const handleOpenQuiz = () => {
    if (!ingestion?.quiz_test_id) return;
    navigate(`/take-test/${ingestion.quiz_test_id}`);
  };

  const handleRetryIngestion = async () => {
    if (!document) return;
    setIsRetrying(true);
    setRetryError('');
    try {
      const data = await documentService.reIngest(document.id);
      setIngestion(data);
    } catch (err: any) {
      setRetryError(err.response?.data?.detail || 'Không thể kích hoạt lại pipeline.');
    } finally {
      setIsRetrying(false);
    }
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
      const response = await api.post('/api/v1/highlights/', {
        document_id: parsedId,
        page_number: highPage,
        text_content: highText.trim(),
        color: highColor,
        note: highNote.trim() || null,
      });
      console.log('Highlight created:', response.data);
      setHighText('');
      setHighNote('');
      await fetchHighlights(parsedId);
      alert('✅ Lưu highlight thành công!');
    } catch (err: any) {
      console.error('Highlight error:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Tạo highlight thất bại';
      alert(`❌ ${errorMsg}`);
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
    <div
      className="flex h-[calc(100vh)] bg-[#F6F3EE] text-slate-900 overflow-hidden"
      style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(251, 234, 212, 0.6), transparent 40%), radial-gradient(circle at 80% 10%, rgba(212, 228, 255, 0.5), transparent 45%)' }}
    >
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Top Header */}
        <div className="h-[72px] bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-sm text-gray-500 font-bold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
            Tài liệu
            <span className="text-gray-300">›</span>
            <span className="text-gray-900">{document.title}</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={openShare} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[#3B66F5] hover:bg-blue-50 rounded-xl transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              Chia sẻ
            </button>
            <a href={fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#5E6AD2] hover:bg-[#4d57b5] px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Tải về PDF
            </a>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Vùng 1: Left Sidebar (Cấu trúc & Highlight) */}
          <div className="w-[280px] bg-white h-full overflow-y-auto border-r border-gray-100 flex flex-col shrink-0 p-5">
            <h3 className="font-black text-[13px] uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
              Cấu trúc tài liệu
            </h3>
            <ul className="space-y-3 mb-8">
              {summaryLines.length > 0 ? (
                summaryLines.slice(0, 6).map((line: string, idx: number) => (
                  <li key={idx} className="text-[13px] font-medium text-slate-600 hover:text-[#3B66F5] cursor-pointer line-clamp-2 pl-3 border-l-2 border-transparent hover:border-[#3B66F5] transition-colors" onClick={() => setReadingMode('text')}>
                    {line.replace(/^[•\-\*]\s*/, '')}
                  </li>
                ))
              ) : (
                <p className="text-[12px] text-slate-400 italic">Cấu trúc đang được AI trích xuất...</p>
              )}
            </ul>
            
            <h3 className="font-black text-[13px] uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Highlight của bạn
            </h3>
            <ul className="space-y-3">
              {highlights.length === 0 ? (
                <p className="text-[12px] text-slate-400 italic">Chưa có highlight nào. Hãy bôi đen văn bản trong chế độ AI Reading.</p>
              ) : (
                highlights.map(hl => (
                  <li key={hl.id} className="text-[12px] p-3 rounded-xl border-l-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors relative group" style={{borderLeftColor: hl.color || 'yellow'}} onClick={() => setReadingMode('text')}>
                    <p className="font-semibold text-slate-700 line-clamp-3">"{hl.text_content}"</p>
                    {hl.note && <p className="mt-2 text-slate-500 italic bg-white p-2 rounded border border-slate-100">{hl.note}</p>}
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteHighlight(hl.id); }} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-sm">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Vùng 2: Center: Document Viewer */}
          <div className="flex-1 h-full overflow-y-auto p-6 bg-[#F8FAFF] relative" id="document-content-area">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-slate-800 line-clamp-1 flex-1 mr-4">{document?.title}</h2>
              <div className="flex bg-white rounded-xl p-1 border shadow-sm">
                <button 
                  onClick={() => setReadingMode('pdf')}
                  className={`px-4 py-2 text-[13px] font-bold rounded-lg transition-all ${readingMode === 'pdf' ? 'bg-[#3B66F5] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> PDF Gốc</span>
                </button>
                <button 
                  onClick={() => setReadingMode('text')}
                  className={`px-4 py-2 text-[13px] font-bold rounded-lg transition-all ${readingMode === 'text' ? 'bg-[#3B66F5] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> AI Reading</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-[calc(100%-60px)] overflow-hidden relative">
              {readingMode === 'pdf' ? (
                document?.file_type.toUpperCase() === 'PDF' ? (
                  <iframe title="PDF Viewer" src={fileUrl} className="w-full h-full" />
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-8">
                    <div>
                      <p className="text-lg font-bold text-slate-700">Tài liệu không phải PDF</p>
                      <a href={fileUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl bg-[#3B66F5] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-600 transition-colors">Tải tài liệu gốc</a>
                    </div>
                  </div>
                )
              ) : (
                <div 
                  className="h-full overflow-y-auto p-10 prose max-w-none text-slate-800 leading-loose text-[15px] font-medium selection:bg-yellow-200 selection:text-slate-900"
                  onMouseUp={(e: React.MouseEvent<HTMLDivElement>) => {
                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0 && selection.toString().trim().length > 0) {
                      const range = selection.getRangeAt(0);
                      const rect = range.getBoundingClientRect();
                      const containerRect = e.currentTarget.getBoundingClientRect();
                      setSelectedText(selection.toString().trim());
                      setSelectionRect({
                        top: rect.top - containerRect.top - 45,
                        left: rect.left - containerRect.left + (rect.width / 2) - 150,
                        width: rect.width
                      });
                    } else {
                      if (!showHighlightModal) setSelectionRect(null);
                    }
                  }}
                >
                  {chunks.length > 0 ? (
                    chunks.map(chunk => (
                      <p key={chunk.id} className="mb-6 whitespace-pre-wrap">{chunk.content}</p>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
                      <p className="font-bold">Đang tải cấu trúc AI Reading...</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions / Floating Toolbar */}
            {selectionRect && readingMode === 'text' && !showHighlightModal && (
              <div 
                className="absolute bg-white rounded-xl shadow-2xl border border-slate-200 flex items-center p-1.5 z-50 animate-in fade-in zoom-in duration-200"
                style={{ top: selectionRect.top, left: Math.max(0, selectionRect.left) }}
              >
                <button onClick={() => setShowHighlightModal(true)} className="flex flex-col items-center justify-center w-16 h-14 hover:bg-slate-50 rounded-lg text-[11px] font-bold text-slate-700 transition-colors group">
                  <div className="w-5 h-5 rounded-full bg-yellow-400 mb-1 group-hover:scale-110 transition-transform shadow-inner border border-yellow-500"></div> Highlight
                </button>
                <div className="w-px h-8 bg-slate-100 mx-1"></div>
                <button onClick={() => {
                  setActiveTab('questions');
                  setQuestionInput(`Tôi chưa hiểu rõ đoạn văn này:\n"${selectedText}"\n\nBạn có thể giải thích chi tiết hơn không?`);
                  setSelectionRect(null);
                }} className="flex flex-col items-center justify-center w-16 h-14 hover:bg-slate-50 rounded-lg text-[11px] font-bold text-[#3B66F5] transition-colors group">
                  <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  Hỏi AI
                </button>
                <div className="w-px h-8 bg-slate-100 mx-1"></div>
                <button onClick={() => {
                  alert('Tính năng tự động tạo Flashcard đang được phát triển!');
                  setSelectionRect(null);
                }} className="flex flex-col items-center justify-center w-16 h-14 hover:bg-slate-50 rounded-lg text-[11px] font-bold text-purple-600 transition-colors group">
                  <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Flashcard
                </button>
              </div>
            )}

            {/* Highlight Popup Modal */}
            {showHighlightModal && selectionRect && (
               <div 
                 className="absolute bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 w-[280px] animate-in fade-in zoom-in duration-200"
                 style={{ top: selectionRect.top, left: Math.max(0, selectionRect.left - 40) }}
               >
                 <p className="text-[11px] font-bold uppercase text-slate-400 mb-3 tracking-wider">Tạo thẻ ghi nhớ</p>
                 <div className="flex gap-3 mb-4">
                   {['#FDE047', '#86EFAC', '#93C5FD', '#F9A8D4'].map(color => (
                     <button key={color} onClick={() => setHighColor(color)} className={`w-6 h-6 rounded-full shadow-sm border-2 ${highColor === color ? 'border-slate-800 scale-110' : 'border-transparent'}`} style={{backgroundColor: color}} />
                   ))}
                 </div>
                 <textarea 
                   value={highNote}
                   onChange={e => setHighNote(e.target.value)}
                   placeholder="Thêm ghi chú cá nhân..." 
                   className="w-full text-[13px] p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-blue-100 outline-none mb-3 resize-none h-[80px]"
                 />
                 <div className="flex gap-2">
                   <button onClick={() => { setShowHighlightModal(false); setSelectionRect(null); }} className="flex-1 px-3 py-2 bg-slate-100 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-200">Hủy</button>
                   <button onClick={() => {
                     setHighText(selectedText);
                     setTimeout(handleHighlightSubmit, 0); // Need to wait for state to update
                     setShowHighlightModal(false); 
                     setSelectionRect(null);
                   }} className="flex-1 px-3 py-2 bg-[#3B66F5] text-white text-[12px] font-bold rounded-xl hover:bg-blue-600 shadow-md">Lưu thẻ</button>
                 </div>
               </div>
            )}
          </div>

          {/* Vùng 3: Right Sidebar (AI Panel) */}
          <div className="w-[400px] bg-white h-full overflow-hidden border-l border-slate-200 flex flex-col shrink-0">
            {/* Tabs */}
            <div className="flex items-center justify-between px-6 pt-5 border-b border-gray-100 overflow-x-auto">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex shrink-0 items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'info' ? 'border-[#3B66F5] text-[#3B66F5]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                Tóm tắt
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`flex shrink-0 items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'questions' ? 'border-[#3B66F5] text-[#3B66F5]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                Hỏi AI
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`flex shrink-0 items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'flashcards' ? 'border-[#3B66F5] text-[#3B66F5]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Sơ đồ
              </button>
              <button
                onClick={() => setActiveTab('discussion')}
                className={`flex shrink-0 items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'discussion' ? 'border-[#3B66F5] text-[#3B66F5]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                Thảo luận
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
              {/* Summary View */}
              {activeTab === 'info' && (
                <>
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pipeline UC06</p>
                        <h4 className="text-sm font-bold text-slate-800">Tự động xử lý tài liệu</h4>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${ingestion?.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : ingestion?.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        {getIngestionStatusLabel(ingestion?.status)}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${ingestion?.status === 'completed' ? 'bg-emerald-500' : ingestion?.status === 'failed' ? 'bg-red-500' : 'bg-[#3B66F5]'}`}
                          style={{ width: `${Math.round((ingestion?.progress || 0) * 100)}%` }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>Chunks: {ingestion?.chunks_count || 0}</span>
                        <span>Concepts: {ingestion?.concepts_count || 0}</span>
                        <span>Quiz: {ingestion?.quiz_questions_count || 0} câu</span>
                      </div>
                      <div className="mt-4 grid grid-cols-5 gap-2">
                        {ingestionSteps.map((step, idx) => {
                          const isDone = currentStepIndex > idx || ingestion?.status === 'completed';
                          const isActive = currentStepIndex === idx && ingestion?.status !== 'failed' && ingestion?.status !== 'completed';
                          const isFailed = ingestion?.status === 'failed' && currentStepIndex <= idx;
                          return (
                            <div key={step.id} className="flex flex-col items-center gap-2">
                              <div className={`h-8 w-8 rounded-full border text-[11px] font-black flex items-center justify-center transition-all duration-300 ${isFailed ? 'border-red-200 text-red-500 bg-red-50' : isDone ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : isActive ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-slate-200 text-slate-400 bg-slate-50'} ${isActive ? 'animate-pulse ring-4 ring-blue-50' : ''}`}>
                                {isDone ? '✓' : idx + 1}
                              </div>
                              <span className={`text-[10px] font-bold text-center transition-colors duration-300 ${isDone ? 'text-emerald-700' : isActive ? 'text-blue-700' : isFailed ? 'text-red-500' : 'text-slate-400'}`}>{step.label}</span>
                            </div>
                          );
                        })}
                      </div>
                      {ingestionLoading && (
                        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" />
                          Đang đồng bộ trạng thái pipeline...
                        </div>
                      )}
                      {ingestion?.error_message && (
                        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 flex items-start gap-2.5">
                          <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="text-[12px] text-red-700">{ingestion.error_message}</span>
                        </div>
                      )}
                      {retryError && (
                        <p className="mt-2 text-[11px] text-red-500">{retryError}</p>
                      )}
                      {ingestion?.status === 'failed' && isOwner && (
                        <button
                          onClick={handleRetryIngestion}
                          className="mt-3 inline-flex items-center justify-center w-full gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-[12px] font-bold text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                          disabled={isRetrying}
                        >
                          {isRetrying ? (
                            <>
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                              Đang khởi động lại...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                              Khởi động lại Pipeline
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#F8FAFF] rounded-2xl p-6 border border-blue-50">
                    <div className="flex justify-between items-center mb-5">
                      <h4 className="text-sm font-bold text-gray-800">Tóm tắt học thuật</h4>
                      <span className="bg-[#5E6AD2] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Auto</span>
                    </div>
                    {summaryLines.length > 0 ? (
                      <ul className="space-y-4 text-[13px] text-gray-600 font-medium leading-relaxed">
                        {summaryLines.map((line, idx) => (
                          <li key={idx} className="flex gap-2.5"><span className="text-[#3B66F5] mt-0.5">•</span>{line}</li>
                        ))}
                      </ul>
                    ) : ingestionLoading || ingestion?.status !== 'completed' ? (
                      <div className="space-y-3 animate-pulse">
                        <div className="h-3 rounded-full bg-slate-200" />
                        <div className="h-3 rounded-full bg-slate-200 w-11/12" />
                        <div className="h-3 rounded-full bg-slate-200 w-10/12" />
                        <div className="h-3 rounded-full bg-slate-200 w-9/12" />
                      </div>
                    ) : (
                      <p className="text-[13px] text-slate-500">Tóm tắt đang được tạo từ nội dung tài liệu.</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-gray-800">Khái niệm trọng tâm</h4>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Extract</span>
                    </div>
                    {conceptItems.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {conceptItems.map((concept) => {
                          const badgeClass = concept.category === 'advanced'
                            ? 'text-orange-600 bg-orange-50'
                            : concept.category === 'applied'
                              ? 'text-emerald-600 bg-emerald-50'
                              : 'text-blue-600 bg-blue-50';
                          return (
                            <div key={concept.id} className="border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-[#3B66F5] transition-colors cursor-pointer">
                              <p className={`inline-flex rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wider ${badgeClass}`}>
                                {concept.category}
                              </p>
                              <p className="mt-2 font-bold text-gray-900 text-[13px]">{concept.label}</p>
                              <p className="text-[11px] text-slate-400 mt-1">Độ nổi bật: {Math.round(concept.score * 100)}%</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : ingestionLoading || ingestion?.status !== 'completed' ? (
                      <div className="grid grid-cols-2 gap-4">
                        {[0, 1, 2, 3].map((index) => (
                          <div key={index} className="border border-gray-100 rounded-2xl p-4 shadow-sm animate-pulse">
                            <div className="h-4 w-16 rounded-full bg-slate-200" />
                            <div className="mt-3 h-3 w-24 rounded-full bg-slate-200" />
                            <div className="mt-2 h-3 w-20 rounded-full bg-slate-200" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] text-slate-500">Chưa có khái niệm nào được trích xuất.</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quiz Generation</p>
                        <h4 className="text-sm font-bold text-slate-800">Bài kiểm tra tự động</h4>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${quizAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {quizAvailable ? 'Sẵn sàng' : 'Đang chuẩn bị'}
                      </span>
                    </div>
                    <p className="mt-3 text-[13px] text-slate-500">
                      {quizAvailable
                        ? `Đã tạo ${ingestion?.quiz_questions_count || 0} câu hỏi trắc nghiệm để luyện tập ngay.`
                        : 'Hệ thống sẽ tạo bài kiểm tra sau khi hoàn tất tóm tắt và khái niệm.'}
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenQuiz}
                      disabled={!quizAvailable}
                      className="mt-4 w-full rounded-xl bg-[#3B66F5] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-60"
                    >
                      Bắt đầu làm bài
                    </button>
                  </div>
                </>
              )}

              {/* Questions View (Hỏi AI) */}
              {activeTab === 'questions' && (
                <div className="h-[calc(100vh-250px)] overflow-hidden">
                  <AIQAPanel 
                    documentId={parsedId}
                    currentUserId={currentUserId}
                    highlightText={selectedText}
                  />
                </div>
              )}

              {/* Discussion View */}
              {activeTab === 'discussion' && (
                <div className="flex flex-col h-full bg-white relative">
                  {!(document.is_public || isOwner || true) ? (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-sm text-slate-500">Bạn không có quyền tham gia thảo luận.</p>
                    </div>
                  ) : (
                    <>
                      {/* List */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-5 min-h-[300px]">
                        {discLoading ? (
                          <div className="flex justify-center items-center h-full">
                            <div className="w-6 h-6 border-2 border-[#3B66F5] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : discussions.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                            <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            <p className="text-sm text-slate-500 font-medium">Chưa có bình luận nào.<br />Hãy bắt đầu thảo luận!</p>
                          </div>
                        ) : (
                          discussions.map(disc => (
                            <div key={disc.id} className="flex gap-3 group animate-fade-in">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                                {disc.user ? getInitials(disc.user.full_name) : 'A'}
                              </div>
                              <div className="flex-1">
                                <div className="bg-[#F8FAFF] rounded-2xl rounded-tl-sm px-4 py-2.5 inline-block w-full">
                                  <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-bold text-[13px] text-slate-800">{disc.user?.full_name || 'Ẩn danh'}</span>
                                  </div>
                                  <p className="text-[13px] text-slate-700 leading-relaxed">{disc.content}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-4 mt-1.5 ml-2 text-[11px] font-bold text-slate-500 relative">
                                  <span className="font-normal opacity-70">{timeAgo(disc.created_at)}</span>

                                  <div className="relative group/reaction">
                                    <button onClick={() => handleReaction(disc.id, '👍')} className={`hover:text-[#3B66F5] transition-colors py-1 ${reactions[disc.id] ? 'text-[#3B66F5]' : ''}`}>
                                      {reactions[disc.id] ? `${reactions[disc.id]} Thích` : 'Thích'}
                                    </button>
                                    {/* Facebook style reactions */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-1 hidden group-hover/reaction:block z-10">
                                      <div className="flex bg-white shadow-[0_5px_15px_rgba(0,0,0,0.15)] rounded-full px-2 py-1 gap-1 border border-slate-100 animate-slide-up">
                                        <button onClick={() => handleReaction(disc.id, '👍')} className="w-8 h-8 hover:scale-125 transition-transform origin-bottom text-xl leading-none">👍</button>
                                        <button onClick={() => handleReaction(disc.id, '❤️')} className="w-8 h-8 hover:scale-125 transition-transform origin-bottom text-xl leading-none">❤️</button>
                                        <button onClick={() => handleReaction(disc.id, '😂')} className="w-8 h-8 hover:scale-125 transition-transform origin-bottom text-xl leading-none">😂</button>
                                        <button onClick={() => handleReaction(disc.id, '😮')} className="w-8 h-8 hover:scale-125 transition-transform origin-bottom text-xl leading-none">😮</button>
                                        <button onClick={() => handleReaction(disc.id, '😢')} className="w-8 h-8 hover:scale-125 transition-transform origin-bottom text-xl leading-none">😢</button>
                                      </div>
                                    </div>
                                  </div>

                                  <button onClick={() => setReplyingTo(replyingTo === disc.id ? null : disc.id)} className="hover:text-[#3B66F5] transition-colors">Phản hồi</button>
                                </div>

                                {/* Replies */}
                                {disc.replies && disc.replies.length > 0 && (
                                  <div className="mt-3 space-y-3">
                                    {disc.replies.map(reply => (
                                      <div key={reply.id} className="flex gap-2.5">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px] shrink-0">
                                          {reply.user ? getInitials(reply.user.full_name) : 'A'}
                                        </div>
                                        <div className="flex-1">
                                          <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-3 py-2 inline-block">
                                            <span className="font-bold text-xs text-slate-800 mr-2">{reply.user?.full_name || 'Ẩn danh'}</span>
                                            <span className="text-[13px] text-slate-700">{reply.content}</span>
                                          </div>
                                          <div className="flex items-center gap-3 mt-1 ml-2 text-[10px] font-bold text-slate-500">
                                            <span className="font-normal opacity-70">{timeAgo(reply.created_at)}</span>
                                            <button className="hover:text-[#3B66F5]">Thích</button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Reply Input */}
                                {replyingTo === disc.id && (
                                  <div className="mt-3 flex gap-2">
                                    <input
                                      autoFocus
                                      placeholder="Viết phản hồi..."
                                      className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-[13px] outline-none focus:border-[#3B66F5] focus:bg-white transition-all"
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(disc.id)}
                                    />
                                    <button
                                      onClick={() => handleReplySubmit(disc.id)}
                                      disabled={!replyContent.trim()}
                                      className="bg-[#3B66F5] text-white p-2 rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors"
                                    >
                                      <svg className="w-4 h-4 -rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Main Input */}
                      <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                        <div className="flex items-center gap-2 relative">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(false)}
                            placeholder="Thêm bình luận..."
                            className="w-full bg-[#F4F7FE] rounded-full border border-transparent px-4 py-3 pr-12 text-[13px] font-medium outline-none focus:border-[#3B66F5] focus:bg-white transition-all placeholder:text-slate-400"
                          />
                          <button
                            onClick={() => handleCommentSubmit(false)}
                            disabled={!newComment.trim()}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-[#3B66F5] text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:bg-slate-300"
                          >
                            <svg className="w-4 h-4 -rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Flashcards View */}
              {activeTab === 'flashcards' && (
                <div className="flex flex-col h-full">
                  <div className="text-center text-gray-500 text-sm mt-10">
                    Tính năng Sơ đồ / Flashcards đang được phát triển...
                  </div>
                </div>
              )}
            </div>

            {/* Bottom action */}
            {activeTab === 'info' && (
              <div className="p-6 border-t border-gray-100 bg-white">
                <button className="w-full flex items-center justify-center gap-2 border-2 border-gray-100 rounded-2xl py-3.5 text-sm font-bold text-[#3B66F5] hover:border-[#3B66F5] hover:bg-blue-50/50 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                  Tạo Flashcard từ nội dung này
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <ShareModal
        isOpen={isShareOpen}
        document={document}
        onClose={() => setIsShareOpen(false)}
        onShareSuccess={() => { }}
      />
    </div>
  );
};

export default DocumentDetailPage;
