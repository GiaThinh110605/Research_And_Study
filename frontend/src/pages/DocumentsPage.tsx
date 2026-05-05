import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import DocumentCard from '../components/documents/DocumentCard';
import ShareModal from '../components/documents/ShareModal';
import { authService } from '../services/auth';
import {
  documentService,
  DocumentItem,
  DocumentQueryParams,
} from '../services/documents';
import {
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Library,
  TrendingUp,
  Star,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';

const PAGE_SIZE = 12;

type SortOption = 'newest' | 'oldest' | 'title_asc';
type ViewMode = 'grid' | 'list';

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const qParam = queryParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(qParam);

  useEffect(() => {
    setSearchQuery(qParam);
    setCurrentPage(1);
  }, [qParam]);
  const [subjectFilter, setSubjectFilter] = useState('Tất cả tài liệu');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('token')));

  const subjectOptions = useMemo(() => {
    const values = new Set<string>();
    documents.forEach((doc) => {
      if (doc.subject) values.add(doc.subject);
    });
    const dynamicSubjects = Array.from(values).sort((a, b) => a.localeCompare(b));
    const defaults = ['Toán học', 'Vật lý', 'CNTT & Lập trình', 'Kinh tế', 'Ngoại ngữ', 'Cơ khí'];
    return ['Tất cả tài liệu', ...Array.from(new Set([...dynamicSubjects, ...defaults]))];
  }, [documents]);

  const fileTypeOptions = useMemo(() => {
    const values = new Set<string>();
    documents.forEach((doc) => {
      if (doc.file_type) values.add(doc.file_type.toLowerCase());
    });
    return ['all', ...Array.from(values).sort()];
  }, [documents]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const visibleStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const visibleEnd = Math.min(total, currentPage * PAGE_SIZE);

  const pageButtons = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, totalPages];
    if (currentPage >= totalPages - 2) return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
  }, [currentPage, totalPages]);

  const loadDocuments = async (
    query?: string,
    subject?: string,
    page: number = 1,
    fileType: string = 'all',
    sort: SortOption = 'newest',
  ) => {
    setIsLoading(true);
    setError('');
    try {
      const params: DocumentQueryParams = {
        q: query || undefined,
        subject: subject && subject !== 'Tất cả tài liệu' ? subject : undefined,
        file_type: fileType !== 'all' ? fileType : undefined,
        sort,
        page,
        page_size: PAGE_SIZE,
      };
      const response = await documentService.list(params);
      setDocuments(response.items);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể tải danh sách tài liệu.');
      setDocuments([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadDocuments(searchQuery, subjectFilter, currentPage, fileTypeFilter, sortOption);
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchQuery, subjectFilter, currentPage, fileTypeFilter, sortOption]);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        setCurrentUserId(null);
        return;
      }
      setIsLoggedIn(true);
      try {
        const me = await authService.getCurrentUser();
        setCurrentUserId(me.id ?? null);
      } catch {
        setCurrentUserId(null);
      }
    };
    bootstrap();
  }, []);

  const openDetail = (documentId: number) => {
    navigate(`/tai-lieu/${documentId}`);
  };

  const openShare = (doc: DocumentItem) => {
    setSelectedDocument(doc);
    setIsShareOpen(true);
  };

  const openUpload = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/tai-lieu/tai-len');
  };

  return (
    <div className="pb-20 space-y-8">
      {/* Header Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-10 text-white shadow-xl shadow-indigo-200/50">
          <div className="relative z-10 max-w-lg space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-black tracking-widest uppercase rounded-full bg-white/20 backdrop-blur-md">
              <Library size={14} />
              Thư viện tài liệu
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight">Khám phá kho tàng kiến thức cộng đồng</h1>
            <p className="font-medium leading-relaxed text-indigo-100">
              Hơn {total.toLocaleString()} tài liệu chất lượng cao được đóng góp và chia sẻ bởi các sinh viên xuất sắc nhất.
            </p>
            <div className="flex gap-4 pt-2">
              <button onClick={openUpload} className="flex items-center gap-2 px-6 py-3 text-sm font-black text-indigo-600 transition-all bg-white shadow-lg rounded-2xl hover:bg-indigo-50 shadow-black/10 active:scale-95">
                <Plus size={18} />
                Đóng góp tài liệu
              </button>
            </div>
          </div>
          <Library size={280} className="absolute right-[-40px] bottom-[-40px] text-white/10 -rotate-12" />
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm shadow-slate-200/50 group hover:border-emerald-100 transition-all cursor-default">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 transition-transform bg-emerald-50 rounded-2xl group-hover:scale-110">
                <TrendingUp className="text-emerald-600" size={24} />
              </div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Xu hướng</span>
            </div>
            <p className="text-sm font-bold text-slate-500">Môn học phổ biến nhất</p>
            <p className="mt-1 text-2xl font-black text-slate-900 line-clamp-1">{subjectOptions[1] || 'CNTT & Lập trình'}</p>
          </div>

          <div className="bg-slate-900 p-8 rounded-[32px] shadow-xl shadow-slate-200/50 group cursor-default">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 transition-transform bg-white/10 rounded-2xl group-hover:scale-110">
                <Star className="text-amber-400" size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yêu thích</span>
            </div>
            <p className="text-sm font-bold text-slate-400">Lượt tải tài liệu tuần này</p>
            <p className="mt-1 text-3xl font-black text-white">{(total * 1.5).toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[40px] p-8 shadow-sm shadow-slate-200/50 border border-slate-100 space-y-8">
        {/* Filters & Search */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={20} />
              </button>
            </div>

            <div className="w-px h-10 mx-2 bg-slate-100" />

            <div className="flex items-center gap-3">
              <div className="relative group">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value as SortOption);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="title_asc">Tên A-Z</option>
                </select>
              </div>

              <select
                value={fileTypeFilter}
                onChange={(e) => {
                  setFileTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-6 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="all">Mọi định dạng</option>
                {fileTypeOptions.filter(t => t !== 'all').map((type) => (
                  <option key={type} value={type}>{type.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-sm font-bold text-slate-400">
              Hiển thị <span className="font-black text-slate-900">{visibleStart}-{visibleEnd}</span> trên <span className="font-black text-slate-900">{total}</span>
            </p>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-2 py-2">
          {subjectOptions.map((subject) => (
            <button
              key={subject}
              onClick={() => {
                setSubjectFilter(subject);
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-2xl text-xs font-black transition-all active:scale-95 ${subjectFilter === subject
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100 hover:border-slate-200'
                }`}
            >
              {subject}
            </button>
          ))}
        </div>

        {/* Documents Grid/List */}
        {error && (
          <div className="flex items-center gap-3 p-6 text-sm font-bold border bg-rose-50 border-rose-100 text-rose-600 rounded-3xl">
            <div className="flex items-center justify-center w-8 h-8 bg-rose-100 rounded-xl shrink-0">!</div>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-[32px] bg-slate-50 border border-slate-100" />
            ))}
          </div>
        ) : documents.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8' : 'space-y-4'}>
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                currentUserId={currentUserId}
                viewMode={viewMode}
                onOpenDetail={openDetail}
                onOpenShare={openShare}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
            <div className="flex items-center justify-center w-20 h-20 bg-white shadow-sm rounded-3xl">
              <FileText className="text-slate-300" size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black tracking-tight text-slate-800">Không có tài liệu nào</h3>
              <p className="font-medium text-slate-500">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSubjectFilter('Tất cả tài liệu');
                setFileTypeFilter('all');
              }}
              className="text-sm font-black text-indigo-600 hover:underline"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-3 transition-all bg-white border rounded-2xl border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-2">
              {pageButtons.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-11 h-11 rounded-2xl text-sm font-black transition-all ${currentPage === page
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-white border border-slate-100 text-slate-500 hover:border-indigo-100 hover:text-indigo-600'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-3 transition-all bg-white border rounded-2xl border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        document={selectedDocument}
        onClose={() => setIsShareOpen(false)}
        onShareSuccess={() => { }}
      />
    </div>
  );
};

export default DocumentsPage;
