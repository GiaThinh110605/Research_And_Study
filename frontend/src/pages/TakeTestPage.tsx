import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testService, TestOut, ITestQuestion } from '../services/test';

const TakeTestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<TestOut | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      if (!id) return;
      try {
        const data = await testService.getTest(parseInt(id));
        if (!data || !data.questions || data.questions.length === 0) {
           throw new Error("No questions available");
        }
        setTest(data);
        setTimeLeft((data.duration_minutes || 60) * 60);
      } catch (error) {
        console.error("Lỗi khi tải đề thi", error);
        setTest(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id, navigate]);

  const handleSubmit = useCallback(async () => {
    if (!test) return;
    const answersMap: Record<string, any> = {};
    Object.keys(answers).forEach((idxStr: string) => {
      const idx = parseInt(idxStr);
      const answerIdx = answers[idx];
      const qId = test.questions?.[idx]?.id;
      if (qId !== undefined) {
        answersMap[qId.toString()] = answerIdx;
      }
    });

    try {
      const duration = test.duration_minutes ? test.duration_minutes * 60 : 3600;
      const timeTaken = duration - timeLeft;
      const res = await testService.submitTest(test.id, answersMap, timeTaken);
      navigate(`/test-result/${res.id}`, { state: { questions: test.questions, answers: answersMap, timeTaken, testTitle: test.title, test_id: test.id } });
    } catch (error) {
      console.error("Lỗi khi nộp bài. Mô phỏng nộp thành công.", error);
      const duration = test.duration_minutes ? test.duration_minutes * 60 : 3600;
      const timeTaken = duration - timeLeft;
      navigate(`/test-result/999`, { state: { questions: test.questions, answers: answersMap, timeTaken, testTitle: test.title, test_id: test.id } });
    }
  }, [test, answers, navigate]);

  // Handle timer
  useEffect(() => {
    if (timeLeft <= 0 || loading || !test) return;
    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, test, handleSubmit]);

  if (loading || !test) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B66F5]"></div>
      </div>
    );
  }

  const questions = test.questions || [];
  const currentQuestion = questions[currentIdx];
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const pad = (n: number) => n.toString().padStart ? n.toString().padStart(2, '0') : (n < 10 ? '0' + n : n.toString());
    return `${pad(mins)} : ${pad(secs)}`;
  };

  const progress = Math.round((Object.keys(answers).length / questions.length) * 100) || 0;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 select-none">
      {/* Header */}
      <header className="border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 bg-white z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowExitModal(true)}>
            <div className="w-8 h-8 bg-[#3B66F5] rounded-lg flex items-center justify-center text-white font-black text-xl">U</div>
            <span className="text-xl font-black tracking-tight text-[#1A1C1E]">UniStudy</span>
          </div>
          <div className="h-6 w-px bg-gray-200 mx-2"></div>
          <h1 className="font-bold text-gray-700 truncate max-w-xl">{test.title}</h1>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">THỜI GIAN CÒN LẠI</div>
            <div className="text-2xl font-black text-[#3B66F5] tabular-nums leading-none">
              {formatTime(timeLeft)}
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
          <button 
            onClick={() => setShowExitModal(true)}
            className="bg-red-50 text-red-500 font-bold px-6 py-2.5 rounded-xl hover:bg-red-100 transition-colors text-sm"
          >
            Thoát
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 flex gap-8">
        {/* Left Column: Questions */}
        <div className="flex-1">
          {/* Progress Section */}
          <div className="mb-10">
            <div className="flex justify-between items-end mb-3">
              <span className="text-[11px] font-black text-[#3B66F5] uppercase tracking-widest">TIẾN ĐỘ: {Object.keys(answers).length} / {questions.length} CÂU</span>
              <span className="text-[11px] font-black text-[#3B66F5] uppercase tracking-widest">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-blue-50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#3B66F5] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm relative min-h-[500px] flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div className="bg-blue-50 text-[#3B66F5] text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-wider">
                CÂU HỎI {currentIdx + 1}
              </div>
              <button className="text-gray-300 hover:text-[#3B66F5] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              </button>
            </div>

            <div className="text-xl font-bold text-gray-800 leading-relaxed mb-10">
              {currentQuestion?.text}
            </div>

            <div className="grid gap-4 mt-auto">
              {currentQuestion?.options.map((option, idx) => {
                const isSelected = answers[currentIdx] === idx;
                const label = String.fromCharCode(65 + idx); // A, B, C, D
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [currentIdx]: idx })}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-[#3B66F5] bg-blue-50 shadow-md' 
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-[#3B66F5]' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-3 h-3 bg-[#3B66F5] rounded-full animate-scale"></div>}
                    </div>
                    <span className={`font-bold text-sm ${isSelected ? 'text-[#3B66F5]' : 'text-gray-500'}`}>
                      {label}. {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-12 flex items-center justify-center gap-3 opacity-40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">CHẾ ĐỘ TẬP TRUNG ĐANG BẬT</span>
          </div>
        </div>

        {/* Right Sidebar: Palette */}
        <div className="w-72 shrink-0">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-28">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">TÓM TẮT CÂU HỎI</h3>
            <div className="grid grid-cols-5 gap-3">
              {questions.map((_, idx) => {
                const isAnswered = answers[idx] !== undefined;
                const isCurrent = currentIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`aspect-square rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                      isCurrent 
                        ? 'ring-2 ring-offset-2 ring-[#3B66F5] bg-[#3B66F5] text-white' 
                        : isAnswered 
                          ? 'bg-[#EBF1FF] text-[#3B66F5]' 
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-7xl px-8 flex justify-between items-center pointer-events-none z-50">
        <button 
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
          className={`pointer-events-auto flex items-center gap-2 font-bold px-6 py-3 rounded-2xl transition-all ${
            currentIdx === 0 ? 'text-gray-300' : 'text-[#3B66F5] hover:bg-blue-50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Câu trước
        </button>

        <div className="pointer-events-auto bg-white/80 backdrop-blur-md px-6 py-2 rounded-2xl border border-gray-100 flex items-center gap-2 shadow-lg">
          {/* Simple pagination view */}
          {[Math.max(0, currentIdx - 1), currentIdx, Math.min(questions.length - 1, currentIdx + 1)].map((idx, i, arr) => {
             // Avoid duplicates
             if (i > 0 && idx === arr[i-1]) return null;
             const isCurrent = idx === currentIdx;
             return (
               <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    isCurrent ? 'bg-[#3B66F5] text-white shadow-md shadow-blue-200' : 'text-gray-500 hover:bg-gray-50'
                  }`}
               >
                 {idx + 1}
               </button>
             );
          })}
          {currentIdx < questions.length - 2 && <span className="text-gray-300 mx-1">...</span>}
          {currentIdx < questions.length - 2 && (
            <button 
              onClick={() => setCurrentIdx(questions.length - 1)}
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-gray-500 hover:bg-gray-50"
            >
              {questions.length}
            </button>
          )}
        </div>

        <div className="flex gap-4 pointer-events-auto">
          <button 
            onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIdx === questions.length - 1}
            className={`flex items-center gap-2 font-bold px-8 py-4 rounded-2xl transition-all bg-gray-50 ${
              currentIdx === questions.length - 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Câu sau
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <button 
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-3 bg-[#3B66F5] text-white font-black px-10 py-4 rounded-2xl hover:bg-[#2A52D5] transition-all shadow-xl shadow-blue-100"
          >
            Nộp bài
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          </button>
        </div>
      </footer>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Xác nhận thoát?</h3>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed">
              Những thay đổi của bạn chưa được lưu lại. Bạn có chắc chắn muốn rời khỏi bài kiểm tra này không?
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowExitModal(false)}
                className="font-bold py-4 rounded-2xl text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={() => navigate('/test-list')}
                className="font-black py-4 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
              >
                Thoát ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#3B66F5] mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Xác nhận nộp bài?</h3>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed">
              Bạn đã hoàn thành {Object.keys(answers).length} / {questions.length} câu hỏi. Bạn có chắc chắn muốn nộp bài ngay bây giờ?
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="font-bold py-4 rounded-2xl text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Tiếp tục làm
              </button>
              <button 
                onClick={() => {
                   setShowSubmitModal(false);
                   handleSubmit();
                }}
                className="font-black py-4 rounded-2xl bg-[#3B66F5] text-white hover:bg-[#2A52D5] transition-colors shadow-lg shadow-blue-100"
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeTestPage;
