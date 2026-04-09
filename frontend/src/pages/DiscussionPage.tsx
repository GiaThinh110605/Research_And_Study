import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { authService } from '../services/auth';
const sidebarMenus = [
  { name: 'TRANG CHỦ', path: '/', icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
  { name: 'THƯ VIỆN', path: '/tai-lieu', icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg> },
  { name: 'BÀI KIỂM TRA', path: '/bai-kiem-tra', icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
  { name: 'FLASHCARD', path: '/flashcard', icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg> },
  { name: 'GPA', path: '/gpa', icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { name: 'THẢO LUẬN', path: '/thao-luan', icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg> },
  { name: 'LIÊN KẾT IUH', path: '/lien-ket', icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg> }
];

interface DiscussionUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

interface DiscussionItem {
  id: number;
  document_id: number;
  user_id: number;
  parent_id: number | null;
  content: string;
  created_at: string;
  user: DiscussionUser | null;
  replies: DiscussionItem[];
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

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const DiscussionPage: React.FC = () => {
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const isLoggedIn = !!localStorage.getItem('token');

  // Fetch discussions từ API
  const fetchDiscussions = async (docId: number) => {
    try {
      const res = await api.get(`/api/v1/discussions/?document_id=${docId}`);
      setDiscussions(res.data);
    } catch (err) {
      console.error('Lỗi tải thảo luận:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const docsRes = await api.get('/api/v1/documents/?page_size=1');
        if (docsRes.data.items && docsRes.data.items.length > 0) {
          const docId = docsRes.data.items[0].id;
          setDocumentId(docId);
          fetchDiscussions(docId);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Gửi thảo luận mới
  const handleSubmit = async () => {
    if (!newComment.trim()) {
      setError('Vui lòng nhập nội dung thảo luận');
      return;
    }
    if (!isLoggedIn) {
      setError('Bạn cần đăng nhập để gửi thảo luận');
      return;
    }

    if (!documentId) {
      setError('Chưa có tài liệu để thảo luận.');
      return;
    }

    setSending(true);
    setError('');
    try {
      await api.post('/api/v1/discussions/', {
        document_id: documentId,
        content: newComment.trim(),
        parent_id: 0, // Comment gốc
      });
      setNewComment('');
      setSuccessMsg('Gửi thảo luận thành công!');
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchDiscussions(documentId); // Reload danh sách
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else {
        setError('Gửi thảo luận thất bại. Vui lòng thử lại.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleReplySubmit = async (parentId: number) => {
    if (!replyContent.trim()) return;
    if (!isLoggedIn) {
       setError('Bạn cần đăng nhập để bình luận.'); return;
    }
    if (!documentId) return;

    try {
      await api.post('/api/v1/discussions/', {
        document_id: documentId,
        content: replyContent.trim(),
        parent_id: parentId,
      });
      setReplyContent('');
      await fetchDiscussions(documentId);
    } catch (err: any) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      
      if (status === 401 || status === 403 || (status === 404 && detail === 'User not found')) {
        setError('Phiên đăng nhập bị lỗi. Vui lòng tải lại trang và đăng nhập lại.');
        authService.logout();
      } else {
        setError(detail || 'Gửi bình luận thất bại.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto flex h-16 items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-12">
            <Link to="/" className="text-xl font-extrabold text-blue-600 tracking-tight">
              UniStudy
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-[13px] font-bold text-gray-500 hover:text-blue-600 transition-colors">Trang chủ</Link>
              <Link to="/thao-luan" className="text-[13px] font-bold text-blue-600 border-b-2 border-blue-600 pt-1 pb-[19px] relative top-[1px]">Thảo luận</Link>
              <Link to="/tai-lieu" className="text-[13px] font-bold text-gray-500 hover:text-blue-600 transition-colors">Thư viện</Link>
            </nav>
          </div>
          <div className="flex items-center gap-5">
            <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
              <span className="absolute top-0.5 right-0.5 w-[6px] h-[6px] bg-red-500 rounded-full border border-white"></span>
            </button>
            <img src="https://i.pravatar.cc/100?img=1" alt="User avatar" className="w-8 h-8 rounded-full border border-gray-200" />
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        
        {/* Left Sidebar */}
        <aside className="hidden lg:flex flex-col h-[calc(100vh-6rem)] sticky top-24">
          <ul className="space-y-1">
            {sidebarMenus.map((menu) => {
              const isActive = menu.name === 'THẢO LUẬN';
              return (
                <li key={menu.name}>
                  <Link to={menu.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}>
                    {menu.icon}
                    {menu.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8">
            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold text-[13px] py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              Tải tài liệu lên
            </button>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-200 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-200 transition-colors">
              <svg className="w-[18px] h-[18px] text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              HỖ TRỢ
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-200 transition-colors">
              <svg className="w-[18px] h-[18px] text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              ĐĂNG XUẤT
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1">
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-[28px] font-extrabold text-slate-900 leading-tight">Diễn đàn thảo luận</h1>
              <p className="text-slate-500 mt-1.5 text-sm font-medium">
                Trao đổi kiến thức, giải đáp thắc mắc và chia sẻ kinh nghiệm học tập cùng cộng đồng sinh viên IUH.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full">
                {discussions.length} CHỦ ĐỀ
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr] gap-6">
            
            {/* Inner Left Column for Stats */}
            <div className="space-y-5 hidden xl:block">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-4">CHUYÊN MỤC</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center text-sm font-semibold text-blue-600">
                    <span>Toán cao cấp</span>
                    <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-md">12</span>
                  </li>
                  <li className="flex justify-between items-center text-sm font-semibold text-slate-600 hover:text-blue-600 cursor-pointer">
                    <span>Lập trình Java</span>
                    <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-md">45</span>
                  </li>
                  <li className="flex justify-between items-center text-sm font-semibold text-slate-600 hover:text-blue-600 cursor-pointer">
                    <span>Kinh tế học</span>
                    <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-md">8</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#111827] rounded-2xl p-5 shadow-sm text-white border border-[#1f2937]">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">TOP CONTRIBUTORS</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-700 font-bold text-sm">NL</div>
                    <div>
                      <p className="font-bold text-[13px]">Nguyễn Long</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">1.2k points</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-100 text-rose-700 font-bold text-sm">PT</div>
                    <div>
                      <p className="font-bold text-[13px]">Phan Tâm</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">980 points</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Post Section */}
            <div className="space-y-6">
              
              {/* Discussions from API */}
              {loading ? (
                <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-500 font-medium">Đang tải thảo luận...</p>
                </div>
              ) : discussions.length === 0 ? (
                <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-12 text-center">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  <p className="text-slate-500 font-medium">Chưa có thảo luận nào. Hãy là người đầu tiên!</p>
                </div>
              ) : (
                discussions.map((disc) => (
                  <div key={disc.id} className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                    {/* Comment gốc */}
                    <div className="p-6">
                      <div className="flex gap-4">
                        <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center font-bold text-sm shrink-0 ${disc.user?.role === 'lecturer' ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                          {disc.user ? getInitials(disc.user.full_name) : '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[15px] text-slate-900">{disc.user?.full_name || 'Ẩn danh'}</span>
                            {disc.user?.role === 'lecturer' && (
                              <span className="bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded">GIẢNG VIÊN</span>
                            )}
                            <span className="text-[11px] font-medium text-slate-400 ml-auto">{timeAgo(disc.created_at)}</span>
                          </div>
                          <p className="text-[14px] text-slate-700 mt-2 leading-relaxed whitespace-pre-wrap">{disc.content}</p>
                        </div>
                      </div>
                    </div>

                    {/* Nút Phản hồi & Dòng kẻ */}
                    <div className="px-6 pb-3 flex items-center gap-4">
                      <button 
                        onClick={() => {
                          setReplyingTo(replyingTo === disc.id ? null : disc.id);
                          setReplyContent('');
                        }} 
                        className="text-[13px] font-bold text-slate-500 hover:text-blue-600 transition-colors"
                      >
                        Bình luận
                      </button>
                    </div>

                    {/* Replies */}
                    {disc.replies && disc.replies.length > 0 && (
                      <div className="px-6 pb-4 space-y-3">
                        <hr className="border-slate-100 mb-3" />
                        {disc.replies.map((reply) => (
                          <div key={reply.id} className={`ml-6 pl-4 border-l-2 rounded-xl p-3 ${reply.user?.role === 'lecturer' ? 'bg-[#EEF2FF] border-blue-400' : 'bg-[#F8FAFC] border-slate-200'}`}>
                            <div className="flex gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${reply.user?.role === 'lecturer' ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                                {reply.user ? getInitials(reply.user.full_name) : '?'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-[13px] text-slate-900">{reply.user?.full_name || 'Ẩn danh'}</span>
                                  {reply.user?.role === 'lecturer' && (
                                    <span className="bg-blue-600 text-white text-[8px] font-bold uppercase tracking-wide px-1 py-0.5 rounded">GV</span>
                                  )}
                                  <span className="text-[10px] font-medium text-slate-400 ml-auto">{timeAgo(reply.created_at)}</span>
                                </div>
                                <p className="text-[13px] text-slate-600 leading-relaxed mt-1 whitespace-pre-wrap">{reply.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Khung nhập Reply Facebook style */}
                    {replyingTo === disc.id && (
                      <div className="px-6 pb-5 pt-2 flex gap-3 animate-fade-in">
                        <img src="https://i.pravatar.cc/100?img=1" className="w-8 h-8 rounded-full border border-slate-200 shrink-0" alt="Avatar"/>
                        <div className="flex-1 bg-slate-100 rounded-[20px] flex items-center pr-2 pl-4 py-1.5 border border-slate-200 focus-within:border-blue-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                          <input 
                            type="text"
                            autoFocus
                            placeholder="Viết bình luận..."
                            className="bg-transparent flex-1 outline-none text-[13px] text-slate-800 placeholder-slate-500"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(disc.id)}
                            disabled={!isLoggedIn}
                          />
                          <button 
                            onClick={() => handleReplySubmit(disc.id)} 
                            disabled={!isLoggedIn || !replyContent.trim()}
                            className="w-7 h-7 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                          >
                            <svg className="w-4 h-4 ml-[2px]" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Reply Input Box */}
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
                <h3 className="text-[15px] font-bold text-slate-900 mb-4">Viết thảo luận mới</h3>

                {/* Thông báo lỗi / thành công */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-[13px] font-medium rounded-xl border border-red-100">
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 text-[13px] font-medium rounded-xl border border-green-100">
                    ✅ {successMsg}
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <img src="https://i.pravatar.cc/100?img=1" alt="Your Avatar" className="w-10 h-10 rounded-full border border-slate-200" />
                  <div className="flex-1">
                    <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 min-h-[110px] relative transition-colors focus-within:border-blue-300 focus-within:bg-white focus-within:ring-2 ring-blue-100 shadow-inner">
                      <textarea 
                        placeholder={isLoggedIn ? "Viết phản hồi của bạn..." : "Vui lòng đăng nhập để thảo luận..."}
                        className="w-full bg-transparent resize-none outline-none text-[14px] text-slate-700 placeholder-slate-400"
                        rows={3}
                        value={newComment}
                        onChange={(e) => { setNewComment(e.target.value); setError(''); }}
                        disabled={!isLoggedIn}
                      ></textarea>
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button 
                        onClick={handleSubmit}
                        disabled={sending || !isLoggedIn}
                        className={`text-white text-[13px] font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-600/20 active:scale-95 ${
                          sending || !isLoggedIn 
                            ? 'bg-slate-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {sending ? 'Đang gửi...' : 'Gửi thảo luận'}
                      </button>
                    </div>
                  </div>
                </div>

                {!isLoggedIn && (
                  <p className="text-center mt-4 text-sm text-slate-500">
                    Bạn cần <Link to="/login" className="text-blue-600 font-bold hover:underline">đăng nhập</Link> để tham gia thảo luận.
                  </p>
                )}
              </div>

              {/* Bottom Related Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 mb-2">LIÊN QUAN</p>
                  <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors pr-4 leading-snug">
                    Cách tối ưu hóa mã nguồn Java cho dự án cuối kỳ
                  </h3>
                  <div className="flex items-center gap-2 mt-4 text-[12px] font-medium text-slate-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/></svg>
                    18 bình luận
                  </div>
                </div>

                <div className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 mb-2">PHỔ BIẾN</p>
                  <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors pr-4 leading-snug">
                    Kinh nghiệm thi Toeic 450+ tại trung tâm ngoại ngữ IUH
                  </h3>
                  <div className="flex items-center gap-2 mt-4 text-[12px] font-medium text-slate-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/></svg>
                    124 bình luận
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DiscussionPage;
