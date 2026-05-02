import React, { useState, useEffect } from 'react';
import { DocumentItem, ShareItem } from '../../services/documents';
import api from '../../services/api';

interface UserSearchResult {
  id: number;
  full_name: string;
  username: string;
  email: string;
}

interface ShareModalProps {
  isOpen: boolean;
  document: DocumentItem | null;
  onClose: () => void;
  onShareSuccess: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  document,
  onClose,
  onShareSuccess
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [message, setMessage] = useState('');
  const [shareItems, setShareItems] = useState<ShareItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && document) {
      fetchShares();
    } else {
      resetForm();
    }
  }, [isOpen, document]);

  const resetForm = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setMessage('');
    setError('');
  };

  const fetchShares = async () => {
    if (!document) return;
    try {
      const res = await api.get(`/api/v1/documents/${document.id}/shares`);
      setShareItems(res.data);
    } catch (err) {
      console.error('Failed to fetch shares', err);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.get(`/api/v1/users/search?q=${query}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleShare = async () => {
    if (!document) return;
    setIsLoading(true);
    setError('');
    try {
      await api.post(`/api/v1/documents/${document.id}/share`, {
        shared_to_id: selectedUser?.id || null,
        message: message || undefined
      });
      onShareSuccess();
      resetForm();
      fetchShares();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Chia sẻ thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />
      
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all transform"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">Chia sẻ tài liệu</h3>
            <p className="text-sm text-slate-400 mt-1 truncate max-w-[300px]">{document?.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tìm kiếm người dùng</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={selectedUser ? selectedUser.full_name : searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                readOnly={!!selectedUser}
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-white placeholder:text-slate-600"
                placeholder="Nhập tên hoặc email..."
              />
              {selectedUser && (
                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-indigo-400 hover:text-indigo-300"
                >
                  Thay đổi
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchQuery.length >= 2 && !selectedUser && (
              <div
                className="absolute z-20 w-[calc(100%-48px)] mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-fade-in"
              >
                {isSearching ? (
                  <div className="p-4 text-center text-slate-500 text-sm italic tracking-wide">Đang tìm kiếm...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(user => (
                    <button
                      key={user.id}
                      onClick={() => { setSelectedUser(user); setSearchQuery(''); }}
                      className="w-full p-3 hover:bg-slate-700 text-left border-b border-slate-700/50 last:border-0 transition-colors"
                    >
                      <div className="font-bold text-white text-sm">{user.full_name}</div>
                      <div className="text-xs text-slate-400">@{user.username} • {user.email}</div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 text-sm">Không tìm thấy kết quả</div>
                )}
              </div>
            )}
          </div>

          {/* Message Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Lời nhắn (Tùy chọn)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-white placeholder:text-slate-600 resize-none"
              placeholder="Nhập lời nhắn gửi kèm..."
              rows={3}
            />
          </div>

          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">{error}</div>}

          {/* Shared List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Danh sách đã chia sẻ</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
              {shareItems.length > 0 ? (
                shareItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-bold">
                        {item.shared_to_name ? item.shared_to_name[0] : '?'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{item.shared_to_name || 'Công khai'}</div>
                        <div className="text-[10px] text-slate-500">{item.shared_to_email || 'Link chia sẻ'}</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500">{new Date(item.shared_at).toLocaleDateString()}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-600 text-sm italic">Chưa chia sẻ với ai</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleShare}
            disabled={isLoading || (!selectedUser && searchQuery.length === 0)}
            className="flex-[2] py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? 'Đang gửi...' : selectedUser ? 'Chia sẻ với ' + selectedUser.full_name : 'Tạo link chia sẻ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
