import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DetailModal from '../components/documents/DetailModal';
import DocumentCard from '../components/documents/DocumentCard';
import ShareModal from '../components/documents/ShareModal';
import UploadModal from '../components/documents/UploadModal';
import { authService } from '../services/auth';
import {
  documentService,
  DocumentItem,
  DocumentQueryParams,
  ShareItem,
} from '../services/documents';

const allowedExtensions = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt']);
const maxFileSize = 10 * 1024 * 1024;
const PAGE_SIZE = 12;

const DocumentsPage: React.FC = () => {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('Tất cả tài liệu');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [detailError, setDetailError] = useState('');

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
    return ['Tất cả tài liệu', ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [documents]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const visibleStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const visibleEnd = Math.min(total, currentPage * PAGE_SIZE);

  const loadDocuments = async (query?: string, subject?: string, page: number = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const params: DocumentQueryParams = {
        q: query || undefined,
        subject: subject && subject !== 'Tất cả tài liệu' ? subject : undefined,
        sort: 'newest',
        page,
        page_size: PAGE_SIZE,
      };
      const response = await documentService.list(params);
      setDocuments(response.items);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Khong the tai danh sach tai lieu.');
      setDocuments([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadDocuments(searchQuery, subjectFilter, currentPage);
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchQuery, subjectFilter, currentPage]);

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

  const resetUploadForm = () => {
    setUploadTitle('');
    setUploadDescription('');
    setUploadSubject('');
    setIsPublic(true);
    setUploadFile(null);
    setUploadError('');
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Vui long chon tep truoc khi tai len.');
      return;
    }

    const extension = uploadFile.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.has(extension)) {
      setUploadError('Dinh dang tep khong duoc ho tro.');
      return;
    }

    if (uploadFile.size > maxFileSize) {
      setUploadError('Kich thuoc tep vuot qua 10MB.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    try {
      await documentService.upload({
        title: uploadTitle,
        description: uploadDescription,
        subject: uploadSubject,
        is_public: isPublic,
        file: uploadFile,
      });

      setIsUploadOpen(false);
      resetUploadForm();
      await loadDocuments(searchQuery, subjectFilter, currentPage);
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Tai tai lieu that bai.');
    } finally {
      setIsUploading(false);
    }
  };

  const openDetail = async (documentId: number) => {
    setDetailError('');
    try {
      const detail = await documentService.detail(documentId);
      setSelectedDocument(detail);
    } catch (err: any) {
      setDetailError(err.response?.data?.detail || 'Khong the tai chi tiet tai lieu.');
    }
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
      setShareError(err.response?.data?.detail || 'Khong the tai danh sach chia se.');
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocument) return;

    if (!shareTargetEmail.trim()) {
      setShareError('Vui long nhap email nguoi nhan.');
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
      setShareError(err.response?.data?.detail || 'Chia se tai lieu that bai.');
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-100">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center">
              <div className="text-2xl font-black tracking-tight text-blue-600">UniStudy</div>
            </Link>

            <nav className="hidden space-x-10 md:flex">
              <Link to="/" className="text-sm font-semibold text-gray-500 transition-colors hover:text-blue-600">Trang chủ</Link>
              <Link to="/tinh-nang" className="text-sm font-semibold text-gray-500 transition-colors hover:text-blue-600">Tính năng</Link>
              <Link to="/tai-lieu" className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600">Tài liệu</Link>
              <Link to="/cong-dong" className="text-sm font-semibold text-gray-500 transition-colors hover:text-blue-600">Cộng đồng</Link>
            </nav>

            <div className="flex items-center space-x-4">
              {isLoggedIn && (
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-5 py-2.5 text-sm font-semibold text-white transition-all bg-emerald-600 rounded-lg shadow-md hover:bg-emerald-700"
                >
                  Tai tai lieu
                </button>
              )}
              <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:text-blue-600">
                Đăng nhập
              </Link>
              <Link to="/register" className="px-5 py-2.5 text-sm font-semibold text-white transition-all bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg">
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-16 pb-12 text-center">
        <div className="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Thư viện tài liệu học thuật IUH
          </h1>
          <p className="max-w-2xl mx-auto mb-10 text-lg text-slate-600">
            Khám phá hàng ngàn đề thi, bài giảng và tài liệu chuyên ngành được chia sẻ bởi cộng đồng sinh viên Đại học Công nghiệp TP.HCM.
          </p>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="w-full py-5 pl-14 pr-6 text-lg transition-shadow bg-white border border-slate-200 rounded-full shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:shadow-md"
              placeholder="Tìm kiếm tài liệu, môn học, mã học phần..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="w-full md:w-64 shrink-0">
              <div className="bg-white border rounded-2xl border-slate-100 p-6 shadow-sm sticky top-6">
                <div className="flex items-center gap-3 mb-6">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <h3 className="font-bold text-slate-900">Bộ lọc môn học</h3>
                </div>

                <ul className="mb-8 space-y-1">
                  {subjectOptions.map((subjectOption) => (
                    <li key={subjectOption}>
                      <button
                        onClick={() => {
                          setSubjectFilter(subjectOption);
                          setCurrentPage(1);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm rounded-xl transition-colors ${
                          subjectFilter === subjectOption
                            ? 'font-semibold text-blue-700 bg-blue-50'
                            : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {subjectOption}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-600">
                  Hien thi <span className="font-bold text-slate-900">{visibleStart}-{visibleEnd}</span> trong <span className="font-bold text-slate-900">{total}</span> tai lieu
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {detailError && (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                  {detailError}
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-64 animate-pulse rounded-2xl border border-slate-100 bg-white p-5" />
                  ))}
                </div>
              ) : documents.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {documents.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        currentUserId={currentUserId}
                        onOpenDetail={openDetail}
                        onOpenShare={openShare}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Truoc
                      </button>
                      <span className="text-sm font-medium text-slate-600">
                        Trang <span className="font-bold text-slate-900">{currentPage}</span> / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <h3 className="text-xl font-bold text-slate-800">Khong tim thay tai lieu phu hop</h3>
                  <p className="mt-2 text-slate-500">Thu doi tu khoa tim kiem hoac bo loc mon hoc.</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              if (!isLoggedIn) {
                setError('Vui long dang nhap de tai tai lieu.');
                return;
              }
              setIsUploadOpen(true);
            }}
            className="fixed flex items-center justify-center w-14 h-14 text-white transition-transform bg-blue-600 rounded-full shadow-xl bottom-8 right-8 hover:bg-blue-700 hover:scale-110 shadow-blue-600/30"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </section>

      <footer className="py-8 bg-white border-t border-slate-200">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <span className="font-bold text-slate-900">UniStudy</span>
              <p className="mt-1 text-xs text-slate-500">© 2024 UniStudy. Sapphire Logic Design System.</p>
            </div>
            <div className="flex gap-6 text-sm font-medium text-slate-500">
              <Link to="/" className="hover:text-slate-900">Dieu khoan</Link>
              <Link to="/" className="hover:text-slate-900">Bao mat</Link>
              <Link to="/" className="hover:text-slate-900">Lien he</Link>
              <Link to="/" className="hover:text-slate-900">Tro giup</Link>
            </div>
          </div>
        </div>
      </footer>

      <UploadModal
        isOpen={isUploadOpen}
        uploadTitle={uploadTitle}
        uploadDescription={uploadDescription}
        uploadSubject={uploadSubject}
        isPublic={isPublic}
        uploadError={uploadError}
        isUploading={isUploading}
        onClose={() => {
          setIsUploadOpen(false);
          resetUploadForm();
        }}
        onSubmit={handleUpload}
        onChangeUploadTitle={setUploadTitle}
        onChangeUploadDescription={setUploadDescription}
        onChangeUploadSubject={setUploadSubject}
        onChangeIsPublic={setIsPublic}
        onFileChange={setUploadFile}
      />

      <DetailModal
        document={selectedDocument && !isShareOpen ? selectedDocument : null}
        apiBaseUrl={API_BASE_URL}
        onClose={() => setSelectedDocument(null)}
      />

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
    </div>
  );
};

export default DocumentsPage;
