import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { flashcardService, FlashcardSet } from '../services/flashcards';
import { Loader2, Plus, Brain, BookOpen, Clock, ChevronRight, Trash2 } from 'lucide-react';

const FlashcardListPage: React.FC = () => {
  const navigate = useNavigate();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSets = async () => {
    try {
      const data = await flashcardService.listSets();
      setSets(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể tải danh sách bộ thẻ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSets();
  }, []);

  const handleDeleteSet = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa bộ thẻ này?')) return;
    try {
      await flashcardService.deleteSet(id);
      setSets(sets.filter(s => s.id !== id));
    } catch (err) {
      alert('Lỗi khi xóa bộ thẻ.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#F4F7FE] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black tracking-widest text-[#3B66F5] uppercase mb-1">Học tập chủ động</p>
          <h2 className="text-3xl font-black text-[#1B2559]">Thẻ ghi nhớ của tôi</h2>
          <p className="text-[#A3AED0] font-medium mt-1">Ôn tập kiến thức hiệu quả với phương pháp Spaced Repetition.</p>
        </div>
        <button 
          onClick={() => navigate('/flashcard/create')}
          className="bg-[#3B66F5] text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tạo bộ thẻ mới
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {sets.map((set) => (
          <Link 
            key={set.id}
            to={`/flashcard/study/${set.id}`}
            className="bg-white rounded-[40px] p-8 shadow-sm border border-transparent hover:border-blue-200 transition-all group relative overflow-hidden"
          >
            {/* Background Decorative Element */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-150" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Brain className="w-7 h-7" />
              </div>
              
              <h3 className="text-xl font-black text-[#1B2559] mb-2 line-clamp-2 min-h-[3.5rem]">{set.title}</h3>
              <p className="text-sm text-[#A3AED0] font-medium line-clamp-2 mb-6 h-10">{set.description || 'Chưa có mô tả cho bộ thẻ này.'}</p>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2 bg-[#F4F7FE] px-3 py-1.5 rounded-xl text-[10px] font-black text-[#3B66F5] uppercase tracking-wider">
                  <BookOpen className="w-3 h-3" />
                  {set.flashcards?.length || 0} thẻ
                </div>
                <div className="flex items-center gap-2 bg-[#F4F7FE] px-3 py-1.5 rounded-xl text-[10px] font-black text-orange-500 uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  Học ngay
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-[#F4F7FE]">
                <div className="flex items-center gap-2 text-[#3B66F5] font-black text-xs uppercase tracking-widest">
                  Bắt đầu học
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <button 
                  onClick={(e) => handleDeleteSet(e, set.id)}
                  className="p-2 text-red-200 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Link>
        ))}

        {/* Empty State */}
        {sets.length === 0 && !loading && (
          <div className="col-span-full py-20 bg-white rounded-[40px] text-center border-2 border-dashed border-[#E0E5F2]">
             <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
                <Plus className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-black text-[#1B2559] mb-2">Chưa có bộ thẻ nào</h3>
             <p className="text-[#A3AED0] font-medium mb-8">Hãy tạo bộ thẻ ghi nhớ đầu tiên của bạn để bắt đầu học tập.</p>
             <button 
                onClick={() => navigate('/flashcard/create')}
                className="bg-[#3B66F5] text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:scale-105 transition-all"
             >
                TẠO BỘ THẺ ĐẦU TIÊN
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardListPage;
