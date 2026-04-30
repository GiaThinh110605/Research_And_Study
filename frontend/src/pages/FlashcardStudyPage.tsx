import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardService, FlashcardSet, Flashcard } from '../services/flashcards';
import { 
  ChevronLeft, 
  RotateCcw, 
  Settings, 
  X, 
  CheckCircle2, 
  Brain,
  History,
  Frown,
  Smile,
  Zap,
  Loader2
} from 'lucide-react';
import './FlashcardStudy.css'; // We'll create this for the flip animation

const FlashcardStudyPage: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [stats, setStats] = useState({ remembered: 0, forgotten: 0 });

  useEffect(() => {
    const loadData = async () => {
      if (!setId) return;
      try {
        const data = await flashcardService.getSet(parseInt(setId));
        setSet(data);
        setCards(data.flashcards);
      } catch (err) {
        console.error('Lỗi khi tải bộ thẻ:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setId]);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleRate = (remembered: boolean) => {
    if (remembered) {
      setStats(prev => ({ ...prev, remembered: prev.remembered + 1 }));
    } else {
      setStats(prev => ({ ...prev, forgotten: prev.forgotten + 1 }));
    }

    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 300);
    } else {
      setIsFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-xl text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-[#1B2559] mb-2">Hoàn thành!</h2>
          <p className="text-[#A3AED0] font-medium mb-8">Bạn đã học xong toàn bộ bộ thẻ này.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 p-6 rounded-3xl">
              <p className="text-2xl font-black text-green-600">{stats.remembered}</p>
              <p className="text-xs font-bold text-green-700 uppercase tracking-widest mt-1">Đã nhớ</p>
            </div>
            <div className="bg-red-50 p-6 rounded-3xl">
              <p className="text-2xl font-black text-red-600">{stats.forgotten}</p>
              <p className="text-xs font-bold text-red-700 uppercase tracking-widest mt-1">Chưa nhớ</p>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-[#3B66F5] text-white rounded-2xl font-black shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Học lại từ đầu
            </button>
            <button 
              onClick={() => navigate('/flashcard')}
              className="w-full py-4 bg-[#F4F7FE] text-[#1B2559] rounded-2xl font-black"
            >
              Về trang danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/flashcard')}
              className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#1B2559] hover:bg-gray-50 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <p className="text-[10px] font-black tracking-widest text-[#3B66F5] uppercase mb-1">
                STUDENT - UC12 - STUDY FLASHCARD PAGE
              </p>
              <h1 className="text-3xl font-black text-[#1B2559]">{set?.title}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="flex items-center gap-2 text-sm font-bold text-[#707EAE] hover:text-[#1B2559]">
               <Settings className="w-5 h-5" />
               Tùy chỉnh
             </button>
             <button 
               onClick={() => navigate('/flashcard')}
               className="bg-red-50 text-red-500 px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-red-100 transition-all"
             >
               <X className="w-4 h-4" />
               Kết thúc
             </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-12">
           <div className="flex items-center justify-between mb-4">
              <div className="h-2 flex-1 bg-[#E9EDF7] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#3B66F5] transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="ml-6 text-sm font-black text-[#A3AED0]">
                {currentIndex + 1} / {cards.length}
              </span>
           </div>
        </div>

        {/* Card Container */}
        <div className="relative h-[450px] mb-12 perspective-1000">
           <div 
             className={`flashcard-inner w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'is-flipped' : ''}`}
             onClick={handleFlip}
           >
             {/* Front */}
             <div className="flashcard-front absolute inset-0 bg-white rounded-[40px] shadow-xl p-16 flex flex-col items-center justify-center text-center backface-hidden border border-[#E0E5F2]">
                <span className="absolute top-10 left-10 bg-blue-50 text-blue-600 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  CÂU HỎI
                </span>
                <h2 className="text-4xl font-black text-[#1B2559] leading-tight max-w-2xl">
                  {currentCard?.front}
                </h2>
                <div className="absolute bottom-10 flex flex-col items-center gap-2 text-[#A3AED0]">
                  <Zap className="w-5 h-5 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Nhấn để lật thẻ</p>
                </div>
             </div>

             {/* Back */}
             <div className="flashcard-back absolute inset-0 bg-[#3B66F5] rounded-[40px] shadow-xl p-16 flex flex-col items-center justify-center text-center backface-hidden border border-blue-400 rotate-y-180">
                <span className="absolute top-10 left-10 bg-white/20 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  ĐÁP ÁN
                </span>
                <p className="text-3xl font-bold text-white leading-relaxed max-w-2xl">
                  {currentCard?.back}
                </p>
             </div>
           </div>
        </div>

        {/* Controls */}
        {!isFlipped ? (
           <div className="flex justify-center">
             <button 
               onClick={handleFlip}
               className="bg-[#3B66F5] text-white px-12 py-5 rounded-[24px] font-black text-lg shadow-xl shadow-blue-100 hover:scale-105 transition-all flex items-center gap-3"
             >
               <RotateCcw className="w-6 h-6" />
               Lật thẻ
             </button>
           </div>
        ) : (
           <div className="grid grid-cols-4 gap-6 max-w-4xl mx-auto">
             <button 
               onClick={() => handleRate(false)}
               className="bg-white rounded-[32px] p-6 shadow-sm border border-transparent hover:border-red-100 group transition-all text-center"
             >
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <History className="w-6 h-6" />
                </div>
                <p className="text-sm font-black text-[#1B2559]">Học lại</p>
                <p className="text-[10px] font-bold text-[#A3AED0] uppercase mt-1">{"<"} 1 phút</p>
             </button>

             <button 
               onClick={() => handleRate(false)}
               className="bg-white rounded-[32px] p-6 shadow-sm border border-transparent hover:border-orange-100 group transition-all text-center"
             >
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Frown className="w-6 h-6" />
                </div>
                <p className="text-sm font-black text-[#1B2559]">Khó</p>
                <p className="text-[10px] font-bold text-[#A3AED0] uppercase mt-1">2 ngày</p>
             </button>

             <button 
               onClick={() => handleRate(true)}
               className="bg-white rounded-[32px] p-6 shadow-sm border border-transparent hover:border-blue-100 group transition-all text-center"
             >
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Smile className="w-6 h-6" />
                </div>
                <p className="text-sm font-black text-[#1B2559]">Tốt</p>
                <p className="text-[10px] font-bold text-[#A3AED0] uppercase mt-1">4 ngày</p>
             </button>

             <button 
               onClick={() => handleRate(true)}
               className="bg-white rounded-[32px] p-6 shadow-sm border border-transparent hover:border-green-100 group transition-all text-center"
             >
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-black text-[#1B2559]">Dễ</p>
                <p className="text-[10px] font-bold text-[#A3AED0] uppercase mt-1">7 ngày</p>
             </button>
           </div>
        )}

        {/* Sidebar Info - Hidden on small screens */}
        <div className="fixed bottom-10 left-10 bg-white/80 backdrop-blur-md rounded-[32px] p-6 shadow-lg border border-white max-w-xs">
           <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">Mục tiêu hằng ngày</p>
                <p className="text-lg font-black text-[#1B2559]">12/20 <span className="text-sm font-bold text-gray-300">thẻ</span></p>
              </div>
           </div>
           <div className="h-1.5 w-full bg-[#E9EDF7] rounded-full overflow-hidden">
             <div className="h-full bg-blue-500 w-[60%]" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardStudyPage;
