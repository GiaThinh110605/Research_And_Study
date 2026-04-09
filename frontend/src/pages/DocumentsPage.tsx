import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DocumentCard from '../components/documents/DocumentCard';
import ShareModal from '../components/documents/ShareModal';
import { authService } from '../services/auth';
import {
  documentService,
  DocumentItem,
  DocumentQueryParams,
  ShareItem,
} from '../services/documents';

const PAGE_SIZE = 12;

type SortOption = 'newest' | 'oldest' | 'title_asc';
type ViewMode = 'grid' | 'list';

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
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
  const [shareTargetEmail, setShareTargetEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit' | 'comment'>('view');
  const [shareItems, setShareItems] = useState<ShareItem[]>([]);
  const [shareError, setShareError] = useState('');
  const [isSharing, setIsSharing] = useState(false);

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

  const documentStats = useMemo(() => {
    const newCount = documents.filter((doc) => {
      const created = new Date(doc.created_at).getTime();
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return created >= sevenDaysAgo;
    }).length;

    const topSubject = documents.reduce<Record<string, number>>((acc, doc) => {
      const key = doc.subject || 'Chưa phân loại';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const popularSubject =
      Object.entries(topSubject).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Toán cao cấp A1';

    return {
      newCount,
      popularSubject,
    };
  }, [documents]);

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
    setIsLoggedIn(Boolean(localStorage.getItem('token')));
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!isLoggedIn) {
        setCurrentUserId(null);
        return;
      }

      try {
        const me = await authService.getCurrentUser();
        setCurrentUserId(me.id ?? null);
      } catch {
        setCurrentUserId(null);
      }
    };

    bootstrap();
  }, [isLoggedIn]);

  const openDetail = (documentId: number) => {
    navigate(`/tai-lieu/${documentId}`);
  };

  const openShare = async (doc: DocumentItem) => {
    setShareError('');
    setShareItems([]);
    setSelectedDocument(doc);
    setIsShareOpen(true);
    try {
      const shares = await documentService.listShares(doc.id);
      setShareItems(shares);
    } catch (err: any) {
      setShareError(err.response?.data?.detail || 'Không thể tải danh sách chia sẻ.');
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocument) return;

    if (!shareTargetEmail.trim()) {
      setShareError('Vui lòng nhập email người nhận.');
      return;
    }

    setIsSharing(true);
    setShareError('');
    try {
      await documentService.share(selectedDocument.id, {
        shared_with_email: shareTargetEmail.trim(),
        permission: sharePermission,
      });
      setShareTargetEmail('');
      const shares = await documentService.listShares(selectedDocument.id);
      setShareItems(shares);
    } catch (err: any) {
      setShareError(err.response?.data?.detail || 'Chia sẻ tài liệu thất bại.');
    } finally {
      setIsSharing(false);
    }
  };

  const closeShareModal = () => {
    setIsShareOpen(false);
    setSelectedDocument(null);
    setShareError('');
    setShareTargetEmail('');
    setSharePermission('view');
    setShareItems([]);
  };

  const openUpload = () => {
    if (!isLoggedIn) {
      setError('Vui lòng đăng nhập để tải tài liệu.');
      return;
    }
    navigate('/tai-lieu/tai-len');
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#F4F7FE] font-sans text-slate-900">
      <aside className="w-[260px] bg-white border-r flex flex-col h-full shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-gray-50">
          <div className="w-10 h-10 bg-blue-600 rounded-xl text-white flex items-center justify-center font-bold text-xl">U</div>
          <div>
            <h1 className="text-xl font-bold text-blue-900 leading-none mb-1">UniStudy</h1>
            <p className="text-[10px] font-bold text-gray-500 tracking-wider">IUH STUDENT PORTAL</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50">TRANG CHỦ</Link>
          <Link to="/tai-lieu" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white bg-[#3B66F5] rounded-xl shadow-md shadow-blue-200">THƯ VIỆN</Link>
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50">BÀI KIỂM TRA</Link>
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50">FLASHCARD</Link>
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50">GPA</Link>
          <Link to="/thao-luan" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50">THẢO LUẬN</Link>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50">LIÊN KẾT IUH</Link>
        </nav>

        <div className="p-4 border-t border-gray-50 space-y-2">
          <button onClick={openUpload} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B66F5] px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">Tải tài liệu lên</button>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 rounded-xl hover:bg-slate-50">HỖ TRỢ</Link>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600">ĐĂNG XUẤT</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="h-20 bg-white border-b flex justify-between items-center px-8 shrink-0">
          <div className="relative w-[420px]">
            <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu, giáo trình, bài tập..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-gray-100 bg-gray-50 pl-11 pr-4 py-2.5 text-sm outline-none focus:border-[#3B66F5] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-600">🔔</button>
            <button className="text-gray-400 hover:text-gray-600">⚙️</button>
            <div className="text-sm font-semibold text-slate-700">{isLoggedIn ? 'Người dùng IUH' : 'Khách'}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6 rounded-2xl bg-[#2F63D9] p-6 text-white">
                <h2 className="text-3xl font-black mb-2">Thư viện Tài liệu</h2>
                <p className="text-blue-100 text-sm mb-5">Khám phá kho tàng kiến thức với hơn 10,000+ tài liệu được đóng góp từ cộng đồng sinh viên IUH.</p>
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white/10 px-4 py-3">
                    <p className="text-2xl font-black">{(total / 1000).toFixed(1)}k</p>
                    <p className="text-xs text-blue-100">Lượt tải hôm nay</p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-4 py-3">
                    <p className="text-2xl font-black">{documentStats.newCount}</p>
                    <p className="text-xs text-blue-100">Tài liệu mới</p>
                  </div>
    <>
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 rounded-2xl bg-[#2F63D9] p-6 text-white">
              <h2 className="text-3xl font-black mb-2">Thư viện Tài liệu</h2>
              <p className="text-blue-100 text-sm mb-5">Khám phá kho tàng kiến thức với hơn 10,000+ tài liệu được đóng góp từ cộng đồng sinh viên IUH.</p>
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="text-2xl font-black">{(total / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-blue-100">Lượt tải hôm nay</p>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="text-2xl font-black">{documentStats.newCount}</p>
                  <p className="text-xs text-blue-100">Tài liệu mới</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 rounded-2xl bg-white border border-gray-100 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Phổ biến</p>
              <p className="mt-5 text-sm font-semibold text-slate-600 uppercase">{documentStats.popularSubject}</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{total.toLocaleString('vi-VN')}</p>
              <p className="text-xs text-slate-400">lượt xem</p>
            </div>

            <div className="lg:col-span-3 rounded-2xl bg-[#0F172A] p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Yêu thích</p>
              <p className="mt-5 text-sm font-semibold uppercase text-slate-200">Lập trình C++</p>
              <p className="text-3xl font-black mt-1">{Math.max(1000, total * 3).toLocaleString('vi-VN')}</p>
              <p className="text-xs text-slate-400">lượt tải</p>
            </div>
          </div>

          <section className="rounded-2xl bg-white border border-gray-100 p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900">Phân loại môn học</h3>
              <button
                onClick={() => {
                  setSubjectFilter('Tất cả tài liệu');
                  setCurrentPage(1);
                }}
                className="text-sm font-semibold text-[#3B66F5] hover:underline"
              >
                Xem tất cả
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {subjectOptions.map((subjectOption) => (
                <button
                  key={subjectOption}
                  onClick={() => {
                    setSubjectFilter(subjectOption);
                    setCurrentPage(1);
                  }}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                    subjectFilter === subjectOption
                      ? 'bg-[#3B66F5] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {subjectOption}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Sắp xếp</div>
                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value as SortOption);
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="title_asc">Tên A-Z</option>
                </select>

                <select
                  value={fileTypeFilter}
                  onChange={(e) => {
                    setFileTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  {fileTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'Tất cả định dạng' : type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-md px-3 py-2 text-sm font-semibold ${
                    viewMode === 'grid' ? 'bg-[#3B66F5] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`rounded-md px-3 py-2 text-sm font-semibold ${
                    viewMode === 'list' ? 'bg-[#3B66F5] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Hiển thị <span className="font-bold text-slate-900">{visibleStart}-{visibleEnd}</span> trong <span className="font-bold text-slate-900">{total}</span> tài liệu
            </p>
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-64 animate-pulse rounded-2xl border border-slate-100 bg-white" />
              ))}
            </div>
          ) : documents.length > 0 ? (
            <>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4' : 'space-y-3'}>
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

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 disabled:opacity-50"
                  >
                    ‹
                  </button>

                  {pageButtons.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`h-9 w-9 rounded-md text-sm font-semibold ${
                        currentPage === page
                          ? 'bg-[#3B66F5] text-white shadow-md shadow-blue-200'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 disabled:opacity-50"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h3 className="text-xl font-bold text-slate-800">Không tìm thấy tài liệu phù hợp</h3>
              <p className="mt-2 text-slate-500">Thử đổi từ khóa, bộ lọc môn học hoặc định dạng file.</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={openUpload}
        className="fixed bottom-7 right-7 h-14 w-14 rounded-full bg-[#3B66F5] text-white shadow-xl shadow-blue-300 transition-transform hover:scale-105"
      >
        +
      </button>

      <ShareModal
        isOpen={isShareOpen}
        document={selectedDocument}
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
    </>
  );
};

export default DocumentsPage;
