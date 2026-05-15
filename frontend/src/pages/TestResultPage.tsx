import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Award, 
  ArrowLeft,
  Zap,
  Info,
  BookOpen,
  BarChart3,
  Users,
  History,
  Check,
  X
} from 'lucide-react';
import { testService, TestResultOut } from '../services/test';

const TestResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState<TestResultOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'wrong'>('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let resData: TestResultOut | null = null;
        
        if (location.state && location.state.questions && location.state.answers) {
          const { questions, answers, timeTaken, testTitle, test_id } = location.state;
          const correctCount = questions.reduce((acc: number, q: any) => {
            const userAns = answers[q.id.toString()];
            return acc + (userAns !== undefined && userAns === q.answer ? 1 : 0);
          }, 0);
          const score = (correctCount / (questions.length || 1)) * 10;

          resData = {
            id: id ? parseInt(id) : 999,
            test_id: test_id || 999,
            user_id: 1,
            test_title: testTitle || "Bài kiểm tra mới",
            full_name: "Sinh viên",
            score: score,
            time_taken_seconds: timeTaken || 0,
            rank: 1,
            test_questions: questions,
            answers: answers,
            completed_at: new Date().toISOString()
          };
        } else if (id) {
          resData = await testService.getResultDetail(parseInt(id));
        }

        setResult(resData);
      } catch (error) {
        console.error("Lỗi", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, location.state]);

  if (loading || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Calculate default values if data is missing
  const totalQuestions = result.test_questions?.length ?? 20;
  const correctCount = result.test_questions?.reduce((acc, q) => {
    const userAns = result.answers[q.id.toString()];
    return acc + (userAns !== undefined && userAns === q.answer ? 1 : 0);
  }, 0) ?? 17;
  const incorrectCount = totalQuestions - correctCount;

  const scoreDisplay = result.score?.toFixed(1) ?? '8.5';
  const timeTaken = result.time_taken_seconds ?? 765; // 12:45
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;
  const timeDisplay = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const speedDisplay = (timeTaken / (totalQuestions || 1)).toFixed(1);

  return (
    <div className="max-w-[900px] mx-auto space-y-6 pb-20 pt-4">
      
      {/* Header */}
      <div className="space-y-1">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[12px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors mb-2"
        >
          <ArrowLeft size={12} />
          Quay lại danh sách
        </button>
        <h1 className="text-[22px] font-bold text-slate-900">Kết Quả Bài Kiểm Tra</h1>
        <p className="text-slate-500 text-[13px]">Phân tích chi tiết kết quả học tập của bạn.</p>
      </div>

      {/* Top 5 Cards Grid */}
      <div className="flex gap-4 items-stretch h-[220px]">
        {/* Main Score Card */}
        <div className="w-[30%] bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center relative shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">ĐIỂM SỐ CUỐI CÙNG</p>
          <Award size={20} className="absolute top-4 right-4 text-slate-200" />
          
          <div className="relative w-28 h-28 flex items-center justify-center mb-3">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="50" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
              <circle
                cx="56" cy="56" r="50" stroke="#4f46e5" strokeWidth="8" fill="transparent"
                strokeDasharray="314"
                strokeDashoffset={314 - (314 * parseFloat(scoreDisplay)) / 10}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[32px] font-bold text-slate-900">{scoreDisplay}</span>
          </div>
          
          <h3 className="text-indigo-600 font-bold text-[16px] mb-1">Tuyệt vời!</h3>
          <p className="text-slate-400 text-[11px] text-center leading-snug px-4">
            Bạn đã hoàn thành tốt hơn 85% học viên khác.
          </p>
        </div>

        {/* 4 Stats Cards */}
        <div className="w-[70%] grid grid-cols-2 grid-rows-2 gap-4">
          
          {/* Correct */}
          <div className="bg-white rounded-xl border-t-4 border-t-emerald-500 border-l border-r border-b border-slate-200 p-4 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 size={14} />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Đúng</span>
            </div>
            <div>
              <p className="text-[24px] font-bold text-slate-900 leading-none">{correctCount.toString().padStart(2, '0')}/{totalQuestions}</p>
              <p className="text-[11px] text-slate-400 mt-1">Câu trả lời chính xác</p>
            </div>
          </div>

          {/* Incorrect */}
          <div className="bg-white rounded-xl border-t-4 border-t-rose-500 border-l border-r border-b border-slate-200 p-4 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                <XCircle size={14} />
              </div>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Sai</span>
            </div>
            <div>
              <p className="text-[24px] font-bold text-slate-900 leading-none">{incorrectCount.toString().padStart(2, '0')}/{totalQuestions}</p>
              <p className="text-[11px] text-slate-400 mt-1">Câu trả lời chưa đúng</p>
            </div>
          </div>

          {/* Time */}
          <div className="bg-white rounded-xl border-t-4 border-t-slate-400 border-l border-r border-b border-slate-200 p-4 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                <Clock size={14} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Thời gian</span>
            </div>
            <div>
              <p className="text-[24px] font-bold text-slate-900 leading-none">{timeDisplay}</p>
              <p className="text-[11px] text-slate-400 mt-1">Thời gian làm bài</p>
            </div>
          </div>

          {/* Speed */}
          <div className="bg-white rounded-xl border-t-4 border-t-blue-400 border-l border-r border-b border-slate-200 p-4 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <Zap size={14} />
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Tốc độ</span>
            </div>
            <div>
              <p className="text-[24px] font-bold text-slate-900 leading-none">{speedDisplay}s</p>
              <p className="text-[11px] text-slate-400 mt-1">Trung bình mỗi câu</p>
            </div>
          </div>

        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center justify-between pt-4">
        <h2 className="text-[18px] font-bold text-slate-800">Chi Tiết Câu Hỏi</h2>
        <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 text-[11px] font-bold transition-colors ${filter === 'all' ? 'bg-white text-slate-800' : 'bg-slate-50 text-slate-400'}`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setFilter('wrong')}
            className={`px-4 py-1.5 text-[11px] font-bold transition-colors ${filter === 'wrong' ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-500'}`}
          >
            Chỉ xem câu sai
          </button>
        </div>
      </div>

      {/* Mocked Questions matching the exact design */}
      <div className="space-y-4">
        
        {result.test_questions?.filter((q) => {
          if (filter === 'wrong') return result.answers[q.id.toString()] !== q.answer;
          return true;
        }).map((q, idx) => {
          const userAns = result.answers[q.id.toString()];
          const isCorrect = userAns === q.answer;
          
          return (
            <div key={q.id} className={`bg-white rounded-xl border ${isCorrect ? 'border-slate-200' : 'border-rose-100'} shadow-sm flex overflow-hidden`}>
              <div className={`${isCorrect ? 'bg-emerald-50' : 'bg-rose-50'} w-12 flex flex-col items-center pt-4`}>
                <span className={`${isCorrect ? 'text-emerald-600' : 'text-rose-600'} font-bold text-[13px]`}>
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex-1 p-5 space-y-4">
                <div className={`flex items-center gap-1.5 text-[10px] font-bold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'} uppercase tracking-widest`}>
                  {isCorrect ? <><CheckCircle2 size={12} /> CHÍNH XÁC</> : <><XCircle size={12} /> CHƯA ĐÚNG</>}
                </div>
                <p className="text-[15px] font-bold text-slate-900">{q.text}</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {q.options.map((opt, oIdx) => {
                    const isUserChoice = userAns === oIdx;
                    const isCorrectOpt = q.answer === oIdx;
                    
                    let bgClass = "bg-white opacity-70";
                    let borderClass = "border-slate-200";
                    let textClass = "text-slate-500"; // Updated default text color for options
                    let icon = null;

                    if (isCorrectOpt) {
                      bgClass = "bg-emerald-50";
                      borderClass = "border-emerald-500";
                      textClass = "text-emerald-800";
                      icon = <Check size={16} className="text-emerald-600" />;
                    } else if (isUserChoice && !isCorrect) {
                      bgClass = "bg-rose-50";
                      borderClass = "border-rose-500";
                      textClass = "text-rose-800";
                      icon = <X size={16} className="text-rose-600" />;
                    }

                    return (
                      <div key={oIdx} className={`border ${borderClass} rounded p-3 text-[13px] ${textClass} ${bgClass} flex justify-between items-center`}>
                        <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                        {icon}
                      </div>
                    );
                  })}
                </div>

                {!isCorrect ? (
                  <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-4 mt-2 space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">
                        <Info size={12} /> TẠI SAO SAI?
                      </div>
                      <p className="text-[12px] text-slate-600 italic">
                        Bạn đã chọn đáp án chưa chính xác. Hãy ôn tập lại kiến thức trọng tâm của bài.
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                        <CheckCircle2 size={12} /> KIẾN THỨC ĐÚNG
                      </div>
                      <p className="text-[12px] text-slate-600 italic">
                        {q.explanation || 'Lựa chọn này phản ánh chính xác nhất yêu cầu của câu hỏi.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  q.explanation && (
                    <div className="bg-slate-50 rounded-lg p-4 mt-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2">
                        <Info size={12} /> GIẢI THÍCH CHI TIẾT
                      </div>
                      <p className="text-[12px] text-slate-600 italic">
                        {q.explanation}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}

      </div>

      {/* Recommendation Block */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex gap-6 mt-8">
        <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
          <BarChart3 size={24} className="text-white" />
        </div>
        <div className="flex-1 space-y-3">
          <h3 className="text-[15px] font-bold text-slate-800">Đề xuất học tập</h3>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            Dựa trên kết quả, bạn đang gặp khó khăn ở các khái niệm về <span className="font-bold">{result.test_title || 'chủ đề này'}</span>. Chúng tôi khuyên bạn nên xem lại tài liệu liên quan để cải thiện điểm số.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button className="bg-indigo-500 text-white px-4 py-2 rounded text-[12px] font-bold hover:bg-indigo-600 transition-colors">
              Xem tài liệu liên quan
            </button>
            <button className="bg-white text-indigo-500 border border-indigo-200 px-4 py-2 rounded text-[12px] font-bold hover:bg-indigo-50 transition-colors">
              Lưu vào ghi chú
            </button>
          </div>
        </div>
      </div>

      {/* Bottom 3 Cards */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">CẢI THIỆN</p>
            <p className="text-[14px] font-bold text-slate-900">+12% so với kỳ trước</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center">
            <History size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">LẦN THI THỨ</p>
            <p className="text-[14px] font-bold text-slate-900">Lần 03</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">THỨ HẠNG</p>
            <p className="text-[14px] font-bold text-slate-900">Top {result.rank || 10} Lớp</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TestResultPage;
