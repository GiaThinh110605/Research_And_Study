import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { documentService, DocumentItem } from '../services/documents';

const allowedExtensions = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt']);
const maxFileSize = 50 * 1024 * 1024;

const subjectOptions = [
  'Toán học',
  'Vật lý',
  'CNTT & Lập trình',
  'Kinh tế',
  'Ngoại ngữ',
  'Cơ khí',
  'Triết học',
];

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
  const [uploadError, setUploadError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
      return 'Kích thước tệp vượt quá 50MB.';
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
    setUploadError('');
    setSuccessMessage('');

    try {
      const created = await documentService.upload({
        title: title.trim(),
        description: description.trim(),
        subject,
        is_public: isPublic,
        file,
      });

      setSuccessMessage('Tải tài liệu thành công. Hệ thống đang chuyển tới trang chi tiết.');
      navigate(`/tai-lieu/${created.id}`);
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Tải tài liệu thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
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
          <Link to="/tai-lieu" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50">THƯ VIỆN</Link>
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50">BÀI KIỂM TRA</Link>
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50">FLASHCARD</Link>
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50">GPA</Link>
          <Link to="/thao-luan" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50">THẢO LUẬN</Link>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50">LIÊN KẾT IUH</Link>
        </nav>

        <div className="p-4 border-t border-gray-50 space-y-2">
          <Link to="/tai-lieu/tai-len" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B66F5] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200">Tải tài liệu lên</Link>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 rounded-xl hover:bg-slate-50">HỖ TRỢ</Link>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600">ĐĂNG XUẤT</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="h-20 bg-white border-b flex justify-between items-center px-8 shrink-0">
          <div className="relative w-[420px]">
            <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Tìm kiếm tài liệu..." className="w-full rounded-xl border border-gray-100 bg-gray-50 pl-11 pr-4 py-2.5 text-sm outline-none focus:border-[#3B66F5] focus:bg-white" />
          </div>

          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-600">🔔</button>
            <button className="text-gray-400 hover:text-gray-600">⚙️</button>
            <div className="w-9 h-9 bg-blue-100 rounded-full" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
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
                    ☁
                  </div>
                  <p className="text-lg font-bold text-slate-800">{selectedFileDisplay}</p>
                  <p className="mt-1 text-sm text-slate-500">Hỗ trợ PDF, DOCX, PPTX, XLSX, TXT (Tối đa 50MB)</p>

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

                {uploadError && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{uploadError}</div>}
                {successMessage && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</div>}

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
      </main>
    </div>
  );
};

export default DocumentsUploadPage;
