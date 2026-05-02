import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import ShareModal from '../components/documents/ShareModal';
import { authService } from '../services/auth';
import { documentService, DocumentItem, ShareItem } from '../services/documents';
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
    <div className="flex h-[calc(100vh)] bg-white font-sans text-slate-900 overflow-hidden">
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Top Header */}
        <div className="h-[72px] bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-sm text-gray-500 font-bold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>
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
          {/* Left: Document Viewer */}
          <div className="flex-1 h-full overflow-y-auto p-8 bg-[#F8FAFF]">
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full overflow-hidden">
                {document.file_type.toUpperCase() === 'PDF' ? (
                  <iframe title="PDF Viewer" src={fileUrl} className="w-full h-full" />
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-8">
                    <div>
                      <p className="text-lg font-bold text-slate-700">Tài liệu không phải PDF</p>
                      <p className="mt-2 text-sm text-slate-500">Hệ thống vẫn hỗ trợ tải về và đọc bằng ứng dụng tương ứng.</p>
                      <a href={fileUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl bg-[#3B66F5] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-600 transition-colors">Tải tài liệu gốc</a>
                    </div>
                  </div>
                )}
             </div>
          </div>

          {/* Right: Sidebar */}
          <div className="w-[400px] bg-white h-full overflow-hidden border-l border-gray-100 flex flex-col shrink-0">
            {/* Tabs */}
            <div className="flex items-center justify-between px-6 pt-5 border-b border-gray-100">
               <button 
                  onClick={() => setActiveTab('info')} 
                  className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'info' ? 'border-[#3B66F5] text-[#3B66F5]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
               >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  Tóm tắt
               </button>
               <button 
                  onClick={() => setActiveTab('flashcards')} 
                  className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'flashcards' ? 'border-[#3B66F5] text-[#3B66F5]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
               >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  Sơ đồ
               </button>
               <button 
                  onClick={() => setActiveTab('discussion')} 
                  className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'discussion' ? 'border-[#3B66F5] text-[#3B66F5]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
               >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Thảo luận
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
               {/* Summary View */}
               {activeTab === 'info' && (
                  <>
                     <div className="bg-[#F8FAFF] rounded-2xl p-6 border border-blue-50">
                        <div className="flex justify-between items-center mb-5">
                           <h4 className="text-sm font-bold text-gray-800">AI Tóm tắt nội dung</h4>
                           <span className="bg-[#5E6AD2] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Premium</span>
                        </div>
                        <ul className="space-y-4 text-[13px] text-gray-600 font-medium leading-relaxed">
                           <li className="flex gap-2.5"><span className="text-[#3B66F5] mt-0.5">•</span> Định nghĩa đạo hàm riêng theo từng biến số khi các biến còn lại được giữ nguyên.</li>
                           <li className="flex gap-2.5"><span className="text-[#3B66F5] mt-0.5">•</span> Quy tắc tính đạo hàm tương tự hàm một biến nhưng cần chú ý biến hằng.</li>
                           <li className="flex gap-2.5"><span className="text-[#3B66F5] mt-0.5">•</span> Công thức vi phân toàn phần và ứng dụng trong tính gần đúng.</li>
                        </ul>
                     </div>

                     <div>
                        <h4 className="text-sm font-bold text-gray-800 mb-4">Khái niệm trọng tâm</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-[#3B66F5] transition-colors cursor-pointer group">
                              <p className="text-[10px] font-black text-[#3B66F5] uppercase tracking-wider mb-1.5 group-hover:text-[#2A52D5]">Cơ bản</p>
                              <p className="font-bold text-gray-900 text-[13px]">Biến hằng</p>
                           </div>
                           <div className="border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-orange-500 transition-colors cursor-pointer group">
                              <p className="text-[10px] font-black text-orange-500 uppercase tracking-wider mb-1.5 group-hover:text-orange-600">Nâng cao</p>
                              <p className="font-bold text-gray-900 text-[13px]">Vi phân TP</p>
                           </div>
                           <div className="border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-emerald-500 transition-colors cursor-pointer group">
                              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider mb-1.5 group-hover:text-emerald-600">Ứng dụng</p>
                              <p className="font-bold text-gray-900 text-[13px]">Cực trị</p>
                           </div>
                           <div className="border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-purple-500 transition-colors cursor-pointer group">
                              <p className="text-[10px] font-black text-purple-500 uppercase tracking-wider mb-1.5 group-hover:text-purple-600">Đồ thị</p>
                              <p className="font-bold text-gray-900 text-[13px]">Mặt cong</p>
                           </div>
                        </div>
                     </div>

                     <div className="flex-1 flex flex-col min-h-[160px]">
                        <h4 className="text-sm font-bold text-gray-800 mb-3">Ghi chú của bạn</h4>
                        <div className="flex-1 border border-gray-200 rounded-2xl bg-gray-50/50 p-4 flex flex-col focus-within:border-[#3B66F5] focus-within:bg-white transition-all shadow-sm">
                           <textarea 
                              placeholder="Viết ghi chú nhanh về trang này..."
                              className="w-full flex-1 bg-transparent resize-none outline-none text-[13px] text-gray-700 placeholder:text-gray-400 font-medium"
                           />
                           <button className="self-end text-[#3B66F5] text-sm font-bold hover:text-blue-700">Lưu</button>
                        </div>
                     </div>
                  </>
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
                                    <p className="text-sm text-slate-500 font-medium">Chưa có bình luận nào.<br/>Hãy bắt đầu thảo luận!</p>
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
        onShareSuccess={() => {}}
      />
    </div>
  );
};

export default DocumentDetailPage;
