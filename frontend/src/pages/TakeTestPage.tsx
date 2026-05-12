import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  AlertCircle,
  XCircle,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { testService, TestOut } from '../services/test';

const TakeTestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<TestOut | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      if (!id) return;
      try {
        const data = await testService.getTest(parseInt(id));
        if (!data || !data.questions || data.questions.length === 0) {
           throw new Error("Bài kiểm tra chưa có câu hỏi.");
        }
        setTest(data);
        setTimeLeft((data.duration_minutes || 60) * 60);
      } catch (error) {
        console.error("Lỗi khi tải đề thi", error);
        setTest(null);
        setErrorMessage("Không thể bắt đầu bài kiểm tra. Vui lòng thử lại sau hoặc liên hệ quản trị để tạo câu hỏi.");
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

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
      const duration = (test.duration_minutes || 60) * 60;
      const timeTaken = duration - timeLeft;
      const res = await testService.submitTest(test.id, answersMap, timeTaken);
      navigate(`/test-result/${res.id}`, { state: { questions: test.questions, answers: answersMap, timeTaken, testTitle: test.title, test_id: test.id } });
    } catch (error) {
      console.error("Lỗi khi nộp bài", error);
      // Fallback for simulation if API fails in dev
      const duration = (test.duration_minutes || 60) * 60;
      const timeTaken = duration - timeLeft;
      navigate(`/test-result/999`, { state: { questions: test.questions, answers: answersMap, timeTaken, testTitle: test.title, test_id: test.id } });
    }
  }, [test, answers, timeLeft, navigate]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
          <p className="text-slate-700 font-bold">{errorMessage || 'Không thể tải bài kiểm tra.'}</p>
          <button
            onClick={() => navigate('/test-list')}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            Quay lại danh sách bài kiểm tra
          </button>
        </div>
      </div>
    );
  }

  const questions = test.questions || [];
  const currentQuestion = questions[currentIdx];
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = Math.round((Object.keys(answers).length / questions.length) * 100) || 0;
  const isAnswered = (idx: number) => answers[idx] !== undefined;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowExitModal(true)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <h1 className="font-black text-slate-800 text-lg leading-tight truncate max-w-md">{test.title}</h1>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{test.subject}</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 bg-blue-50 px-6 py-2.5 rounded-2xl border border-blue-100">
            <Clock className="text-blue-600 animate-pulse" size={20} />
            <span className="text-xl font-black text-blue-600 tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </div>
          <button 
            onClick={() => setShowSubmitModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
          >
            <Send size={18} />
            Nộp bài
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 grid grid-cols-12 gap-8">
        {/* Left: Question Content */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Progress Bar */}
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tiến độ làm bài</span>
              <span className="text-sm font-black text-blue-600">{Object.keys(answers).length} / {questions.length} câu</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-10 space-y-8 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-black uppercase tracking-widest">
                Câu hỏi {currentIdx + 1}
              </div>
              <button className="text-slate-200 hover:text-blue-500 transition-colors">
                <Bookmark size={24} />
              </button>
            </div>

            <div className="text-2xl font-bold text-slate-800 leading-relaxed">
              {currentQuestion?.text}
            </div>

            <div className="grid gap-4">
              {currentQuestion?.options.map((option, idx) => {
                const isSelected = answers[currentIdx] === idx;
                const label = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [currentIdx]: idx })}
                    className={`flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-left group ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50 shadow-md' 
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center font-black text-sm transition-all ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-400 group-hover:border-slate-300'
                    }`}>
                      {label}
                    </div>
                    <span className={`text-lg font-bold ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center px-4">
            <button 
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-3 font-black text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all p-4"
            >
              <ChevronLeft size={24} />
              CÂU TRƯỚC
            </button>
            <button 
              onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIdx === questions.length - 1}
              className="flex items-center gap-3 font-black text-slate-700 hover:text-blue-600 disabled:opacity-30 transition-all p-4"
            >
              CÂU SAU
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Right: Question Map */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm sticky top-32 space-y-6">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Bản đồ câu hỏi</h3>
            <div className="grid grid-cols-5 gap-3">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`aspect-square rounded-xl text-xs font-black transition-all border-2 flex items-center justify-center ${
                    currentIdx === idx 
                      ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100 scale-110' 
                      : isAnswered(idx) 
                        ? 'border-blue-100 bg-blue-50 text-blue-600' 
                        : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            
            <div className="pt-6 border-t border-slate-50 space-y-3">
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                <div className="w-3 h-3 bg-blue-600 rounded-sm" />
                ĐANG XEM
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                <div className="w-3 h-3 bg-blue-50 border border-blue-100 rounded-sm" />
                ĐÃ TRẢ LỜI
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                <div className="w-3 h-3 bg-slate-50 rounded-sm" />
                CHƯA TRẢ LỜI
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-12 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-8">
              <XCircle size={40} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Thoát bài thi?</h3>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
              Dữ liệu làm bài của bạn sẽ không được lưu lại nếu bạn thoát ngay bây giờ.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowExitModal(false)}
                className="font-black py-4 rounded-2xl text-slate-400 hover:bg-slate-50 transition-all"
              >
                HỦY BỎ
              </button>
              <button 
                onClick={() => navigate('/test-list')}
                className="font-black py-4 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-all shadow-xl shadow-red-100"
              >
                THOÁT NGAY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-12 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 ${
              Object.keys(answers).length < questions.length ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-600'
            }`}>
              {Object.keys(answers).length < questions.length ? <AlertCircle size={40} /> : <CheckCircle2 size={40} />}
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Xác nhận nộp bài?</h3>
            <p className="text-slate-500 font-medium mb-4 leading-relaxed">
              Bạn đã hoàn thành <span className="font-black text-blue-600">{Object.keys(answers).length} / {questions.length}</span> câu hỏi.
            </p>
            {Object.keys(answers).length < questions.length && (
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-amber-700 text-xs font-bold mb-10">
                Lưu ý: Có câu hỏi chưa được trả lời!
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="font-black py-4 rounded-2xl text-slate-400 hover:bg-slate-50 transition-all"
              >
                LÀM TIẾP
              </button>
              <button 
                onClick={() => {
                   setShowSubmitModal(false);
                   handleSubmit();
                }}
                className="font-black py-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
              >
                NỘP BÀI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeTestPage;
