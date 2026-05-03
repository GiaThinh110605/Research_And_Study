import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Award, 
  ChevronLeft,
  Calculator,
  Plus,
  Minus,
  Save,
  RotateCcw,
  Zap
} from 'lucide-react';
import { testService, TestResultOut, ITestQuestion } from '../services/test';
import { gradeService, GradeOut } from '../services/grade';

const TestResultPage: React.FC = () => {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const location = useLocation();
   const [result, setResult] = useState<TestResultOut | null>(null);
   const [loading, setLoading] = useState(true);
   const [filter, setFilter] = useState<'all' | 'correct' | 'wrong'>('all');
   
   // GPA Calculator States
   const [grades, setGrades] = useState<any[]>([]);
   const [syncing, setSyncing] = useState(false);

   useEffect(() => {
      const fetchData = async () => {
         setLoading(true);
         try {
            let resData: TestResultOut | null = null;
            
            // 1. Try to get result from location state (immediate feedback)
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
               // 2. Otherwise fetch from API
               resData = await testService.getResultDetail(parseInt(id));
            }

            setResult(resData);

            // 3. Fetch GPA data
            const gradesData = await gradeService.getGrades();
            if (gradesData.length > 0) {
               setGrades(gradesData.map(g => ({ ...g, isEditing: false })));
            } else {
               // Initial mock data if empty
               setGrades([
                  { id: 1, subject_name: 'Môn 1 (3TC)', score: 8.5, credits: 3 },
                  { id: 2, subject_name: 'Môn 2 (4TC)', score: 9.0, credits: 4 },
                  { id: 3, subject_name: 'Môn 3 (2TC)', score: 0, credits: 2, isNew: true }
               ]);
            }
         } catch (error) {
            console.error("Lỗi khi tải dữ liệu", error);
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, [id, location.state]);

   const handleSyncGrades = async () => {
      setSyncing(true);
      try {
         const synced = await gradeService.syncGrades();
         setGrades(synced.map(g => ({ ...g, isEditing: false })));
         alert("Đã đồng bộ điểm số từ các bài kiểm tra!");
      } catch (error) {
         console.error("Lỗi đồng bộ", error);
         alert("Không thể đồng bộ ngay bây giờ.");
      } finally {
         setSyncing(false);
      }
   };

   const updateGradeScore = (id: number, delta: number) => {
      setGrades(prev => prev.map(g => {
         if (g.id === id) {
            const newScore = Math.max(0, Math.min(10, (g.score || 0) + delta));
            return { ...g, score: parseFloat(newScore.toFixed(1)) };
         }
         return g;
      }));
   };

   // Calculations
   const { currentGpa, projectedGpa, totalCredits } = useMemo(() => {
      const filtered = grades.filter(g => (g.score || 0) > 0);
      const totalScore = filtered.reduce((acc, g) => acc + (g.score * g.credits), 0);
      const totalC = filtered.reduce((acc, g) => acc + g.credits, 0);
      
      const current = totalC > 0 ? (totalScore / totalC) : 0;
      
      // For projected, assume some logic or just use current as base
      const gpa4 = (current / 10) * 4;
      
      return {
         currentGpa: parseFloat(gpa4.toFixed(2)),
         projectedGpa: parseFloat((gpa4 + 0.07).toFixed(2)),
         totalCredits: totalC
      };
   }, [grades]);

   if (loading || !result) {
      return (
         <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
         </div>
      );
   }

   const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
   };

   const totalQuestions = result.test_questions?.length || 0;
   const correctCount = result.test_questions?.reduce((acc, q) => {
      const userAns = result.answers[q.id.toString()];
      return acc + (userAns !== undefined && userAns === q.answer ? 1 : 0);
   }, 0) || 0;
   const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

   const filteredQuestions = result.test_questions?.filter((q) => {
      const isCorrect = result.answers[q.id.toString()] === q.answer;
      if (filter === 'correct') return isCorrect;
      if (filter === 'wrong') return !isCorrect;
      return true;
   }) || [];

   return (
      <div className="min-h-screen bg-[#F0F7FF]/50 p-6 font-sans">
         {/* Top Header */}
         <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <Link to="/test-list" className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-blue-600 transition-all border border-white hover:border-blue-100">
                  <ChevronLeft size={24} />
               </Link>
               <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kết quả & Phân tích Học thuật</h1>
                  <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest">STUDENT - UC14 + UC15 - TEST RESULT PAGE & GPA CALCULATOR PAGE</p>
               </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-white">
               <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-wider">Đạt yêu cầu - Giỏi</span>
            </div>
         </div>

         <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
            {/* Left: Results Analysis */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
               
               {/* Summary Card */}
               <div className="bg-white rounded-[48px] p-10 shadow-xl shadow-blue-100/40 border border-white flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
                  {/* Circular Chart */}
                  <div className="relative w-56 h-56 shrink-0 flex items-center justify-center">
                     <svg className="w-full h-full -rotate-90">
                        <circle cx="112" cy="112" r="100" stroke="#F1F5F9" strokeWidth="16" fill="transparent" />
                        <circle 
                           cx="112" cy="112" r="100" stroke="#3B66F5" strokeWidth="16" fill="transparent" 
                           strokeDasharray={628.3} strokeDashoffset={628.3 - (628.3 * accuracy / 100)} 
                           strokeLinecap="round" className="transition-all duration-1000 ease-out"
                           style={{ filter: 'drop-shadow(0 0 8px rgba(59, 102, 245, 0.4))' }}
                        />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-black text-slate-900 tracking-tighter">{accuracy}%</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HOÀN THÀNH</span>
                     </div>
                  </div>

                  <div className="flex-1 space-y-6">
                     <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 leading-tight">
                           {result.test_title}
                        </h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                           Bạn đã vượt qua {correctCount}/{totalQuestions} câu hỏi một cách xuất sắc. Hiệu suất của bạn cao hơn 92% sinh viên cùng khóa.
                        </p>
                     </div>

                     <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-50">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thời gian</p>
                           <p className="text-xl font-black text-slate-800">{formatTime(result.time_taken_seconds || 0)}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Độ chính xác</p>
                           <p className="text-xl font-black text-slate-800">{accuracy}%</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thứ hạng</p>
                           <p className="text-xl font-black text-blue-600">{result.rank}/{result.total_participants || 145}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Questions Detail */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight">Chi tiết câu hỏi</h3>
                     <div className="flex p-1 bg-white rounded-xl shadow-sm border border-white">
                        {['all', 'correct', 'wrong'].map((f) => (
                           <button
                              key={f}
                              onClick={() => setFilter(f as any)}
                              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                 filter === f ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-400 hover:text-slate-600'
                              }`}
                           >
                              {f === 'all' ? 'Tất cả' : f === 'correct' ? `Đúng (${correctCount})` : `Sai (${totalQuestions - correctCount})`}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4">
                     {filteredQuestions.map((q, idx) => {
                        const userAns = result.answers[q.id.toString()];
                        const isCorrect = userAns === q.answer;
                        const label = (i: number) => String.fromCharCode(65 + i);

                        return (
                           <div key={q.id} className={`bg-white rounded-3xl p-8 border transition-all ${isCorrect ? 'border-white' : 'border-red-100 shadow-lg shadow-red-50'}`}>
                              <div className="flex gap-6">
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isCorrect ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                                    {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                                 </div>
                                 <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CÂU HỎI {idx + 1}</p>
                                          <h4 className="text-lg font-bold text-slate-800 leading-snug">{q.text}</h4>
                                       </div>
                                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">ĐỘ KHÓ: CAO</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                       <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-100">
                                          Bạn chọn: {label(userAns)} ({q.options[userAns]})
                                       </span>
                                       {!isCorrect && (
                                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                                             Đáp án đúng: {label(q.answer || 0)} ({q.options[q.answer || 0]})
                                          </span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>

            {/* Right Sidebar: GPA Calculator */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
               <div className="bg-white rounded-[48px] p-8 shadow-xl shadow-blue-100/40 border border-white space-y-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                        <Calculator size={24} />
                     </div>
                     <h2 className="text-2xl font-black text-slate-900 tracking-tight">GPA Calculator</h2>
                  </div>

                  {/* GPA Display */}
                  <div className="bg-blue-50/50 rounded-[32px] p-8 text-center relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/50 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                     <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 relative z-10">GPA HIỆN TẠI</p>
                     <p className="text-6xl font-black text-slate-900 relative z-10">{currentGpa}</p>
                  </div>

                  {/* Subject List */}
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">DỰ PHÓNG ĐIỂM HỌC KỲ MỚI</p>
                     {grades.map((grade) => (
                        <div key={grade.id} className="group p-4 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:border-blue-100 transition-all flex items-center justify-between">
                           <div className="space-y-1 max-w-[150px]">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                 {grade.subject_name.split('(')[0]}
                              </p>
                              <p className="text-sm font-black text-slate-700 truncate">{grade.score || 'Nhập điểm'}</p>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="flex flex-col gap-1">
                                 <button onClick={() => updateGradeScore(grade.id, 0.5)} className="p-1 hover:bg-blue-50 text-slate-300 hover:text-blue-500 rounded-md transition-all">
                                    <Plus size={14} />
                                 </button>
                                 <button onClick={() => updateGradeScore(grade.id, -0.5)} className="p-1 hover:bg-blue-50 text-slate-300 hover:text-blue-500 rounded-md transition-all">
                                    <Minus size={14} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Summary */}
                  <div className="pt-6 border-t border-slate-50 space-y-6">
                     <div className="flex justify-between items-end">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">DỰ KIẾN GPA TỔNG</p>
                           <p className="text-5xl font-black text-slate-900 tracking-tighter">{projectedGpa}</p>
                        </div>
                        <div className="text-right text-emerald-500 flex flex-col items-end">
                           <div className="flex items-center gap-1 font-black text-sm">
                              <TrendingUp size={14} />
                              +0.07
                           </div>
                           <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Sắp đạt loại Xuất sắc</p>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <button 
                           onClick={handleSyncGrades}
                           disabled={syncing}
                           className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[24px] shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                           <RotateCcw size={18} className={syncing ? 'animate-spin' : ''} />
                           Lưu cấu hình dự kiến
                        </button>
                        <button className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[24px] shadow-lg shadow-slate-100 transition-all active:scale-95 flex items-center justify-center gap-3 group">
                           <Save size={18} />
                           Xuất báo cáo PDF
                        </button>
                     </div>
                  </div>
               </div>

               {/* Goal Card */}
               <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[48px] p-8 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                  <div className="relative z-10 space-y-6">
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Zap size={24} className="text-amber-400" />
                     </div>
                     <div>
                        <h4 className="text-xl font-black tracking-tight leading-tight mb-2">Mục tiêu của bạn:</h4>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                           Đạt top 5% toàn viện trong học kỳ này.
                        </p>
                     </div>
                     <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 w-fit text-xs font-black tracking-widest uppercase">
                        SAFE - WORK
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default TestResultPage;

