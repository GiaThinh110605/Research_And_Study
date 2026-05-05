import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { flashcardService, FlashcardItem } from '../services/flashcards';
import { 
  Info, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  PlusCircle,
  FileText,
  Loader2
} from 'lucide-react';

interface FlashcardDraft {
  id?: number;
  front: string;
  back: string;
}

const FlashcardEditPage: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  
  const [currentFront, setCurrentFront] = useState('');
  const [currentBack, setCurrentBack] = useState('');
  const [drafts, setDrafts] = useState<FlashcardDraft[]>([]);
  
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (setId) {
      loadSetData(parseInt(setId));
    }
  }, [setId]);

  const loadSetData = async (id: number) => {
    try {
      setFetching(true);
      const data = await flashcardService.getSet(id);
      setTitle(data.title);
      setDescription(data.description || '');
      setSubject(data.subject || '');
      setDrafts(data.flashcards.map(f => ({ 
        id: f.id, 
        front: f.front, 
        back: f.back
      })));
    } catch (err) {
      setError('Không thể tải thông tin bộ thẻ.');
    } finally {
      setFetching(false);
    }
  };

  const handleEditDraft = (index: number) => {
    const card = drafts[index];
    setEditingIndex(index);
    setCurrentFront(card.front);
    setCurrentBack(card.back);
    setError(null);
  };

  const handleSaveCard = () => {
    if (!currentFront || !currentBack) {
      setError('Vui lòng nhập cả mặt trước và mặt sau của thẻ.');
      return;
    }

    if (editingIndex > -1) {
      const updatedDrafts = [...drafts];
      updatedDrafts[editingIndex] = {
        ...updatedDrafts[editingIndex],
        front: currentFront,
        back: currentBack
      };
      setDrafts(updatedDrafts);
    } else {
      setDrafts([...drafts, { front: currentFront, back: currentBack }]);
    }

    resetCardForm();
  };

  const resetCardForm = () => {
    setEditingIndex(-1);
    setCurrentFront('');
    setCurrentBack('');
    setError(null);
  };

  const removeDraft = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDrafts(drafts.filter((_, i) => i !== index));
    if (editingIndex === index) {
      resetCardForm();
    }
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
      const parsedId = parseInt(setId!);
      await flashcardService.updateSet(parsedId, {
        title,
        description,
        subject
      } as any);
      
      await flashcardService.bulkCreate(parsedId, drafts, true);
      navigate('/flashcard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Lỗi khi lưu bộ thẻ.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F4F7FE] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-[#1B2559]">Chỉnh sửa bộ thẻ</h1>
            <p className="text-[#A3AED0] font-medium mt-2">Cập nhật nội dung bộ thẻ để tối ưu hóa việc học tập.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/flashcard')} className="px-6 py-3 rounded-2xl font-bold text-[#A3AED0] hover:bg-white transition-all">Hủy bỏ</button>
            <button 
              onClick={handleSaveSet}
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : (
                <>
                  <Save className="w-5 h-5" />
                  Cập nhật bộ thẻ
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
          <div className="space-y-8">
            <div className="bg-white rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Info className="w-5 h-5" /></div>
                <h2 className="text-xl font-black text-[#1B2559]">Thông tin tổng quan</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-[#A3AED0] uppercase tracking-widest mb-2 block">Tiêu đề bộ thẻ</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#F4F7FE] border-none rounded-2xl p-4 font-bold text-[#1B2559] focus:ring-2 focus:ring-blue-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-black text-[#A3AED0] uppercase tracking-widest mb-2 block">Mô tả ngắn</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-[#F4F7FE] border-none rounded-2xl p-4 font-bold text-[#1B2559] focus:ring-2 focus:ring-blue-400 outline-none resize-none" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${editingIndex > -1 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'} rounded-xl flex items-center justify-center`}>
                    {editingIndex > -1 ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                  </div>
                  <h2 className="text-xl font-black text-[#1B2559]">{editingIndex > -1 ? 'Chỉnh sửa thẻ' : 'Thêm thẻ mới'}</h2>
                </div>
                {editingIndex > -1 && <button onClick={resetCardForm} className="text-xs font-bold text-rose-500 hover:underline">Hủy sửa</button>}
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-[#A3AED0] uppercase tracking-widest mb-2 block">Mặt trước</label>
                  <input type="text" value={currentFront} onChange={(e) => setCurrentFront(e.target.value)} className="w-full bg-[#F4F7FE] border-none rounded-2xl p-4 font-bold text-[#1B2559] focus:ring-2 focus:ring-green-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-black text-[#A3AED0] uppercase tracking-widest mb-2 block">Mặt sau</label>
                  <textarea value={currentBack} onChange={(e) => setCurrentBack(e.target.value)} rows={4} className="w-full bg-[#F4F7FE] border-none rounded-2xl p-4 font-bold text-[#1B2559] focus:ring-2 focus:ring-green-400 outline-none resize-none" />
                </div>
                <button onClick={handleSaveCard} className={`w-full py-4 ${editingIndex > -1 ? 'bg-amber-500' : 'bg-[#1B2559]'} text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg`}>
                  {editingIndex > -1 ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editingIndex > -1 ? 'Lưu thẻ' : 'Thêm vào danh sách'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-black text-[#1B2559]">Danh sách thẻ hiện tại ({drafts.length})</h2>
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {drafts.map((card, idx) => (
                <div key={idx} onClick={() => handleEditDraft(idx)} className={`bg-white rounded-3xl p-5 shadow-sm flex gap-4 items-center group cursor-pointer border-2 transition-all ${editingIndex === idx ? 'border-amber-400 shadow-amber-100 shadow-lg' : 'border-transparent hover:border-slate-100'}`}>
                  <div className="w-16 h-16 bg-[#F4F7FE] rounded-2xl flex-shrink-0 flex items-center justify-center text-[#A3AED0]"><FileText className="w-6 h-6" /></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-[#1B2559] truncate">{card.front}</h3>
                    <p className="text-xs text-[#A3AED0] font-medium mt-1 line-clamp-2">{card.back}</p>
                  </div>
                  <button onClick={(e) => removeDraft(idx, e)} className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardEditPage;
