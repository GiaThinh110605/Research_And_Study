import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { documentService, DocumentItem } from '../services/documents';

const allowedExtensions = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt']);
const maxUploadMb = 10;
const maxFileSize = maxUploadMb * 1024 * 1024;

const subjectOptions = [
  'Toán học',
  'Vật lý',
  'CNTT & Lập trình',
  'Kinh tế',
  'Ngoại ngữ',
  'Cơ khí',
  'Triết học',
];

const pipelineSteps = [
  { id: 'upload', label: 'Tiếp nhận' },
  { id: 'chunk', label: 'Chunking' },
  { id: 'concept', label: 'Khái niệm' },
  { id: 'summary', label: 'Tóm tắt' },
  { id: 'quiz', label: 'Quiz' },
];

const getFileBadge = (fileName?: string) => {
  if (!fileName) return { label: 'FILE', color: 'bg-slate-200 text-slate-600' };
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  if (extension === 'pdf') return { label: 'PDF', color: 'bg-red-100 text-red-600' };
  if (extension === 'doc' || extension === 'docx') return { label: 'DOC', color: 'bg-blue-100 text-blue-700' };
  if (extension === 'ppt' || extension === 'pptx') return { label: 'PPT', color: 'bg-orange-100 text-orange-700' };
  if (extension === 'xls' || extension === 'xlsx') return { label: 'XLS', color: 'bg-emerald-100 text-emerald-700' };
  if (extension === 'txt') return { label: 'TXT', color: 'bg-slate-200 text-slate-700' };
  return { label: extension.toUpperCase() || 'FILE', color: 'bg-slate-200 text-slate-600' };
};

const DocumentsUploadPage: React.FC = () => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('token')));
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(subjectOptions[0]);
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  const [uploadedThisMonth, setUploadedThisMonth] = useState(0);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem('token')));
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      if (!isLoggedIn) return;

      try {
        const me = await authService.getCurrentUser();
        const response = await documentService.list({ page: 1, page_size: 100, sort: 'newest' });
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const count = response.items.filter((doc: DocumentItem) => {
          return doc.uploader_id === me.id && new Date(doc.created_at).getTime() >= monthStart.getTime();
        }).length;

        setUploadedThisMonth(count);
      } catch {
        setUploadedThisMonth(0);
      }
    };

    loadStats();
  }, [isLoggedIn]);

  const selectedFileDisplay = useMemo(() => {
    if (!file) return 'Kéo và thả tệp vào đây';
    return `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
  }, [file]);

  const fileBadge = useMemo(() => getFileBadge(file?.name), [file]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const validateFile = (candidate: File) => {
    const extension = candidate.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.has(extension)) {
      return 'Định dạng tệp không được hỗ trợ (PDF, DOCX, PPTX, XLSX, TXT).';
    }

    if (candidate.size > maxFileSize) {
      return `Kích thước tệp vượt quá ${maxUploadMb}MB.`;
    }

    return '';
  };

  const applyFile = (candidate: File | null) => {
    setUploadError('');
    setSuccessMessage('');

    if (!candidate) {
      setFile(null);
      return;
    }

    const validationError = validateFile(candidate);
    if (validationError) {
      setFile(null);
      setUploadError(validationError);
      return;
    }

    setFile(candidate);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isLoggedIn) {
      setUploadError('Vui lòng đăng nhập để tải tài liệu.');
      return;
    }

    if (!file) {
      setUploadError('Bạn chưa chọn tệp tài liệu.');
      return;
    }

    if (!title.trim()) {
      setUploadError('Vui lòng nhập tiêu đề tài liệu.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');
    setSuccessMessage('');

    try {
      const created = await documentService.upload(
        {
          title: title.trim(),
          description: description.trim(),
          subject,
          is_public: isPublic,
          file,
        },
        (percent) => setUploadProgress(percent),
      );

      setUploadProgress(100);
      setSuccessMessage('Tải tài liệu thành công! Đang chuyển tới trang chi tiết...');
      setRedirectCountdown(3);
      const countdownInterval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            navigate(`/tai-lieu/${created.id}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setUploadProgress(0);
      const detail = err.response?.data?.detail;
      if (err.message?.includes('Network Error')) {
        setUploadError('Mất kết nối mạng. Vui lòng kiểm tra và thử lại.');
      } else if (err.response?.status === 413) {
        setUploadError('Tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 10MB.');
      } else {
        setUploadError(detail || 'Tải tài liệu thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="p-6 md:p-8"
      style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(207, 233, 255, 0.55), transparent 35%), radial-gradient(circle at 90% 10%, rgba(255, 228, 205, 0.5), transparent 40%)' }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-5">
          <div>
            <h2 className="text-4xl font-black text-slate-900">Tải tài liệu lên</h2>
            <p className="mt-2 text-slate-500">Chia sẻ tài liệu học tập của bạn để giúp đỡ cộng đồng sinh viên IUH.</p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                const dropped = event.dataTransfer.files?.[0] || null;
                applyFile(dropped);
              }}
              className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                {file ? (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 2.5L18.5 9H14z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.8-1.2A4 4 0 1 1 17 18H7z" />
                  </svg>
                )}
              </div>
              <div className={`mx-auto mb-3 inline-flex items-center rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wider ${fileBadge.color}`}>
                {fileBadge.label}
              </div>
              <p className="text-lg font-bold text-slate-800">{selectedFileDisplay}</p>
              <p className="mt-1 text-sm text-slate-500">Hỗ trợ PDF, DOCX, PPTX, XLSX, TXT (Tối đa {maxUploadMb}MB)</p>

              <label className="mt-4 inline-flex cursor-pointer rounded-xl bg-[#3B66F5] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Chọn tệp từ máy
                <input
                  type="file"
                  className="hidden"
                  onChange={(event) => applyFile(event.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="mt-5 space-y-4">
              {(isUploading || uploadProgress > 0) && (
                <div className={`rounded-xl border px-4 py-3 transition-all duration-300 ${uploadProgress >= 100 ? 'border-emerald-200 bg-emerald-50' : 'border-blue-100 bg-blue-50'}`}>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={uploadProgress >= 100 ? 'text-emerald-700' : 'text-blue-700'}>
                      {uploadProgress >= 100 ? '✓ Tải lên hoàn tất' : `Đang tải lên... ${uploadProgress}%`}
                    </span>
                    <span className={uploadProgress >= 100 ? 'text-emerald-600' : 'text-blue-600'}>
                      {uploadProgress >= 100 ? 'AI Pipeline đang khởi chạy' : 'AI Pipeline đang chuẩn bị'}
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 rounded-full bg-blue-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${uploadProgress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Tiêu đề tài liệu</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ví dụ: Đề cương Kinh tế vi mô Chương 1-3"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-[#3B66F5] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Môn học</label>
                  <select
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-[#3B66F5] focus:bg-white"
                  >
                    {subjectOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Quyền riêng tư</label>
                  <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold ${
                        isPublic ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Công khai
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold ${
                        !isPublic ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Riêng tư
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Mô tả chi tiết</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="Mô tả ngắn gọn về nội dung tài liệu..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-[#3B66F5] focus:bg-white"
                />
              </div>
            </div>

            {uploadError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 flex items-start gap-2.5">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm text-red-700">{uploadError}</span>
              </div>
            )}
            {successMessage && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-start gap-2.5">
                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm text-emerald-700">{successMessage}{redirectCountdown > 0 && ` (${redirectCountdown}s)`}</span>
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-3">
              <Link to="/tai-lieu" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100">Hủy bỏ</Link>
              <button
                type="submit"
                disabled={isUploading}
                className="rounded-xl bg-[#3B66F5] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-60"
              >
                {isUploading ? 'Đang tải lên...' : 'Tải tài liệu lên ngay'}
              </button>
            </div>
          </form>
        </div>

        <div className="xl:col-span-4 space-y-4">
          <div className="rounded-2xl bg-[#EEF3FB] p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-600">Quy định tải lên</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>• Tài liệu phải thuộc sở hữu cá nhân hoặc có quyền chia sẻ.</li>
              <li>• Không chứa nội dung vi phạm pháp luật hoặc thuần phong mỹ tục.</li>
              <li>• Khuyến khích tài liệu có chất lượng hình ảnh và nội dung tốt.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">AI Study Loop</h3>
            <p className="mt-3 text-sm text-slate-500">Tài liệu được đưa vào pipeline học tập tự động ngay sau khi tải lên.</p>
            <div className="mt-4 grid gap-3">
              {pipelineSteps.map((step, index) => {
                const stepActive = isUploading || uploadProgress > 0;
                const stepDone = uploadProgress >= 100 && index === 0;
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={`h-7 w-7 rounded-full border text-[11px] font-black flex items-center justify-center transition-all duration-300 ${stepDone ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : stepActive ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                      {stepDone ? '✓' : index + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-[13px] font-semibold transition-colors duration-300 ${stepDone ? 'text-emerald-700' : 'text-slate-700'}`}>{step.label}</p>
                      <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${stepDone ? 'bg-emerald-500' : stepActive && index === 0 ? 'bg-blue-500' : 'bg-slate-200'}`}
                          style={{ width: stepDone ? '100%' : stepActive && index === 0 ? `${uploadProgress}%` : '20%' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Hoạt động của bạn</h3>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase text-blue-700">Tháng này</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">Đã tải lên</p>
            <p className="text-4xl font-black text-slate-900">{uploadedThisMonth}</p>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-[#3B66F5]" style={{ width: `${Math.min(100, uploadedThisMonth * 12)}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-400">Mục tiêu: 8 tài liệu chất lượng mỗi tháng.</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-[#7AA7FF] to-[#4D80F8] p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-wider">Tham gia cộng đồng</p>
            <p className="mt-2 text-lg font-black leading-tight">Nhận 50 điểm thưởng cho mỗi tài liệu chất lượng được duyệt.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsUploadPage;
