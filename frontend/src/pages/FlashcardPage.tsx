import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FlashcardCreateModal from '../components/FlashcardCreateModal';
import { flashcardService, Flashcard } from '../services/flashcards';

const FlashcardPage: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [queue, setQueue] = useState<number[]>([]); // Indices of cards in session
  const [finishedCount, setFinishedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      setIsLoading(true);
      const data = await flashcardService.list();
      setCards(data);
      // Initialize queue with all indices
      setQueue(data.map((_, i) => i));
      setFinishedCount(0);
    } catch (err) {
      console.error("Failed to fetch flashcards", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (queue.length === 0) return;
    setTimeout(() => {
      // Move current to end
      setQueue(prev => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (queue.length === 0) return;
    setTimeout(() => {
      setQueue(prev => {
        const last = prev[prev.length - 1];
        const rest = prev.slice(0, -1);
        return [last, ...rest];
      });
    }, 150);
  };

  const currentIdx = queue.length > 0 ? queue[0] : -1;
  const currentCard = currentIdx !== -1 ? cards[currentIdx] : null;

  // New Handlers for X, ?, V
  const handleUnknown = () => {
    setIsFlipped(false);
    // Move to end of queue to repeat later
    setQueue(prev => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  const handleKnown = () => {
    setIsFlipped(false);
    // Remove from queue and mark as finished
    setQueue(prev => {
      const [_, ...rest] = prev;
      return rest;
    });
    setFinishedCount(prev => prev + 1);
  };

  const handleReviewAll = () => {
    setIsFlipped(false);
    // Reset session
    setQueue(cards.map((_, i) => i));
    setFinishedCount(0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const progress = cards.length > 0 ? Math.round((finishedCount / cards.length) * 100) : 0;

  return (
    <div className="min-h-full bg-[#F4F7FE] p-8 font-sans relative">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          <Link to="/flashcards" className="text-gray-400 font-medium">Flashcards</Link>
          <span className="text-gray-400">/</span>
          <span className="text-[#3B66F5] font-bold">
            {cards.length > 0 ? "Khám phá" : "Trống"}
          </span>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#3B66F5] text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tạo Flashcard
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column - Stats */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          
          {/* Daily Progress */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 text-center">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Tiến độ hôm nay</h3>
            
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" fill="transparent" stroke="#F0F4FF" strokeWidth="10" />
                <circle
                  cx="64" cy="64" r="58" fill="transparent" stroke="#3B66F5" strokeWidth="10"
                  strokeDasharray="364.4" strokeDashoffset={364.4 * (1 - progress / 100)}
                  strokeLinecap="round" className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-blue-900 leading-none">{progress}%</span>
                <span className="text-[10px] text-gray-400 font-bold mt-1">Hoàn thành</span>
              </div>
            </div>

            <div className="flex justify-between gap-4 mt-2">
              <div className="flex-1 bg-gray-50 rounded-2xl p-3">
                <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Đã học</p>
                <p className="text-xl font-black text-blue-900">{finishedCount}</p>
              </div>
              <div className="flex-1 bg-gray-50 rounded-2xl p-3">
                <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Còn lại</p>
                <p className="text-xl font-black text-blue-900">{queue.length}</p>
              </div>
            </div>
          </div>

          {/* Achievement Card */}
          <div className="bg-[#111827] rounded-3xl p-6 shadow-lg relative overflow-hidden">
             <div className="flex justify-between items-start mb-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thành tích</h3>
              <div className="w-6 h-6 bg-yellow-400 rounded-lg flex items-center justify-center text-yellow-900 font-black">🔥</div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400">Chuỗi ngày</p>
                  <p className="text-sm font-black text-white">12 Ngày</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-yellow-500 font-bold">XP</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400">Điểm số</p>
                  <p className="text-sm font-black text-white">1,450</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#EBF4FF] rounded-3xl p-6 border border-blue-100">
            <p className="text-xs text-blue-900/80 leading-relaxed">
                <span className="font-black text-blue-600">Mẹo:</span> Hãy ôn tập những thẻ quan trọng vào buổi sáng để tối ưu bộ nhớ.
            </p>
          </div>
        </div>

        {/* Right Column - Flashcard Viewer */}
        <div className="col-span-12 lg:col-span-9 flex flex-col min-h-[600px]">
          
          <div className="flex-1 flex flex-col items-center justify-center perspective-[2000px] py-10">
            {currentCard ? (
              <>
                {/* Flashcard Component */}
                <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className={`group relative w-full max-w-3xl aspect-[1.6/1] cursor-pointer transition-all duration-500 preserve-3d shadow-2xl rounded-[40px] ${isFlipped ? 'rotate-y-180' : ''}`}
                >
                    {/* Front Side */}
                    <div className="absolute inset-0 backface-hidden bg-white rounded-[40px] p-16 flex flex-col items-center justify-center text-center">
                        <div className="absolute top-10 left-12">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                              THẺ #{cards.indexOf(currentCard) + 1} / {cards.length}
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-blue-900 leading-tight max-w-2xl">
                          {currentCard.front}
                        </h2>
                        <div className="absolute bottom-10 text-gray-300 text-[10px] font-black tracking-widest uppercase">Nhấn để xem đáp án</div>
                    </div>

                    {/* Back Side */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#3B66F5] rounded-[40px] p-16 flex flex-col items-center justify-center text-center">
                         <div className="absolute top-10 left-12 text-blue-200">
                            <span className="text-[10px] font-black uppercase tracking-widest">ĐÁP ÁN</span>
                        </div>
                        <p className="text-2xl font-bold text-white leading-relaxed max-w-xl">
                          {currentCard.back}
                        </p>
                        <div className="absolute bottom-10 text-blue-200 text-[10px] font-black tracking-widest uppercase underline">Quay lại câu hỏi</div>
                    </div>
                </div>

                {/* Navigation & Controls */}
                <div className="flex items-center gap-10 mt-12 scale-110">
                    <button onClick={handlePrev} className="p-4 bg-white rounded-full text-gray-400 hover:text-blue-600 shadow-sm border border-gray-100 hover:scale-110 transition-all">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    <div className="flex gap-12 px-10 py-5 bg-white rounded-[32px] shadow-lg shadow-blue-50 border border-gray-50">
                        <button onClick={handleUnknown} className="flex flex-col items-center gap-1 group">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-red-500 bg-red-50 group-hover:bg-red-500 group-hover:text-white transition-all">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                          </div>
                          <span className="text-[8px] font-black text-gray-400 group-hover:text-red-500 uppercase tracking-tighter">X</span>
                        </button>
                        <button onClick={handleReviewAll} className="flex flex-col items-center gap-1 group">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-yellow-500 bg-yellow-50 group-hover:bg-yellow-500 group-hover:text-white transition-all">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          <span className="text-[8px] font-black text-gray-400 group-hover:text-yellow-500 uppercase tracking-tighter">?</span>
                        </button>
                        <button onClick={handleKnown} className="flex flex-col items-center gap-1 group">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-green-500 bg-green-50 group-hover:bg-green-500 group-hover:text-white transition-all">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <span className="text-[8px] font-black text-gray-400 group-hover:text-green-500 uppercase tracking-tighter">V</span>
                        </button>
                    </div>

                    <button onClick={handleNext} className="p-4 bg-white rounded-full text-gray-400 hover:text-blue-600 shadow-sm border border-gray-100 hover:scale-110 transition-all">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-4xl">
                  {cards.length > 0 ? "🎉" : "🎴"}
                </div>
                <h3 className="text-xl font-bold text-blue-900">
                  {cards.length > 0 ? "Bạn đã hoàn thành lượt học!" : "Chưa có flashcard nào"}
                </h3>
                <p className="text-gray-400">
                  {cards.length > 0 ? "Tuyệt vời! Bạn có muốn ôn lại toàn bộ không?" : "Hãy tạo bộ thẻ đầu tiên của bạn để bắt đầu học tập!"}
                </p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-8 py-3 bg-[#3B66F5] text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                  >
                    Tạo mới
                  </button>
                  {cards.length > 0 && (
                    <button 
                      onClick={handleReviewAll}
                      className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all"
                    >
                      Ôn lại toàn bộ
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Toolbar */}
          <div className="mt-auto h-20 bg-white/50 backdrop-blur-md border border-white rounded-[24px] px-8 flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-4">
                <p className="text-xs text-blue-900/60 font-medium">
                    Hệ thống sẽ tự động nhắc nhở bạn ôn tập theo phương pháp lặp lại ngắt quãng (Spaced Repetition).
                </p>
            </div>
            <div className="flex gap-4">
               <button className="px-4 py-2 border border-gray-100 rounded-xl text-xs font-black text-gray-400 hover:bg-white hover:text-blue-600 transition-all">BÁO CÁO</button>
               <button className="px-4 py-2 bg-white rounded-xl text-xs font-black text-blue-600 shadow-sm hover:shadow-md transition-all">CÀI ĐẶT</button>
            </div>
          </div>

        </div>
      </div>

      <FlashcardCreateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchFlashcards}
      />

      <style>{`
        .perspective-2000 { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default FlashcardPage;


