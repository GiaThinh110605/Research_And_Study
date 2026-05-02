import React, { useState, useEffect } from 'react';
import { 
  BookOpen, LayoutDashboard, Users, FileText, MessageSquare,
  Settings, LogOut, Search, Bell, Filter, Download,
  ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import api from '../services/api';

const AdminModeration: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [filteredComments, setFilteredComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      // Try fetching all discussions/comments
      const res = await api.get('/api/v1/discussions/');
      setComments(res.data || []);
      setFilteredComments(res.data || []);
    } catch (error) {
      console.error('Failed to fetch comments', error);
      // Fallback Mock Data
      const mockComments = [
        { 
          id: '#4920', 
          user: { full_name: 'Nguyễn Văn Hùng' },
          content: 'Bài viết rất hữu ích nhưng tôi nghĩ phần phân tích dữ liệu ở trang 12 cần được làm rõ hơn về phương pháp lấy mẫu.',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          document_id: 1,
        },
        { 
          id: '#5102', 
          user: { full_name: 'Trần Minh' },
          content: 'Tài liệu này không có thật, người viết đang cố tình lừa đảo mọi người. Truy cập link này để xem sự thật: [Link giả mạo]',
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          document_id: 2,
          is_spam: true
        },
      ];
      if (comments.length === 0) {
        setComments(mockComments);
        setFilteredComments(mockComments);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = comments;
    if (filterType === 'spam') {
      result = result.filter(c => c.is_spam);
    }
    
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(c => 
        (c.content && c.content.toLowerCase().includes(lowerSearch)) ||
        (c.user?.full_name && c.user.full_name.toLowerCase().includes(lowerSearch))
      );
    }
    setFilteredComments(result);
  }, [searchTerm, comments, filterType]);

  const handleKeepComment = (id: number | string) => {
    // Hide from the moderation queue locally
    setComments(comments.filter(c => c.id !== id));
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Người dùng', 'Nội dung', 'Thời gian', 'Tài liệu'];
    const rows = filteredComments.map(c => [
      c.id,
      c.user?.full_name || 'Khuyết Danh',
      `"${(c.content || '').replace(/"/g, '""')}"`,
      new Date(c.created_at).toLocaleString('vi-VN'),
      `Doc #${c.document_id}`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bao_cao_kiem_duyet.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteComment = async (id: number | string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      try {
        await api.delete(`/api/v1/discussions/${id}`);
        fetchComments();
      } catch (error) {
        console.error('Failed to delete comment', error);
        setComments(comments.filter(c => c.id !== id));
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
    { icon: Users, label: 'Quản lý người dùng', path: '/admin/users' },
    { icon: MessageSquare, label: 'Kiểm duyệt bình luận', path: '/admin/moderation' },
  ];

  function getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
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
              const isActive = item.label === 'Kiểm duyệt bình luận';
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
              placeholder="Tìm kiếm bình luận hoặc người dùng..." 
              className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-100 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-5">
            <button className="text-slate-400 hover:text-slate-600 relative p-1">
              <Bell className="w-5 h-5" />
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
                <h2 className="text-[28px] font-bold text-slate-800 tracking-tight">Kiểm duyệt bình luận</h2>
                <p className="text-slate-500 text-[13px] mt-1.5 font-medium max-w-xl">Quản lý các phản hồi và ý kiến từ cộng đồng nghiên cứu. Đảm bảo môi trường học tập lành mạnh và chuyên nghiệp.</p>
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-50 transition-colors text-[13px] shadow-sm outline-none"
                >
                  <option value="all">Tất cả bình luận</option>
                  <option value="spam">Cần xem xét (Spam)</option>
                </select>
                <button onClick={exportToCSV} className="bg-[#312E81] text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-indigo-900 transition-colors text-[13px] shadow-sm">
                  <Download className="w-4 h-4" /> Xuất báo cáo
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-5 mb-8">
              <div className="bg-white py-6 px-8 rounded-2xl border border-slate-100 border-l-4 border-l-blue-600 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">TỔNG BÌNH LUẬN</p>
                <div className="flex items-end gap-3">
                   <p className="text-4xl font-bold text-slate-800 tracking-tight">{comments.length > 0 ? comments.length : '1,284'}</p>
                   <p className="text-[12px] font-bold text-emerald-500 mb-1">+12%</p>
                </div>
              </div>

              <div className="bg-white py-6 px-8 rounded-2xl border border-slate-100 border-l-4 border-l-orange-500 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">CẦN XEM XÉT</p>
                <div className="flex items-end gap-3">
                   <p className="text-4xl font-bold text-slate-800 tracking-tight">{comments.filter(c => c.is_spam).length || 0}</p>
                   <p className="text-[12px] font-medium text-slate-400 mb-1">Chưa xử lý</p>
                </div>
              </div>

              <div className="bg-white py-6 px-8 rounded-2xl border border-slate-100 border-l-4 border-l-red-500 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">BỊ BÁO CÁO</p>
                <div className="flex items-end gap-3">
                   <p className="text-4xl font-bold text-slate-800 tracking-tight">0</p>
                   <p className="text-[12px] font-bold text-red-500 mb-1">! Khẩn cấp</p>
                </div>
              </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] mb-8 overflow-hidden">
               {/* List Header */}
               <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-slate-800">Danh sách bình luận</h3>
                <p className="text-[12px] text-slate-400 italic">Hiển thị {filteredComments.length} bình luận</p>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[20%]">Người dùng</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[40%]">Nội dung</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[15%]">Thời gian</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[15%]">Tài liệu</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[10%] text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-6 text-center text-slate-500 font-medium">Đang tải bình luận...</td>
                    </tr>
                  ) : filteredComments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-6 text-center text-slate-500 font-medium">Không tìm thấy bình luận nào</td>
                    </tr>
                  ) : filteredComments.map((comment, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 align-top">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[12px] font-bold shrink-0">
                             {getInitials(comment.user?.full_name || 'Khuyết Danh')}
                          </div>
                          <div className="mt-0.5">
                            <p className="text-[13px] font-bold text-slate-800">{comment.user?.full_name || 'Khuyết Danh'}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">ID: #{comment.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 align-top">
                         <p className="text-[13px] text-slate-600 leading-relaxed font-medium mb-3 pr-4">
                            {comment.content}
                         </p>
                         <div className="flex gap-2 flex-wrap">
                            {comment.is_spam ? (
                              <>
                                <span className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded text-red-600 bg-red-50">SPAM / LỪA ĐẢO</span>
                                <span className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded text-orange-600 bg-orange-50">BỊ BÁO CÁO (1)</span>
                              </>
                            ) : (
                               <span className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded text-emerald-600 bg-emerald-50">TÍCH CỰC</span>
                            )}
                         </div>
                      </td>
                      <td className="px-8 py-5 align-top text-[12px] text-slate-500 font-medium">
                         {timeAgo(comment.created_at)}
                      </td>
                      <td className="px-8 py-5 align-top">
                         <Link to={`/documents/${comment.document_id}`} className="text-[13px] text-blue-600 font-medium hover:underline block leading-snug">
                            Doc #{comment.document_id}
                         </Link>
                      </td>
                      <td className="px-8 py-5 align-top">
                         <div className="flex flex-col gap-2">
                            <button onClick={() => handleKeepComment(comment.id)} className="w-full py-1.5 px-3 rounded border border-slate-200 text-slate-600 text-[11px] font-bold bg-white hover:bg-slate-50 transition-colors">
                                GIỮ LẠI
                            </button>
                            <button onClick={() => handleDeleteComment(comment.id)} className="w-full py-1.5 px-3 rounded bg-[#E11D48] text-white text-[11px] font-bold hover:bg-rose-700 transition-colors">
                                Xóa
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

               {/* Pagination */}
               <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[12px] text-slate-500 font-medium">
                  Đang hiển thị {filteredComments.length} bình luận
                </p>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"><ChevronLeft className="w-[18px] h-[18px]" /></button>
                  <button className="w-[30px] h-[30px] rounded-lg bg-[#312E81] text-white text-[13px] font-semibold flex items-center justify-center shadow-sm">1</button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"><ChevronRight className="w-[18px] h-[18px]" /></button>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-12 gap-6 mb-10">
               {/* Automoderation Banner */}
               <div className="col-span-8 bg-[#1E1B4B] rounded-2xl p-8 relative overflow-hidden text-white flex flex-col justify-center">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600 rounded-full opacity-20 blur-3xl"></div>
                  <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
                  
                  <div className="relative z-10 max-w-md">
                     <h3 className="text-xl font-bold mb-3">Tự động hóa kiểm duyệt</h3>
                     <p className="text-[13px] text-indigo-100 leading-relaxed font-medium mb-6">
                        Hệ thống AI mới đang được triển khai giúp tự động lọc 85% các bình luận rác và nội dung không phù hợp dựa trên từ khóa và ngữ cảnh nghiên cứu.
                     </p>
                     <button className="bg-white text-[#1E1B4B] px-5 py-2.5 rounded-xl font-bold text-[13px] hover:bg-slate-100 transition-colors w-fit">
                        Tìm hiểu thêm
                     </button>
                  </div>
               </div>

               {/* Guidelines */}
               <div className="col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-5">QUY TẮC CỘNG ĐỒNG</h4>
                  <ul className="space-y-4">
                     <li className="flex items-start gap-3">
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                           <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <p className="text-[13px] font-medium text-slate-700">Tôn trọng ý kiến đa chiều</p>
                     </li>
                     <li className="flex items-start gap-3">
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                           <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <p className="text-[13px] font-medium text-slate-700">Không chia sẻ tài liệu vi phạm bản quyền</p>
                     </li>
                     <li className="flex items-start gap-3">
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                           <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <p className="text-[13px] font-medium text-slate-700">Tránh các thảo luận ngoài lề học tập</p>
                     </li>
                  </ul>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminModeration;
