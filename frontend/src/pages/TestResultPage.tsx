import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { testService, TestResultOut, ITestQuestion } from '../services/test';
import { mockTestResult } from '../mock_data/test_result';

const TestResultPage: React.FC = () => {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const location = useLocation();
   const [result, setResult] = useState<TestResultOut | null>(null);
   const [loading, setLoading] = useState(true);
   const [filter, setFilter] = useState<'all' | 'wrong'>('all');

   useEffect(() => {
      // Check if we have data passed in via location.state (immediate feedback)
      if (location.state && location.state.questions && location.state.answers) {
         const { questions, answers, timeTaken, testTitle, test_id } = location.state;
         
         // Calculate score based on state
         const correctCount = questions.reduce((acc: number, q: ITestQuestion) => {
            const userAns = answers[q.id.toString()];
            return acc + (userAns !== undefined && userAns === q.answer ? 1 : 0);
         }, 0);
         const score = (correctCount / (questions.length || 1)) * 10;

         setResult({
            id: id ? parseInt(id) : 999,
            test_id: test_id || 999,
            user_id: 1, // Placeholder user_id
            test_title: testTitle || "Bài kiểm tra mới",
            full_name: "Nguyễn", // Fallback name
            score: score,
            time_taken_seconds: timeTaken || 0,
            rank: 1,
            test_questions: questions,
            answers: answers,
            completed_at: new Date().toISOString()
         });
         setLoading(false);
         return;
      }

      const fetchResult = async () => {
         if (!id) return;
         try {
            const data = await testService.getResultDetail(parseInt(id));
            if (!data || !data.test_questions) {
               throw new Error("No data or questions");
            }
            setResult(data);
         } catch (error) {
            console.error("Lỗi khi tải kết quả. Mô phỏng dữ liệu.", error);
            setResult(mockTestResult);
         } finally {
            setLoading(false);
         }
      };
      fetchResult();
   }, [id, navigate]);

   if (loading || !result) {
      return (
         <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B66F5]"></div>
         </div>
      );
   }

   const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
   };

   const correctCount = result.test_questions?.reduce((acc, q) => {
      const userAns = result.answers[q.id.toString()];
      return acc + (userAns !== undefined && userAns === q.answer ? 1 : 0);
   }, 0) || 0;
   const totalQuestions = result.test_questions?.length || 0;
   const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

   const filteredQuestions = result.test_questions?.filter((_q, idx) => {
      const isCorrect = result.answers[result.test_questions?.[idx]?.id || ''] === result.test_questions?.[idx]?.answer;
      return filter === 'all' || !isCorrect;
   }) || [];

   return (
      <div className="min-h-screen bg-[#F8FAFF] font-sans pb-20">


         <main className="max-w-6xl mx-auto px-8 pt-10">
            <div className="grid grid-cols-3 gap-8">
               {/* Left Hero Card */}
               <div className="col-span-2 bg-white rounded-[32px] p-10 shadow-sm border border-gray-50 relative overflow-hidden flex items-center justify-between">
                  <div className="flex-1 pr-10">
                     <div className="bg-emerald-50 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider inline-block mb-6">
                        HOÀN THÀNH
                     </div>
                     <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Chúc mừng, {result.full_name?.split(' ')[0]}!</h2>
                     <p className="text-gray-500 font-medium mb-10 leading-relaxed text-lg">
                        Bạn đã hoàn thành bài kiểm tra <span className="text-[#3B66F5] font-bold">{result.test_title}</span> một cách xuất sắc.
                     </p>
                     <div className="flex gap-4">
                        <button
                           onClick={() => navigate(`/take-test/${result.test_id}`)}
                           className="bg-[#3B66F5] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#2A52D5] transition-all flex items-center gap-2"
                        >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                           Làm lại
                        </button>
                        <button
                           onClick={() => navigate('/dashboard')}
                           className="bg-gray-50 text-gray-700 font-bold px-8 py-4 rounded-2xl hover:bg-gray-100 transition-all flex items-center gap-2"
                        >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                           Về trang chủ
                        </button>
                     </div>
                  </div>

                  <div className="bg-[#3B66F5] w-48 h-[240px] rounded-3xl flex flex-col items-center justify-center text-white relative shadow-xl shadow-blue-100">
                     <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                           <circle cx="64" cy="64" r="58" stroke="rgba(255,255,255,0.2)" strokeWidth="12" fill="transparent" />
                           <circle cx="64" cy="64" r="58" stroke="white" strokeWidth="12" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * accuracy / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-3xl font-black">{(accuracy / 10).toFixed(1)}</span>
                           <span className="text-[10px] font-bold opacity-60">HỆ 10</span>
                        </div>
                     </div>
                     <div className="mt-4 text-center">
                        <div className="text-sm font-bold">Tỉ lệ đúng {accuracy}%</div>
                     </div>
                  </div>
               </div>

               {/* Top Stats Cards */}
               <div className="flex flex-col gap-8">
                  <div className="bg-white rounded-[28px] p-8 shadow-sm border border-gray-50 flex-1 relative overflow-hidden">
                     <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-[#3B66F5] mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">THỜI GIAN LÀM</div>
                     <div className="text-3xl font-black text-gray-900">{formatTime(result.time_taken_seconds || 0)}</div>
                     <p className="text-[11px] text-gray-400 font-medium mt-3 leading-relaxed">
                        Nhanh hơn 75% so với mức trung bình của sinh viên khác.
                     </p>
                  </div>

                  <div className="bg-white rounded-[28px] p-8 shadow-sm border border-gray-50 flex-1">
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-1.5">
                           <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                           <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                           <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CHI TIẾT</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">CÂU ĐÚNG</div>
                           <div className="text-xl font-black text-gray-900">{correctCount}/{totalQuestions}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">THỨ HẠNG</div>
                           <div className="text-xl font-black text-gray-900">#{result.rank}</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Answer Review */}
            <div className="mt-16">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Xem lại đáp án</h3>
                  <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100 flex gap-1">
                     <button
                        onClick={() => setFilter('all')}
                        className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-[#3B66F5] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                     >
                        Tất cả
                     </button>
                     <button
                        onClick={() => setFilter('wrong')}
                        className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'wrong' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                     >
                        Câu sai
                     </button>
                  </div>
               </div>

               <div className="flex flex-col gap-8">
                  {filteredQuestions.map((question: ITestQuestion, idx: number) => {
                     const userAns = result.answers[question.id.toString()];
                     const correctAns = question.answer;
                     const isCorrect = userAns === correctAns;

                     return (
                        <div key={question.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50">
                           <div className="flex justify-between items-center mb-6">
                              <div className="bg-blue-50 text-[#3B66F5] text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-wider">
                                 CÂU HỎI {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                              </div>
                              <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                                 <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'}`}>
                                    {isCorrect ? <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
                                 </div>
                                 {isCorrect ? 'ĐÚNG' : 'SAI'}
                              </div>
                           </div>

                           <div className="text-xl font-bold text-gray-800 leading-relaxed mb-8">
                              {question.text}
                           </div>

                           <div className="grid gap-4 mb-8">
                              {question.options.map((option, optIdx) => {
                                 const isUserSelection = userAns === optIdx;
                                 const isCorrectOption = correctAns === optIdx;
                                 const label = String.fromCharCode(65 + optIdx);

                                 let borderClass = "border-gray-50";
                                 let bgClass = "bg-white";
                                 let textClass = "text-gray-500";
                                 let circleBorder = "border-gray-300";

                                 if (isCorrectOption) {
                                    borderClass = "border-emerald-500";
                                    bgClass = "bg-emerald-50/30";
                                    textClass = "text-emerald-700 font-bold";
                                    circleBorder = "border-emerald-500";
                                 } else if (isUserSelection && !isCorrect) {
                                    borderClass = "border-red-500";
                                    bgClass = "bg-red-50/30";
                                    textClass = "text-red-700 font-bold";
                                    circleBorder = "border-red-500";
                                 }

                                 return (
                                    <div key={optIdx} className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${borderClass} ${bgClass} relative`}>
                                       <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${circleBorder}`}>
                                          {label}
                                       </div>
                                       <span className={`text-base font-medium ${textClass}`}>{option}</span>
                                       {isCorrectOption && (
                                          <div className="absolute right-6 text-emerald-500">
                                             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                          </div>
                                       )}
                                       {isUserSelection && !isCorrect && (
                                          <div className="absolute right-6 text-red-500">
                                             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                          </div>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>

                           <div className="bg-blue-50/50 rounded-2xl p-6 border-l-4 border-[#3B66F5]">
                              <div className="flex items-center gap-2 text-[#3B66F5] text-[10px] font-black uppercase tracking-widest mb-3">
                                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                 GIẢI THÍCH
                              </div>
                              <p className="text-gray-600 text-sm italic font-medium leading-relaxed">
                                 {question.explanation || "Chưa có lời giải thích chi tiết cho câu hỏi này. Tuy nhiên, bạn có thể tham khảo kiến thức trong Chương 3 để hiểu rõ hơn."}
                              </p>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* Improved Recommendations */}
            <div className="mt-20">
               <h3 className="text-xl font-bold text-gray-900 mb-8 tracking-tight">Đề xuất cải thiện</h3>
               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-6 cursor-pointer hover:shadow-lg hover:shadow-blue-100 transition-all border-b-4 border-b-blue-500">
                     <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#3B66F5]">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                     </div>
                     <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">Ôn tập về {result.test_title?.split('-')[0] || 'Kiến thức cốt lõi'}</h4>
                        <p className="text-xs text-gray-400 font-medium">Bài học chi tiết về các khái niệm cơ bản</p>
                     </div>
                     <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-6 cursor-pointer hover:shadow-lg hover:shadow-orange-100 transition-all border-b-4 border-b-orange-500">
                     <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">Video: Giải thích Big O dễ hiểu</h4>
                        <p className="text-xs text-gray-400 font-medium">Video giải thích thuật toán trực quan</p>
                     </div>
                     <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
};

export default TestResultPage;
