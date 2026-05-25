import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Award, 
  ArrowLeft,
  Zap,
  Info,
  BarChart3,
  Check,
  X,
  User
} from 'lucide-react';
import { testService, TestResultOut } from '../services/test';

const LecturerResultDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<TestResultOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'wrong'>('all');

  const getCorrectAnswer = (question: any) => {
    if (question?.answer !== undefined) return question.answer;
    if (question?.correct_answer !== undefined) return question.correct_answer;
    if (question?.correct_option !== undefined) return question.correct_option;
    if (question?.correct !== undefined) return question.correct;
    return undefined;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (id) {
          const resData = await testService.getResultDetail(parseInt(id));
          setResult(resData);
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết kết quả", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalQuestions = result.test_questions?.length ?? 0;
  const correctCount = result.test_questions?.reduce((acc, q) => {
    const userAns = result.answers[q.id.toString()];
    const correctAns = getCorrectAnswer(q);
    return acc + (userAns !== undefined && correctAns !== undefined && String(userAns) === String(correctAns) ? 1 : 0);
  }, 0) ?? 0;
  const incorrectCount = totalQuestions - correctCount;

  const scoreDisplay = result.score?.toFixed(1) ?? '0.0';
  const timeTaken = result.time_taken_seconds ?? 0;
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;
  const timeDisplay = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const speedDisplay = totalQuestions > 0 ? (timeTaken / totalQuestions).toFixed(1) : '0.0';

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-20 pt-4 px-4">
      
      {/* Breadcrumbs & Header */}
      <div className="space-y-2">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[12px] font-bold text-[#3B66F5] hover:underline mb-2"
        >
          <ArrowLeft size={12} />
          Quay lại danh sách kết quả
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-black text-slate-900 tracking-tight">Chi tiết bài làm sinh viên</h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-[#3B66F5] rounded-md text-[11px] font-bold">
                <User size={12} />
                {result.full_name}
              </div>
              <div className="text-slate-400 text-[12px] font-medium">
                Bài thi: <span className="text-slate-700 font-bold">{result.test_title}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-slate-400">Hoàn thành lúc:</span>
            <span className="text-[12px] font-black text-slate-700">
              {new Date(result.completed_at).toLocaleString('vi-VN')}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Score Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col items-center justify-center shadow-sm lg:col-span-1">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Điểm số</p>
          <div className="relative w-24 h-24 flex items-center justify-center mb-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="42" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
              <circle
                cx="48" cy="48" r="42" stroke="#3B66F5" strokeWidth="8" fill="transparent"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * parseFloat(scoreDisplay)) / 10}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-[28px] font-black text-slate-900">{scoreDisplay}</span>
          </div>
          <p className="text-[12px] font-bold text-[#3B66F5]">Xếp hạng: {result.rank}/{result.total_participants}</p>
        </div>

        {/* Other Stats */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-3">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-[20px] font-black text-slate-900">{correctCount}/{totalQuestions}</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Câu đúng</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-3">
              <XCircle size={20} />
            </div>
            <p className="text-[20px] font-black text-slate-900">{incorrectCount}/{totalQuestions}</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Câu sai</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
            <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center mb-3">
              <Clock size={20} />
            </div>
            <p className="text-[20px] font-black text-slate-900">{timeDisplay}</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Thời gian</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-3">
              <Zap size={20} />
            </div>
            <p className="text-[20px] font-black text-slate-900">{speedDisplay}s</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Tốc độ/câu</p>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center justify-between pt-4">
        <h2 className="text-[18px] font-black text-slate-800 tracking-tight">Chi tiết từng câu hỏi</h2>
        <div className="flex bg-slate-100 rounded-xl p-1">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all ${filter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setFilter('wrong')}
            className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all ${filter === 'wrong' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500'}`}
          >
            Chỉ câu sai
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {result.test_questions?.filter((q) => {
          if (filter === 'wrong') {
            const correctAns = getCorrectAnswer(q);
            return String(result.answers[q.id.toString()]) !== String(correctAns);
          }
          return true;
        }).map((q, idx) => {
          const userAns = result.answers[q.id.toString()];
          const correctAns = getCorrectAnswer(q);
          const isCorrect = correctAns !== undefined && String(userAns) === String(correctAns);
          
          return (
            <div key={q.id} className={`bg-white rounded-3xl border-2 ${isCorrect ? 'border-slate-50' : 'border-rose-50'} shadow-sm flex overflow-hidden group hover:border-[#3B66F520] transition-all`}>
              <div className={`${isCorrect ? 'bg-emerald-50' : 'bg-rose-50'} w-14 flex flex-col items-center pt-6 shrink-0`}>
                <span className={`${isCorrect ? 'text-emerald-600' : 'text-rose-600'} font-black text-[15px]`}>
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
              </div>
              
              <div className="flex-1 p-6 space-y-4">
                <div className={`flex items-center gap-2 text-[10px] font-black ${isCorrect ? 'text-emerald-500' : 'text-rose-500'} uppercase tracking-widest`}>
                  {isCorrect ? <><CheckCircle2 size={12} /> ĐÚNG</> : <><XCircle size={12} /> SAI</>}
                </div>
                
                <p className="text-[16px] font-bold text-slate-900 leading-snug">{q.text}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt, oIdx) => {
                    const isUserChoice = String(userAns) === String(oIdx);
                    const isCorrectOpt = correctAns !== undefined && String(correctAns) === String(oIdx);
                    
                    let bgClass = "bg-white";
                    let borderClass = "border-slate-100";
                    let textClass = "text-slate-600";
                    let icon = null;

                    if (isCorrectOpt) {
                      bgClass = "bg-emerald-50";
                      borderClass = "border-emerald-200";
                      textClass = "text-emerald-700 font-bold";
                      icon = <Check size={16} className="text-emerald-500" />;
                    } else if (isUserChoice && !isCorrect) {
                      bgClass = "bg-rose-50";
                      borderClass = "border-rose-200";
                      textClass = "text-rose-700 font-bold";
                      icon = <X size={16} className="text-rose-500" />;
                    }

                    return (
                      <div key={oIdx} className={`border-2 ${borderClass} rounded-2xl p-4 text-[13px] ${textClass} ${bgClass} flex justify-between items-center transition-all`}>
                        <span className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black ${isCorrectOpt ? 'bg-emerald-100' : isUserChoice ? 'bg-rose-100' : 'bg-slate-50 text-slate-400'}`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          {opt}
                        </span>
                        {icon}
                      </div>
                    );
                  })}
                </div>

                {!isCorrect && (
                  <div className="bg-slate-50 rounded-2xl p-4 mt-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#3B66F5] uppercase tracking-widest mb-1">
                      <Info size={14} /> Ghi chú cho giảng viên
                    </div>
                    <p className="text-[12px] text-slate-500 italic">
                      Sinh viên đã chọn đáp án {String.fromCharCode(65 + Number(userAns))}. Đáp án chính xác là {String.fromCharCode(65 + Number(q.answer))}.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LecturerResultDetailPage;
