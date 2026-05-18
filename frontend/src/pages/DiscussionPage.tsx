import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { authService } from '../services/auth';

interface DiscussionUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

interface DiscussionReactionSummary {
  emoji: string;
  count: number;
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
  reaction_summary?: DiscussionReactionSummary[];
  my_reaction?: string | null;
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
  const reactionOptions = ['👍', '❤️', '😂', '😮', '😢'];

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
      setReplyingTo(null);
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

  const handleReplyToggle = (discussionId: number) => {
    setReplyingTo((prev) => (prev === discussionId ? null : discussionId));
    setReplyContent('');
  };

  const updateDiscussionReaction = (
    discussionId: number,
    reactionSummary: DiscussionReactionSummary[],
    myReaction: string | null,
  ) => {
    const applyToItem = (item: DiscussionItem): DiscussionItem => {
      const updatedReplies = item.replies ? item.replies.map(applyToItem) : item.replies;
      if (item.id !== discussionId) {
        return { ...item, replies: updatedReplies };
      }
      return {
        ...item,
        replies: updatedReplies,
        reaction_summary: reactionSummary,
        my_reaction: myReaction,
      };
    };

    setDiscussions((prev) => prev.map(applyToItem));
  };

  const handleReaction = async (discussionId: number, emoji: string) => {
    if (!isLoggedIn) {
      setError('Bạn cần đăng nhập để thả cảm xúc.');
      return;
    }

    try {
      const res = await api.post(`/api/v1/discussions/${discussionId}/reactions`, { emoji });
      updateDiscussionReaction(
        discussionId,
        res.data.reaction_summary || [],
        res.data.my_reaction || null,
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Thả cảm xúc thất bại.');
    }
  };

  return (
    <main className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8 text-slate-800">
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
                    <div className="px-6 pb-3 flex items-center gap-4 text-[13px] font-bold text-slate-500">
                      <div className="relative group/reaction">
                        <button
                          onClick={() => handleReaction(disc.id, '👍')}
                          className={`hover:text-blue-600 transition-colors py-1 ${disc.my_reaction ? 'text-blue-600' : ''}`}
                        >
                          {disc.my_reaction ? `${disc.my_reaction} Thích` : 'Thích'}
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-1 hidden group-hover/reaction:block z-10">
                          <div className="flex bg-white shadow-[0_5px_15px_rgba(0,0,0,0.15)] rounded-full px-2 py-1 gap-1 border border-slate-100 animate-slide-up">
                            {reactionOptions.map((emoji) => (
                              <button
                                key={`${disc.id}-${emoji}`}
                                onClick={() => handleReaction(disc.id, emoji)}
                                className="w-8 h-8 hover:scale-125 transition-transform origin-bottom text-xl leading-none"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {disc.reaction_summary && disc.reaction_summary.length > 0 && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          {disc.reaction_summary.map((reaction) => (
                            <span key={`${disc.id}-${reaction.emoji}`} className="flex items-center gap-0.5">
                              <span>{reaction.emoji}</span>
                              <span>{reaction.count}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => handleReplyToggle(disc.id)}
                        className="hover:text-blue-600 transition-colors"
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

                                <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-slate-500">
                                  <div className="relative group/reaction">
                                    <button
                                      onClick={() => handleReaction(reply.id, '👍')}
                                      className={`hover:text-blue-600 transition-colors py-0.5 ${reply.my_reaction ? 'text-blue-600' : ''}`}
                                    >
                                      {reply.my_reaction ? `${reply.my_reaction} Thích` : 'Thích'}
                                    </button>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-1 hidden group-hover/reaction:block z-10">
                                      <div className="flex bg-white shadow-[0_5px_15px_rgba(0,0,0,0.12)] rounded-full px-2 py-1 gap-1 border border-slate-100 animate-slide-up">
                                        {reactionOptions.map((emoji) => (
                                          <button
                                            key={`${reply.id}-${emoji}`}
                                            onClick={() => handleReaction(reply.id, emoji)}
                                            className="w-7 h-7 hover:scale-125 transition-transform origin-bottom text-lg leading-none"
                                          >
                                            {emoji}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {reply.reaction_summary && reply.reaction_summary.length > 0 && (
                                    <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                                      {reply.reaction_summary.map((reaction) => (
                                        <span key={`${reply.id}-${reaction.emoji}`} className="flex items-center gap-0.5">
                                          <span>{reaction.emoji}</span>
                                          <span>{reaction.count}</span>
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  <button
                                    onClick={() => handleReplyToggle(reply.id)}
                                    className="hover:text-blue-600 transition-colors"
                                  >
                                    Phản hồi
                                  </button>
                                </div>

                                {replyingTo === reply.id && (
                                  <div className="mt-3 flex gap-2">
                                    <input
                                      autoFocus
                                      placeholder="Viết phản hồi..."
                                      className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-4 py-2 text-[12px] outline-none focus:border-blue-300 focus:bg-white transition-all"
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(reply.id)}
                                      disabled={!isLoggedIn}
                                    />
                                    <button
                                      onClick={() => handleReplySubmit(reply.id)}
                                      disabled={!isLoggedIn || !replyContent.trim()}
                                      className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                      <svg className="w-3.5 h-3.5 -rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                                    </button>
                                  </div>
                                )}

                                {reply.replies && reply.replies.length > 0 && (
                                  <div className="mt-3 space-y-2 pl-4 border-l border-slate-200">
                                    {reply.replies.map((child) => (
                                      <div key={child.id} className="flex gap-2">
                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 bg-slate-200 text-slate-700">
                                          {child.user ? getInitials(child.user.full_name) : '?'}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-[12px] text-slate-900">{child.user?.full_name || 'Ẩn danh'}</span>
                                            <span className="text-[10px] font-medium text-slate-400">{timeAgo(child.created_at)}</span>
                                          </div>
                                          <p className="text-[12px] text-slate-600 leading-relaxed mt-1 whitespace-pre-wrap">{child.content}</p>
                                          <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-500">
                                            <div className="relative group/reaction">
                                              <button
                                                onClick={() => handleReaction(child.id, '👍')}
                                                className={`hover:text-blue-600 transition-colors py-0.5 ${child.my_reaction ? 'text-blue-600' : ''}`}
                                              >
                                                {child.my_reaction ? `${child.my_reaction} Thích` : 'Thích'}
                                              </button>
                                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-1 hidden group-hover/reaction:block z-10">
                                                <div className="flex bg-white shadow-[0_5px_15px_rgba(0,0,0,0.12)] rounded-full px-2 py-1 gap-1 border border-slate-100 animate-slide-up">
                                                  {reactionOptions.map((emoji) => (
                                                    <button
                                                      key={`${child.id}-${emoji}`}
                                                      onClick={() => handleReaction(child.id, emoji)}
                                                      className="w-7 h-7 hover:scale-125 transition-transform origin-bottom text-lg leading-none"
                                                    >
                                                      {emoji}
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>

                                            {child.reaction_summary && child.reaction_summary.length > 0 && (
                                              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                                                {child.reaction_summary.map((reaction) => (
                                                  <span key={`${child.id}-${reaction.emoji}`} className="flex items-center gap-0.5">
                                                    <span>{reaction.emoji}</span>
                                                    <span>{reaction.count}</span>
                                                  </span>
                                                ))}
                                              </div>
                                            )}

                                            <button
                                              onClick={() => handleReplyToggle(child.id)}
                                              className="hover:text-blue-600 transition-colors"
                                            >
                                              Phản hồi
                                            </button>
                                          </div>

                                          {replyingTo === child.id && (
                                            <div className="mt-2 flex gap-2">
                                              <input
                                                autoFocus
                                                placeholder="Viết phản hồi..."
                                                className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-4 py-2 text-[12px] outline-none focus:border-blue-300 focus:bg-white transition-all"
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(child.id)}
                                                disabled={!isLoggedIn}
                                              />
                                              <button
                                                onClick={() => handleReplySubmit(child.id)}
                                                disabled={!isLoggedIn || !replyContent.trim()}
                                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                              >
                                                <svg className="w-3.5 h-3.5 -rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
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
  );
};

export default DiscussionPage;
