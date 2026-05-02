import React, { useState, useEffect } from 'react';
import { 
  BookOpen, LayoutDashboard, Users, FileText, MessageSquare,
  Settings, LogOut, Search, Plus, Bell, Filter,
  FileText as FileIcon, MoreHorizontal, Eye,
  CheckCircle2, ChevronLeft, ChevronRight, FileOutput, ArrowUpRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { documentService } from '../services/documents';

// Define document icons based on type
const getDocIcon = (type: string) => {
  const t = type ? type.toLowerCase() : '';
  if (t.includes('pdf')) {
    return <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0"><FileIcon className="w-5 h-5" /></div>;
  } else if (t.includes('doc') || t.includes('docx')) {
    return <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0"><FileIcon className="w-5 h-5" /></div>;
  } else if (t.includes('ppt') || t.includes('pptx')) {
    return <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0"><FileIcon className="w-5 h-5" /></div>;
  }
  return <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0"><FileIcon className="w-5 h-5" /></div>;
};

const getBadgeStyle = (category: string) => {
  if (!category) return 'bg-slate-50 text-slate-600';
  const c = category.toUpperCase();
  if (c.includes('NGHIÊN CỨU')) return 'bg-blue-50 text-blue-600';
  if (c.includes('TÀI LIỆU') || c.includes('HỌC')) return 'bg-green-50 text-green-600';
  if (c.includes('GHI CHÚ')) return 'bg-orange-50 text-orange-600';
  if (c.includes('BÁO CÁO')) return 'bg-purple-50 text-purple-600';
  return 'bg-slate-50 text-slate-600';
};

const AdminDocumentManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('NGHIÊN CỨU');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle.trim()) {
      alert('Vui lòng nhập tiêu đề và chọn file.');
      return;
    }
    try {
      setIsUploading(true);
      await documentService.upload({
        title: uploadTitle.trim(),
        is_public: true,
        file: uploadFile,
        subject: uploadSubject
      });
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadSubject('NGHIÊN CỨU');
      fetchDocuments(); // Reload list
    } catch (error) {
      console.error('Upload failed', error);
      alert('Tải lên thất bại, vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await documentService.list({ page_size: 100 });
      setDocuments(res.items || []);
      setFilteredDocuments(res.items || []);
    } catch (error) {
      console.error('Failed to fetch documents', error);
      // Fallback if API fails
      const mockData = [
        { id: 'DOC-01', title: 'Ảnh hưởng của AI trong Y học hiện đại', uploader_name: 'Nguyễn Văn A', created_at: '2023-05-12', file_type: 'pdf', subject: 'NGHIÊN CỨU' },
        { id: 'DOC-02', title: 'Giáo trình Kinh tế học vi mô - Chương 4', uploader_name: 'Trần Thị B', created_at: '2023-05-10', file_type: 'doc', subject: 'TÀI LIỆU HỌC' },
        { id: 'DOC-03', title: 'Ghi chú phương pháp luận nghiên cứu xã hội', uploader_name: 'Lê Văn C', created_at: '2023-05-08', file_type: 'txt', subject: 'GHI CHÚ' },
        { id: 'DOC-04', title: 'Báo cáo thực nghiệm hóa học phân tích 2', uploader_name: 'Phạm Minh D', created_at: '2023-05-05', file_type: 'ppt', subject: 'BÁO CÁO' },
      ];
      if (documents.length === 0) {
        setDocuments(mockData);
        setFilteredDocuments(mockData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      setFilteredDocuments(documents.filter(doc => 
        (doc.title && doc.title.toLowerCase().includes(lowerSearch)) ||
        (doc.uploader_name && doc.uploader_name.toLowerCase().includes(lowerSearch))
      ));
    } else {
      setFilteredDocuments(documents);
    }
  }, [searchTerm, documents]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
    { icon: Users, label: 'Quản lý người dùng', path: '/admin/users' },
    { icon: FileText, label: 'Quản lý tài liệu', path: '/admin/docs' },
    { icon: MessageSquare, label: 'Kiểm duyệt bình luận', path: '/admin/moderation' },
  ];

  return (
    <div className="flex min-h-screen bg-[#fafbfc] font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-blue-700 leading-tight">Nghiên cứu</h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">HỌC TẬP THÔNG MINH</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item, index) => {
              const isActive = item.label === 'Quản lý tài liệu';
              return (
                <Link
                  to={item.path}
                  key={index}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all border-l-[3px] ${
                    isActive 
                      ? 'bg-blue-50/70 border-blue-600 text-blue-700 font-semibold' 
                      : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
                  }`}
                >
                  <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-[13px]">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-1">
          <Link
            to="/admin/settings"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:bg-slate-50 font-medium border-l-[3px] border-transparent transition-all"
          >
            <Settings className="w-[18px] h-[18px] text-slate-400" />
            <span className="text-[13px]">Cài đặt</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium border-l-[3px] border-transparent transition-all"
          >
            <LogOut className="w-[18px] h-[18px] text-red-500" />
            <span className="text-[13px]">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden bg-white">
        {/* Header */}
        <header className="h-16 bg-white flex items-center justify-between px-8 shrink-0 relative z-10 border-b border-slate-100">
          <div className="relative w-[340px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm kiếm tài liệu..." 
              className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-100 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-5">
            <button className="text-slate-400 hover:text-slate-600 relative p-1">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-slate-600 relative p-1">
               <div className="w-5 h-5 border-2 border-slate-400 rounded-full flex items-center justify-center text-[10px] font-bold">?</div>
            </button>
            
            <div className="flex items-center gap-3 pl-5 border-l border-slate-100">
              <div className="text-right">
                <p className="text-[13px] font-bold text-slate-700 leading-tight">Admin UniStudy</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wide">QUẢN TRỊ VIÊN</p>
              </div>
              <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                 <div className="w-full h-full bg-slate-900"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 overflow-y-auto flex-1">
          <div className="max-w-5xl mx-auto">
            {/* Page Heading */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-[28px] font-bold text-slate-800 tracking-tight">Quản lý tài liệu</h2>
                <p className="text-slate-500 text-[13px] mt-1.5 font-medium">Hệ thống lưu trữ và kiểm soát nội dung nghiên cứu khoa học.</p>
              </div>
              <button onClick={() => setShowUploadModal(true)} className="bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-indigo-600 transition-colors text-[13px] shadow-sm">
                <Plus className="w-[18px] h-[18px]" />
                Thêm tài liệu mới
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-5 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="absolute top-6 right-6 text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +12%
                </div>
                <p className="text-[12px] font-semibold text-slate-400 mb-1">Tổng số tài liệu</p>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">{documents.length > 0 ? documents.length : '1,284'}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-4">
                  <MoreHorizontal className="w-5 h-5" />
                </div>
                <p className="text-[12px] font-semibold text-slate-400 mb-1">Đang chờ duyệt</p>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">0</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <Eye className="w-5 h-5" />
                </div>
                <p className="text-[12px] font-semibold text-slate-400 mb-1">Lượt xem tháng này</p>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">12.5k</p>
              </div>
            </div>

            {/* Document List Section */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] mb-8 overflow-hidden">
              {/* List Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-slate-800">Danh sách tài liệu</h3>
                <div className="flex items-center gap-3 text-slate-400">
                  <button className="hover:text-slate-600 transition-colors p-1"><Filter className="w-4 h-4" /></button>
                  <button className="hover:text-slate-600 transition-colors p-1"><FileOutput className="w-4 h-4" /></button>
                </div>
              </div>

              {/* List Body */}
              <div className="divide-y divide-slate-50">
                {isLoading ? (
                  <div className="p-5 text-center text-slate-500 font-medium">Đang tải dữ liệu...</div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="p-5 text-center text-slate-500 font-medium">Không có tài liệu nào</div>
                ) : filteredDocuments.map((doc, idx) => (
                  <div key={idx} className="p-5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                    {getDocIcon(doc.file_type)}
                    <div className="flex-1">
                      <h4 className="text-[14px] font-bold text-slate-800 mb-1">{doc.title}</h4>
                      <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                        <span>Tác giả: {doc.uploader_name || 'Khuyết danh'}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{new Date(doc.created_at).toLocaleDateString('vi-VN')}</span>
                        {doc.subject && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest ${getBadgeStyle(doc.subject)}`}>
                              {doc.subject}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[12px] text-slate-500 font-medium">
                  Hiển thị <span className="font-semibold text-slate-700">{filteredDocuments.length}</span> trên <span className="font-semibold text-slate-700">{documents.length}</span> tài liệu
                </p>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"><ChevronLeft className="w-[18px] h-[18px]" /></button>
                  <button className="w-[30px] h-[30px] rounded-lg bg-[#4F46E5] text-white text-[13px] font-semibold flex items-center justify-center shadow-sm">1</button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"><ChevronRight className="w-[18px] h-[18px]" /></button>
                </div>
              </div>
            </div>

            {/* Bottom Banners */}
            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-[#E2E8F0] flex items-center justify-between mb-10">
              <div className="max-w-xl">
                <h4 className="font-bold text-slate-800 mb-2 text-[15px]">Tối ưu hóa quy trình lưu trữ</h4>
                <p className="text-[13px] text-slate-500 leading-relaxed font-medium">Bạn có thể sử dụng tính năng "Lưu trữ" để tạm thời ẩn các tài liệu không còn hiệu lực mà không cần xóa vĩnh viễn chúng khỏi hệ thống.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 w-64 shadow-sm">
                 <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                 </div>
                 <div className="flex-1">
                    <p className="text-[12px] font-bold text-slate-800 mb-1">Dung lượng hiện tại</p>
                    <p className="text-[10px] text-slate-500 font-medium mb-2">Đã sử dụng 45.2 GB trên 100 GB</p>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 rounded-full" style={{width: '45%'}}></div>
                    </div>
                 </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-fade-in">
            <h3 className="text-[18px] font-bold text-slate-800 mb-4">Tải tài liệu lên</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tiêu đề</label>
                <input 
                  type="text" 
                  value={uploadTitle} 
                  onChange={(e) => setUploadTitle(e.target.value)} 
                  placeholder="Ví dụ: Đề cương Kinh tế vĩ mô..."
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Loại tài liệu</label>
                <select 
                  value={uploadSubject} 
                  onChange={(e) => setUploadSubject(e.target.value)} 
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="NGHIÊN CỨU">Nghiên cứu</option>
                  <option value="TÀI LIỆU HỌC">Tài liệu học</option>
                  <option value="GHI CHÚ">Ghi chú</option>
                  <option value="BÁO CÁO">Báo cáo</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">File tài liệu</label>
                <input 
                  type="file" 
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)} 
                  className="w-full text-[13px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[12px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                disabled={isUploading}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-[#4F46E5] text-white hover:bg-indigo-600 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isUploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Đang tải...
                  </>
                ) : (
                  'Tải lên ngay'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocumentManagement;
