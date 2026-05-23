import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import { documentService } from '../../services/documents';
import { X, Upload, FileText, Check, AlertCircle, Sparkles } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

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

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
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

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem('token')));
  }, [isOpen]);

  // Reset form state when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setSubject(subjectOptions[0]);
      setDescription('');
      setIsPublic(true);
      setFile(null);
      setUploadError('');
      setSuccessMessage('');
      setUploadProgress(0);
      setIsUploading(false);
    }
  }, [isOpen]);

  const selectedFileDisplay = useMemo(() => {
    if (!file) return 'Kéo và thả tệp vào đây';
    return `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
  }, [file]);

  const fileBadge = useMemo(() => getFileBadge(file?.name), [file]);

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
    
    // Automatically set title to file name (without extension) if title is empty
    if (!title) {
      const nameWithoutExt = candidate.name.substring(0, candidate.name.lastIndexOf('.')) || candidate.name;
      setTitle(nameWithoutExt);
    }
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
      setSuccessMessage('Tải tài liệu thành công! Đang chuẩn bị chuyển hướng...');
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      setRedirectCountdown(3);
      const countdownInterval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Upload size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                Tải tài liệu lên
                <Sparkles size={16} className="text-indigo-500 animate-pulse" />
              </h2>
              <p className="text-xs font-semibold text-slate-400">Đóng góp kiến thức cho học tập thông minh</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Drag & Drop Zone */}
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
              className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                isDragging 
                  ? 'border-indigo-500 bg-indigo-50/60 scale-[0.99]' 
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
                {file ? (
                  <FileText className="h-7 w-7 text-indigo-600" />
                ) : (
                  <Upload className="h-7 w-7 text-indigo-500 animate-bounce" />
                )}
              </div>
              
              <div className={`mx-auto mb-3 inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${fileBadge.color}`}>
                {fileBadge.label}
              </div>
              <p className="text-base font-black text-slate-800">{selectedFileDisplay}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Hỗ trợ PDF, DOCX, PPTX, XLSX, TXT (Tối đa {maxUploadMb}MB)
              </p>

              <label className="mt-4 inline-flex cursor-pointer rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 active:scale-95">
                Chọn tệp từ máy
                <input
                  type="file"
                  className="hidden"
                  onChange={(event) => applyFile(event.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* Upload Progress Bar */}
            {(isUploading || uploadProgress > 0) && (
              <div className={`rounded-2xl border p-4 transition-all duration-300 ${uploadProgress >= 100 ? 'border-emerald-100 bg-emerald-50/50' : 'border-indigo-100 bg-indigo-50/50'}`}>
                <div className="flex items-center justify-between text-xs font-black">
                  <span className={uploadProgress >= 100 ? 'text-emerald-700' : 'text-indigo-700'}>
                    {uploadProgress >= 100 ? '✓ Tải lên thành công' : `Đang tải lên... ${uploadProgress}%`}
                  </span>
                  <span className={uploadProgress >= 100 ? 'text-emerald-600' : 'text-indigo-600'}>
                    {uploadProgress >= 100 ? 'Đang chuẩn bị AI Pipeline' : 'AI Pipeline đang tải'}
                  </span>
                </div>
                <div className="mt-2.5 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${uploadProgress >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Input fields */}
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">Tiêu đề tài liệu</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ví dụ: Đề cương Kinh tế vi mô Chương 1-3"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">Môn học</label>
                  <select
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold text-sm cursor-pointer"
                  >
                    {subjectOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">Quyền riêng tư</label>
                  <div className="flex rounded-xl border border-slate-200 bg-slate-50/50 p-1">
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`flex-1 rounded-lg py-2 text-xs font-black transition-all ${
                        isPublic ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Công khai
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`flex-1 rounded-lg py-2 text-xs font-black transition-all ${
                        !isPublic ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Riêng tư
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">Mô tả chi tiết</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  placeholder="Mô tả ngắn gọn về nội dung tài liệu..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold text-sm"
                />
              </div>
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-sm font-bold text-red-700">{uploadError}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-bold text-emerald-700">
                  {successMessage}{redirectCountdown > 0 && ` (${redirectCountdown}s)`}
                </span>
              </div>
            )}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 shrink-0 flex items-center justify-end gap-3 rounded-b-[32px]">
          <button 
            type="button"
            onClick={onClose} 
            disabled={isUploading}
            className="rounded-xl px-5 py-3 text-xs font-black text-slate-500 hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-black text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-60 active:scale-95 transition-all"
          >
            {isUploading ? 'Đang tải lên...' : 'Tải tài liệu lên ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
