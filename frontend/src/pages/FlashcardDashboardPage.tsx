import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Settings, 
  X, 
  Frown, 
  Meh, 
  Smile, 
  ChevronRight,
  Loader2,
  BrainCircuit,
  LayoutGrid,
  BookOpen,
  RotateCcw
} from 'lucide-react';
import { flashcardService, FlashcardSet, FlashcardItem } from '../services/flashcards';

const FlashcardDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [currentCards, setCurrentCards] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived state for the currently selected set from the sets list
  const selectedSet = useMemo(() => {
    return sets.find(s => s.id === selectedSetId) || null;
  }, [sets, selectedSetId]);

  useEffect(() => {
    loadSets();
  }, []);

  const loadSets = async () => {
    try {
      setLoading(true);
      const data = await flashcardService.listSets();
      setSets(data);
      if (data.length > 0 && selectedSetId === null) {
        handleSelectSet(data[0]);
      }
    } catch (err: any) {
      setError('Không thể tải danh sách bộ thẻ.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSet = async (set: FlashcardSet) => {
    setSelectedSetId(set.id);
    setCurrentIndex(0);
    setIsFlipped(false);
    try {
      const data = await flashcardService.getSet(set.id);
      setCurrentCards(data.flashcards || []);
      // Sync the set in the list with fresh data
      setSets(prev => prev.map(s => s.id === data.id ? data : s));
    } catch (err) {
      console.error('Lỗi khi tải chi tiết bộ thẻ:', err);
    }
  };

  const handleRestart = async () => {
    if (!selectedSetId) return;
    if (!window.confirm('Bạn có muốn xóa toàn bộ tiến trình và học lại từ đầu bộ thẻ này không?')) return;
    
    try {
      await flashcardService.resetSetProgress(selectedSetId);
      
      setCurrentIndex(0);
      setIsFlipped(false);
      
      // Reload everything to sync
      const data = await flashcardService.getSet(selectedSetId);
      setCurrentCards(data.flashcards || []);
      setSets(prev => prev.map(s => s.id === data.id ? data : s));
      
      alert('Đã reset tiến trình. Chúc bạn học tốt!');
    } catch (err) {
      console.error('Lỗi khi reset tiến trình:', err);
      alert('Không thể reset tiến trình. Vui lòng thử lại.');
    }
  };

  const handleAnswer = async (isMastered: boolean) => {
    const currentCard = currentCards[currentIndex];
    if (!currentCard) return;
    
    if (isMastered) {
      try {
        // Update mastery level in backend
        await flashcardService.updateFlashcard(currentCard.id, {
          mastery_level: 5,
          status: 'mastered'
        } as any);

        // Update global sets list to reflect progress
        setSets(prevSets => prevSets.map(s => {
          if (s.id === selectedSetId) {
            const updatedSetCards = [...(s.flashcards || [])];
            const cardIdx = updatedSetCards.findIndex(c => c.id === currentCard.id);
            if (cardIdx > -1) {
              updatedSetCards[cardIdx] = { ...currentCard, mastery_level: 5, status: 'mastered' };
            }
            return { ...s, flashcards: updatedSetCards };
          }
          return s;
        }));

        // Move to next card
        if (currentIndex < currentCards.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setIsFlipped(false);
        } else {
          alert('Chúc mừng! Bạn đã hoàn thành tất cả các thẻ trong bộ này.');
        }
      } catch (err) {
        console.error('Lỗi khi cập nhật trạng thái:', err);
      }
    } else {
      // "Chưa thuộc": Skip and add to end of queue
      const cardToRepeat = { ...currentCard };
      const updatedCards = [...currentCards];
      updatedCards.push(cardToRepeat);
      setCurrentCards(updatedCards);

      // Move to next card
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  // Calculate progress based on unique cards in the set
  const progressStats = useMemo(() => {
    if (!selectedSet || !selectedSet.flashcards) return { percent: 0, mastered: 0, total: 0 };
    const total = selectedSet.flashcards.length;
    const mastered = selectedSet.flashcards.filter(c => c.mastery_level === 5).length;
    return {
      percent: total > 0 ? Math.round((mastered / total) * 100) : 0,
      mastered,
      total
    };
  }, [selectedSet]);

  if (loading && sets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  const currentCard = currentCards[currentIndex];

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Hệ thống Flashcard</h1>
        <p className="text-slate-500 font-medium">Ôn tập hiệu quả thông qua kỹ thuật lặp lại ngắt quãng.</p>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Left Column: List of sets */}
        <div className="w-[400px] flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-black text-slate-800">Bộ thẻ của bạn</h2>
            <button 
              onClick={() => navigate('/flashcard/create')}
              className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline"
            >
              <Plus size={16} />
              Tạo mới
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {sets.map((set) => (
              <div
                key={set.id}
                onClick={() => handleSelectSet(set)}
                className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer group relative overflow-hidden ${
                  selectedSetId === set.id 
                    ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100/50' 
                    : 'border-transparent bg-white hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    selectedSetId === set.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {set.flashcards?.every(c => c.mastery_level === 5) ? 'HOÀN THÀNH' : (set.flashcards?.some(c => c.mastery_level > 0) ? 'ĐANG HỌC' : 'CHƯA BẮT ĐẦU')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {set.flashcards?.length || 0} thẻ
                  </span>
                </div>
                
                <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {set.title}
                </h3>
                <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-4">
                  {set.description || 'Chưa có mô tả cho bộ thẻ này.'}
                </p>

                <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    {set.flashcards?.filter(c => c.mastery_level < 5).length || 0} Còn lại
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {set.flashcards?.filter(c => c.mastery_level === 5).length || 0} Đã thuộc
                  </div>
                </div>

                {selectedSetId === set.id && (
                  <div className="absolute bottom-0 left-0 h-1.5 bg-indigo-600 w-full" />
                )}
              </div>
            ))}

            {sets.length === 0 && (
              <div className="text-center py-12 bg-white rounded-[32px] border-2 border-dashed border-slate-200">
                <BrainCircuit className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">Chưa có bộ thẻ nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Study Area */}
        <div className="flex-1 bg-white rounded-[40px] shadow-sm border border-slate-100 flex flex-col overflow-hidden relative">
          {selectedSetId && selectedSet ? (
            <>
              {/* Study Header */}
              <div className="p-8 flex items-center justify-between border-b border-slate-50">
                <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                  <X size={20} />
                </button>
                <div className="flex flex-col items-center">
                  <h2 className="text-lg font-black text-slate-900">{selectedSet.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      TIẾN ĐỘ: {progressStats.percent}%
                    </span>
                    <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 transition-all duration-500" 
                        style={{ width: `${progressStats.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleRestart}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all"
                  >
                    <RotateCcw size={16} />
                    Học Lại
                  </button>
                  <button 
                    onClick={() => navigate(`/flashcard/edit/${selectedSetId}`)}
                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"
                  >
                    <Settings size={20} />
                  </button>
                </div>
              </div>

              {/* Card Area */}
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`w-full max-w-2xl aspect-[16/10] bg-white rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 cursor-pointer transition-all duration-500 relative perspective-1000 ${
                    isFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front */}
                  <div className={`absolute inset-0 flex flex-col items-center justify-center p-16 backface-hidden ${isFlipped ? 'invisible' : 'visible'}`}>
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-12">MẶT TRƯỚC</span>
                    <h3 className="text-3xl font-bold text-slate-800 text-center leading-relaxed">
                      {currentCard?.front || 'Hết thẻ trong phiên này.'}
                    </h3>
                    <div className="mt-12 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider animate-bounce">
                      <LayoutGrid size={14} />
                      Chạm để xem đáp án
                    </div>
                  </div>

                  {/* Back */}
                  <div className={`absolute inset-0 flex flex-col items-center justify-center p-16 backface-hidden [transform:rotateY(180deg)] ${isFlipped ? 'visible' : 'invisible'}`}>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-12">MẶT SAU</span>
                    <h3 className="text-2xl font-medium text-slate-700 text-center leading-relaxed">
                      {currentCard?.back || '...'}
                    </h3>
                  </div>
                </div>

                {/* Interaction Buttons */}
                <div className="flex gap-8 w-full max-w-xl mt-12">
                  <button 
                    onClick={() => handleAnswer(false)}
                    disabled={!currentCard}
                    className="flex-1 flex flex-col items-center gap-3 p-8 rounded-[32px] bg-white border border-slate-100 hover:border-rose-200 hover:bg-rose-50/30 transition-all group disabled:opacity-50"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
                      <Frown size={32} />
                    </div>
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest group-hover:text-rose-600">Chưa thuộc</span>
                  </button>

                  <button 
                    onClick={() => handleAnswer(true)}
                    disabled={!currentCard}
                    className="flex-1 flex flex-col items-center gap-3 p-8 rounded-[32px] bg-white border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group disabled:opacity-50"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                      <Smile size={32} />
                    </div>
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-600">Đã thuộc</span>
                  </button>
                </div>
              </div>

              {/* Bottom Stats Row */}
              <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-center gap-12">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                    <span className="text-sm font-bold text-slate-600">
                        {currentCards.filter((c, i) => i >= currentIndex && !currentCards.slice(0, i).some(prev => prev.id === c.id)).length} Còn lại
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm font-bold text-slate-600">
                        {progressStats.mastered} Đã thuộc
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <span className="text-sm font-bold text-slate-600">
                        {currentCards.slice(currentIndex).filter((c, i) => currentCards.slice(0, currentIndex + i).some(prev => prev.id === c.id)).length} Cần học lại
                    </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <BookOpen size={48} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Chọn một bộ thẻ để bắt đầu</h3>
              <p className="text-slate-500 font-medium max-w-sm">
                Hãy chọn một bộ thẻ từ danh sách bên trái để bắt đầu ôn tập kiến thức của bạn.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};

export default FlashcardDashboardPage;
