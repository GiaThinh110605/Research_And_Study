import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flashcardService } from '../services/flashcards';
import { 
  Info, 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Save, 
  X,
  PlusCircle,
  FileText,
  Brain
} from 'lucide-react';

interface FlashcardDraft {
  front: string;
  back: string;
}

const FlashcardCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  
  const [currentFront, setCurrentFront] = useState('');
  const [currentBack, setCurrentBack] = useState('');
  const [drafts, setDrafts] = useState<FlashcardDraft[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddCard = () => {
    if (!currentFront || !currentBack) {
      setError('Vui lòng nhập cả mặt trước và mặt sau của thẻ.');
      return;
    }
    setDrafts([...drafts, { front: currentFront, back: currentBack }]);
    setCurrentFront('');
    setCurrentBack('');
    setError(null);
  };

  const removeDraft = (index: number) => {
    setDrafts(drafts.filter((_, i) => i !== index));
  };

  const handleSaveSet = async () => {
    if (!title) {
      setError('Vui lòng nhập tiêu đề bộ thẻ.');
      return;
    }
    if (drafts.length === 0) {
      setError('Cần có ít nhất một thẻ trong bộ.');
      return;
    }

    setLoading(true);
    try {
      const newSet = await flashcardService.createSet({
        title,
        description,
        subject
      });
      
      await flashcardService.bulkCreate(newSet.id, drafts);
      
      navigate('/flashcard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Lỗi khi lưu bộ thẻ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[#F4F7FE] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-black tracking-widest text-[#3B66F5] uppercase mb-1">
              Student - UC11 - Create Flashcard Page
            </p>
            <h1 className="text-4xl font-black text-[#1B2559]">Tạo bộ thẻ mới</h1>
            <p className="text-[#A3AED0] font-medium mt-2">
              Xây dựng kho tàng kiến thức cá nhân thông qua phương pháp lặp lại ngắt quãng.
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/flashcard')}
              className="px-6 py-3 rounded-2xl font-bold text-[#A3AED0] hover:bg-white transition-all"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={handleSaveSet}
              disabled={loading}
              className="px-8 py-3 bg-[#3B66F5] text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : (
                <>
                  <Save className="w-5 h-5" />
                  Lưu bộ thẻ
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-bold flex items-center gap-2">
            <X className="w-5 h-5 cursor-pointer" onClick={() => setError(null)} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-8">
            {/* General Info */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Info className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-[#1B2559]">Thông tin tổng quan</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-[#A3AED0] uppercase tracking-widest mb-2 block">Tiêu đề bộ thẻ</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Giải phẫu học cơ bản - Chương 1"
                    className="w-full bg-[#F4F7FE] border-none rounded-2xl p-4 font-bold text-[#1B2559] focus:ring-2 focus:ring-blue-400 outline-none placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#A3AED0] uppercase tracking-widest mb-2 block">Mô tả ngắn</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tóm tắt nội dung của bộ thẻ này..."
                    rows={4}
                    className="w-full bg-[#F4F7FE] border-none rounded-2xl p-4 font-bold text-[#1B2559] focus:ring-2 focus:ring-blue-400 outline-none placeholder:text-gray-300 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Add Card Form */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-[#1B2559]">Thêm thẻ mới</h2>
                </div>
                <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Thẻ số {drafts.length + 1}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-[#A3AED0] uppercase tracking-widest mb-2 block">Mặt trước (Thuật ngữ)</label>
                  <input 
                    type="text" 
                    value={currentFront}
                    onChange={(e) => setCurrentFront(e.target.value)}
                    placeholder="Nhập từ hoặc khái niệm..."
                    className="w-full bg-[#F4F7FE] border-none rounded-2xl p-4 font-bold text-[#1B2559] focus:ring-2 focus:ring-green-400 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#A3AED0] uppercase tracking-widest mb-2 block">Mặt sau (Định nghĩa)</label>
                  <textarea 
                    value={currentBack}
                    onChange={(e) => setCurrentBack(e.target.value)}
                    placeholder="Giải thích chi tiết..."
                    rows={4}
                    className="w-full bg-[#F4F7FE] border-none rounded-2xl p-4 font-bold text-[#1B2559] focus:ring-2 focus:ring-green-400 outline-none resize-none"
                  />
                </div>

                <div className="border-2 border-dashed border-[#E0E5F2] rounded-2xl p-8 text-center group hover:border-blue-400 transition-all cursor-pointer bg-[#F4F7FE]/50">
                   <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 text-[#A3AED0] group-hover:text-blue-500 transition-colors">
                      <ImageIcon className="w-6 h-6" />
                   </div>
                   <p className="text-xs font-bold text-[#A3AED0]">Tải ảnh lên hoặc kéo thả vào đây</p>
                   <p className="text-[10px] text-gray-300 mt-1 uppercase font-black">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                </div>

                <button 
                  onClick={handleAddCard}
                  className="w-full py-4 bg-[#1B2559] text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#111c44] transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Thêm vào danh sách
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Drafts List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[#1B2559]">Danh sách thẻ đã tạo ({drafts.length})</h2>
              <button className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#A3AED0] hover:text-blue-500 transition-all">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {drafts.length === 0 ? (
                <div className="bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-[#E0E5F2]">
                   <Brain className="w-12 h-12 text-[#E0E5F2] mx-auto mb-4" />
                   <p className="text-gray-400 font-bold">Chưa có thẻ nào được thêm.</p>
                   <p className="text-[10px] text-gray-300 uppercase font-black mt-2">Kéo thẻ để sắp xếp lại thứ tự</p>
                </div>
              ) : (
                drafts.map((card, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-5 shadow-sm flex gap-4 items-start group">
                    <div className="w-20 h-20 bg-[#F4F7FE] rounded-2xl flex-shrink-0 flex items-center justify-center text-[#A3AED0]">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-[#1B2559] truncate">{card.front}</h3>
                      <p className="text-xs text-[#A3AED0] font-medium mt-1 line-clamp-2">{card.back}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => removeDraft(idx)}
                        className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {drafts.length > 0 && (
              <div className="bg-[#E9EDF7] rounded-3xl p-8 border-2 border-dashed border-[#B0BBDA] text-center">
                <p className="text-sm font-bold text-[#707EAE]">Kéo thẻ để sắp xếp lại thứ tự</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardCreatePage;
