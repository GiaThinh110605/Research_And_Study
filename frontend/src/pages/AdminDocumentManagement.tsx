import React, { useEffect, useMemo, useState } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  History, 
  Settings, 
  LogOut, 
  Search, 
  Plus,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Globe2,
  Lock,
  AlertCircle,
  BarChart,
  Cloud
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import api from '../services/api';

interface AdminOverview {
  total_documents: number;
  public_documents: number;
  private_documents: number;
  total_shares: number;
  pending_shares: number;
  approved_shares: number;
  rejected_shares: number;
}

interface AdminDocumentItem {
  id: number;
  title: string;
  description: string | null;
  subject: string | null;
  is_public: boolean;
  file_url: string;
  file_type: string;
  uploader_id: number;
  uploader_name: string | null;
  uploader_email: string | null;
  share_count: number;
  pending_share_count: number;
  approved_share_count: number;
  rejected_share_count: number;
  created_at: string;
  updated_at: string | null;
}

interface AdminDocumentListResponse {
  items: AdminDocumentItem[];
  total: number;
  page: number;
  page_size: number;
}

const PAGE_SIZE = 10;

const formatDate = (isoDate: string): string => {
  return new Date(isoDate).toLocaleDateString('vi-VN');
};

const getInitials = (name: string | null): string => {
  if (!name) {
    return 'NA';
  }
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
};

const fileTypeClass = (fileType: string): string => {
  const upper = fileType.toUpperCase();
  if (upper === 'PDF') {
    return 'bg-red-50 text-red-500';
  }
  if (upper === 'DOC' || upper === 'DOCX') {
    return 'bg-blue-50 text-blue-500';
  }
  if (upper === 'PPT' || upper === 'PPTX') {
    return 'bg-orange-50 text-orange-500';
  }
  return 'bg-slate-100 text-slate-500';
};

const AdminDocumentManagement: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [docs, setDocs] = useState<AdminDocumentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createSubject, setCreateSubject] = useState('');
  const [createIsPublic, setCreateIsPublic] = useState(true);
  const [createFile, setCreateFile] = useState<File | null>(null);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const fetchOverview = async () => {
    try {
      const response = await api.get<AdminOverview>('/api/v1/documents/admin/overview');
      setOverview(response.data);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError('Tài khoản hiện tại không có quyền admin để truy cập trang này.');
      } else if (err?.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        setError('Không tải được thống kê tài liệu.');
      }
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number | boolean> = {
        page,
        page_size: PAGE_SIZE,
        sort: 'newest',
      };

      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }
      if (subjectFilter !== 'all') {
        params.subject = subjectFilter;
      }
      if (visibilityFilter === 'public') {
        params.is_public = true;
      }
      if (visibilityFilter === 'private') {
        params.is_public = false;
      }

      const response = await api.get<AdminDocumentListResponse>('/api/v1/documents/admin/list', { params });
      setDocs(response.data.items);
      setTotal(response.data.total);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError('Tài khoản hiện tại không có quyền admin để truy cập trang này.');
      } else if (err?.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        setError('Không tải được danh sách tài liệu.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [page, searchQuery, subjectFilter, visibilityFilter]);

  useEffect(() => {
    const refreshData = () => {
      fetchOverview();
      fetchDocuments();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    };

    window.addEventListener('focus', refreshData);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', refreshData);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [page, searchQuery, subjectFilter, visibilityFilter]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const subjects = useMemo(() => {
    const unique = new Set<string>();
    docs.forEach((doc) => {
      if (doc.subject) {
        unique.add(doc.subject);
      }
    });
    return Array.from(unique);
  }, [docs]);

  const handleToggleVisibility = async (doc: AdminDocumentItem) => {
    try {
      await api.patch(`/api/v1/documents/admin/${doc.id}/visibility`, {
        is_public: !doc.is_public,
      });
      await Promise.all([fetchOverview(), fetchDocuments()]);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError('Bạn không có quyền thực hiện thao tác này.');
      } else {
        setError('Cập nhật trạng thái tài liệu thất bại.');
      }
    }
  };

  const handleDeleteDocument = async (doc: AdminDocumentItem) => {
    const confirmed = window.confirm(`Bạn chắc chắn muốn xóa tài liệu "${doc.title}"?`);
    if (!confirmed) {
      return;
    }
    try {
      await api.delete(`/api/v1/documents/admin/${doc.id}`);
      await Promise.all([fetchOverview(), fetchDocuments()]);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError('Bạn không có quyền thực hiện thao tác này.');
      } else {
        setError('Xóa tài liệu thất bại.');
      }
    }
  };

  const handleCreateDocument = async () => {
    if (!createTitle.trim()) {
      setCreateError('Vui lòng nhập tiêu đề tài liệu.');
      return;
    }
    if (!createFile) {
      setCreateError('Vui lòng chọn file tài liệu.');
      return;
    }

    setCreating(true);
    setCreateError('');
    try {
      const formData = new FormData();
      formData.append('title', createTitle.trim());
      formData.append('description', createDescription.trim());
      formData.append('subject', createSubject.trim());
      formData.append('is_public', String(createIsPublic));
      formData.append('file', createFile);

      await api.post('/api/v1/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setIsCreateOpen(false);
      setCreateTitle('');
      setCreateDescription('');
      setCreateSubject('');
      setCreateIsPublic(true);
      setCreateFile(null);
      await Promise.all([fetchOverview(), fetchDocuments()]);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setCreateError(typeof detail === 'string' ? detail : 'Tạo tài liệu mới thất bại.');
    } finally {
      setCreating(false);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
    { icon: Users, label: 'Quản lý người dùng', path: '/admin/users' },
    { icon: FileText, label: 'Quản lý tài liệu', path: '/admin/docs' },
    { icon: CheckSquare, label: 'Kiểm duyệt chia sẻ', path: '/admin/moderation' },
    { icon: History, label: 'Nhật ký hoạt động', path: '/admin/logs' },
    { icon: Settings, label: 'Cài đặt hệ thống', path: '/admin/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Users className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">UniStudy Admin</h1>
              <p className="text-[10px] text-slate-500 mt-1.5 uppercase tracking-wider font-bold">HỆ THỐNG QUẢN TRỊ</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item, index) => {
              const isActive = index === 2; // Fixed to "Quản lý tài liệu"
              return (
                <Link
                  to={item.path}
                  key={index}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                  <span className="font-bold text-sm tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm tracking-wide"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10 shrink-0">
          <div className="relative w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm kiếm tài liệu, ID hoặc tác giả..." 
              value={searchQuery}
              onChange={(event) => {
                setPage(1);
                setSearchQuery(event.target.value);
              }}
              className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors relative group">
                <Bell className="w-5 h-5 group-hover:text-slate-700 transition-colors" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors group">
                <HelpCircle className="w-5 h-5 group-hover:text-slate-700 transition-colors" />
              </button>
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-1"></div>

            <div className="flex items-center gap-4 cursor-pointer hover:bg-slate-50 p-1.5 rounded-2xl transition-colors pr-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">Admin Uni</p>
                <p className="text-[10px] text-slate-500 font-extrabold uppercase mt-0.5">SUPER ADMIN</p>
              </div>
              <img src="https://i.pravatar.cc/150?img=11" alt="Admin" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
            </div>
          </div>
        </header>

        {/* Space for internal scroll */}
        <div className="flex-1 overflow-auto p-10">
          <div className="max-w-[1400px] mx-auto">
            {/* Page Heading */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Quản lý tài liệu</h2>
                <p className="text-slate-500 font-medium">
                  Quản lý danh mục, kiểm duyệt và phân phối tài liệu học tập toàn hệ thống.
                </p>
              </div>
              <button
                onClick={() => {
                  setCreateError('');
                  setIsCreateOpen(true);
                }}
                className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:-translate-y-0.5 text-sm tracking-wide"
              >
                <Plus className="w-5 h-5" />
                Tải tài liệu mới
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1.5 rounded-lg uppercase tracking-wider">
                    Hệ thống
                  </div>
                </div>
                <p className="text-slate-500 font-medium mb-1">Tổng tài liệu</p>
                <h3 className="text-3xl font-black text-slate-900 mb-2">{overview?.total_documents ?? 0}</h3>
                <div className="flex items-center text-emerald-500 text-xs font-bold gap-1 mt-auto">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+12% tháng này</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Globe2 className="w-6 h-6" />
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1.5 rounded-lg uppercase tracking-wider">
                    Công khai
                  </div>
                </div>
                <p className="text-slate-500 font-medium mb-1">Tài liệu công khai</p>
                <h3 className="text-3xl font-black text-slate-900 mb-2">{overview?.public_documents ?? 0}</h3>
                <div className="flex items-center text-emerald-500 text-xs font-bold gap-1 mt-auto">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Hoạt động tốt</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center">
                     <Lock className="w-6 h-6" />
                  </div>
                  <div className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1.5 rounded-lg uppercase tracking-wider">
                    Riêng tư
                  </div>
                </div>
                <p className="text-slate-500 font-medium mb-1">Tài liệu riêng tư</p>
                <h3 className="text-3xl font-black text-slate-900 mb-2">{overview?.private_documents ?? 0}</h3>
                <div className="flex items-center text-slate-400 text-xs font-bold gap-1 mt-auto">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Chế độ ẩn</span>
                </div>
              </div>

              {/* Card 4 - Highlight */}
              <div className="bg-[#1a1c29] p-6 rounded-3xl shadow-xl shadow-[#1a1c29]/20 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
                      Cảnh báo
                    </div>
                  </div>
                  <div className="mt-auto">
                    <p className="text-slate-300 font-medium mb-1">Yêu cầu chờ duyệt</p>
                    <h3 className="text-4xl font-black text-white mb-2">{overview?.pending_shares ?? 0}</h3>
                    <div className="flex items-center text-red-400 text-xs font-bold gap-1">
                      <span>! Cần xử lý ngay</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section: Table Controls */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-2 mb-6 flex flex-wrap items-center justify-between">
              <div className="flex items-center gap-4 py-2 px-4">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Môn học:</span>
                  <select
                    value={subjectFilter}
                    onChange={(event) => {
                      setPage(1);
                      setSubjectFilter(event.target.value);
                    }}
                    className="bg-slate-50 text-slate-700 font-bold text-sm border-none rounded-xl py-2 pl-4 pr-10 focus:ring-0 cursor-pointer appearance-none"
                  >
                    <option>Tất cả môn học</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-px h-6 bg-slate-200"></div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái:</span>
                  <select
                    value={visibilityFilter}
                    onChange={(event) => {
                      setPage(1);
                      setVisibilityFilter(event.target.value);
                    }}
                    className="bg-slate-50 text-slate-700 font-bold text-sm border-none rounded-xl py-2 pl-4 pr-10 focus:ring-0 cursor-pointer appearance-none"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="public">Công khai</option>
                    <option value="private">Riêng tư</option>
                  </select>
                </div>
              </div>
              <div className="py-2 px-6">
                <span className="text-sm font-medium text-slate-400">Hiển thị <span className="font-bold text-slate-700">{PAGE_SIZE}</span> trong {total} tài liệu</span>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            {/* Table Area */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-[30%]">TÊN TÀI LIỆU</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-[20%]">NGƯỜI ĐĂNG</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">MÔN HỌC</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest center">LOẠI FILE</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">NGÀY ĐĂNG</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">LƯỢT TẢI</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-8 py-12 text-center text-sm font-semibold text-slate-500">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  )}
                  {!loading && docs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-8 py-12 text-center text-sm font-semibold text-slate-500">
                        Không có tài liệu nào phù hợp bộ lọc.
                      </td>
                    </tr>
                  )}
                  {!loading && docs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] shrink-0 ${fileTypeClass(doc.file_type)}`}>
                            {doc.file_type}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight mb-1">{doc.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-bold tracking-wider">ID: DOC-{doc.id}</span>
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border ${doc.is_public ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                {doc.is_public ? 'Công khai' : 'Riêng tư'}
                              </span>
                              {doc.pending_share_count > 0 && (
                                <span className="bg-amber-50 text-amber-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-amber-100">
                                  Chờ duyệt: {doc.pending_share_count}
                                </span>
                              )}
                              {doc.approved_share_count > 0 && (
                                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-emerald-100">
                                  Đã duyệt: {doc.approved_share_count}
                                </span>
                              )}
                              {doc.rejected_share_count > 0 && (
                                <span className="bg-red-50 text-red-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-red-100">
                                  Từ chối: {doc.rejected_share_count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-600">
                            {getInitials(doc.uploader_name)}
                          </div>
                          <span className="font-bold text-slate-700 text-sm">{doc.uploader_name ?? 'Ẩn danh'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-semibold text-slate-600">{doc.subject ?? 'Chưa gán'}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest inline-block min-w-[50px] text-center">
                          .{doc.file_type.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-semibold text-slate-500">{formatDate(doc.created_at)}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-slate-900">{doc.share_count}</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleVisibility(doc)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                          >
                            {doc.is_public ? 'Ẩn' : 'Công khai'}
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="p-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-black shadow-sm">{page}</button>
                    <span className="px-2 py-2 text-xs font-bold text-slate-400">/ {totalPages}</span>
                  </div>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">Đến trang:</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={page}
                    onChange={(event) => {
                      const nextPage = Number(event.target.value);
                      if (!Number.isNaN(nextPage) && nextPage >= 1 && nextPage <= totalPages) {
                        setPage(nextPage);
                      }
                    }}
                    className="w-14 py-1.5 text-center text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bar Chart */}
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[320px]">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                     <BarChart className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Phân tích tài liệu tải lên tuần này</h3>
                </div>
                
                {/* Simulated Bar Chart */}
                <div className="flex-1 flex items-end gap-4 justify-between w-full h-[200px] mt-auto">
                  {/* Columns */}
                  <div className="flex-1 flex flex-col items-center gap-3">
                    <div className="w-full bg-[#f1f5f9] hover:bg-blue-100 transition-colors rounded-t-lg h-[40%] cursor-pointer group relative">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">12</div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">T2</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-3">
                    <div className="w-full bg-[#dbeafe] hover:bg-blue-300 transition-colors rounded-t-lg h-[65%] cursor-pointer group relative">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">45</div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">T3</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-3">
                    <div className="w-full bg-[#bfdbfe] hover:bg-blue-400 transition-colors rounded-t-lg h-[50%] cursor-pointer group relative">
                       <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">30</div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">T4</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-3">
                    <div className="w-full bg-[#93c5fd] hover:bg-blue-400 transition-colors rounded-t-lg h-[80%] cursor-pointer group relative">
                       <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">58</div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">T5</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-3">
                    <div className="w-full bg-[#3b82f6] hover:bg-blue-600 transition-colors rounded-t-lg h-[95%] cursor-pointer shadow-lg shadow-blue-200 group relative">
                       <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">85</div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">T6</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-3">
                    <div className="w-full bg-[#2563eb] hover:bg-blue-700 transition-colors rounded-t-lg h-[75%] cursor-pointer group relative">
                       <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">60</div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">T7</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-3">
                    <div className="w-full bg-[#60a5fa] hover:bg-blue-500 transition-colors rounded-t-lg h-[60%] cursor-pointer group relative">
                       <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">40</div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">CN</span>
                  </div>
                </div>
              </div>

              {/* Storage Info Widget */}
              <div className="bg-[#2563eb] p-8 rounded-3xl shadow-xl shadow-blue-500/30 flex flex-col justify-between relative overflow-hidden h-[320px]">
                {/* Background Decor */}
                <div className="absolute top-10 -right-10 opacity-10">
                   <Cloud className="w-64 h-64 text-white" />
                </div>
                
                <div className="relative z-10 flex justify-between items-start">
                   <div className="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Cloud className="w-6 h-6" />
                   </div>
                   <button className="text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors backdrop-blur-md">
                     <Plus className="w-5 h-5 text-white" />
                   </button>
                </div>
                
                <div className="relative z-10 mt-auto">
                  <h3 className="text-2xl font-black text-white mb-6">Dung lượng<br/>hệ thống đã dùng</h3>
                  
                  <div className="mb-2 flex items-end justify-between">
                    <span className="text-white font-black text-lg">842.5 GB <span className="text-white/60 font-medium text-sm">/ 1 TB</span></span>
                    <span className="text-white font-black text-base">82%</span>
                  </div>
                  
                  <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-white rounded-full w-[82%] relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/50 w-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  <p className="text-blue-100 text-sm font-medium leading-relaxed">
                    Gần đạt ngưỡng giới hạn. Hãy cân nhắc nâng cấp gói lưu trữ Cloud Storage.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">Tạo tài liệu mới</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Tiêu đề</label>
                <input
                  value={createTitle}
                  onChange={(event) => setCreateTitle(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="Nhập tiêu đề tài liệu"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Môn học</label>
                <input
                  value={createSubject}
                  onChange={(event) => setCreateSubject(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="Ví dụ: Toán cao cấp"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Mô tả</label>
                <textarea
                  value={createDescription}
                  onChange={(event) => setCreateDescription(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Mô tả ngắn về tài liệu"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">File tài liệu</label>
                <input
                  type="file"
                  onChange={(event) => setCreateFile(event.target.files?.[0] ?? null)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="isPublic"
                  type="checkbox"
                  checked={createIsPublic}
                  onChange={(event) => setCreateIsPublic(event.target.checked)}
                />
                <label htmlFor="isPublic" className="text-sm font-semibold text-slate-700">
                  Chia sẻ công khai
                </label>
              </div>

              {createError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                  {createError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateDocument}
                  disabled={creating}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {creating ? 'Đang tạo...' : 'Tạo tài liệu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocumentManagement;
