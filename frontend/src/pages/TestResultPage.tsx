import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { testService, TestResultOut, ITestQuestion } from '../services/test';

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
            console.error("Lỗi khi tải kết quả", error);
            setResult(null);
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
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
   };

   const correctCount = result.test_questions?.reduce((acc, q) => {
      const userAns = result.answers[q.id.toString()];
      return acc + (userAns !== undefined && userAns === q.answer ? 1 : 0);
   }, 0) || 0;
   const totalQuestions = result.test_questions?.length || 0;
   const score10 = totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0;
   const wrongCount = totalQuestions - correctCount;

   const avgTimePerQuestion = totalQuestions > 0 ? ((result.time_taken_seconds || 0) / totalQuestions).toFixed(1) : 0;

   const filteredQuestions = result.test_questions?.filter((_q, idx) => {
      const isCorrect = result.answers[result.test_questions?.[idx]?.id || ''] === result.test_questions?.[idx]?.answer;
      return filter === 'all' || !isCorrect;
   }) || [];

   return (
      <div className="min-h-screen bg-white font-sans pb-20">
         <main className="max-w-6xl mx-auto px-8 pt-6">
            
            {/* Header Area */}
            <div className="mb-6">
               <Link to="/test-list" className="inline-flex items-center text-[#3B66F5] font-medium text-sm hover:underline mb-2">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Quay lại danh sách
               </Link>
               <h1 className="text-3xl font-bold text-gray-900 mb-1">Kết Quả Bài Kiểm Tra</h1>
               <p className="text-sm text-gray-500">Phân tích chi tiết kết quả học tập của bạn.</p>
            </div>

            {/* Top Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
               
               {/* Final Score Card */}
               <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-4 left-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ĐIỂM SỐ CUỐI CÙNG</div>
                  <div className="absolute top-4 right-4 text-blue-100">
                     <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  </div>
                  
                  <div className="mt-6 relative w-32 h-32 flex flex-col items-center justify-center">
                     <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="#EEF2FF" strokeWidth="8" fill="transparent" />
                        <circle cx="64" cy="64" r="56" stroke="#3B66F5" strokeWidth="8" fill="transparent" strokeDasharray={351.8} strokeDashoffset={351.8 - (351.8 * score10 / 10)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                     </svg>
                     <span className="text-4xl font-bold text-gray-900 z-10">{score10.toFixed(1)}</span>
                  </div>
                  
                  <div className="mt-4 text-center">
                     <div className="text-lg font-bold text-[#3B66F5] mb-1">Tuyệt vời!</div>
                     <p className="text-xs text-gray-500 max-w-[200px]">Bạn đã hoàn thành tốt hơn 85% học viên khác.</p>
                  </div>
               </div>

               {/* Right 4 Stats Cards */}
               <div className="col-span-2 grid grid-cols-2 gap-4">
                  {/* Correct Answers */}
                  <div className="bg-white rounded-2xl border-t-4 border-t-emerald-500 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5 relative flex flex-col justify-between">
                     <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Đúng</div>
                     <div>
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{correctCount.toString().padStart(2, '0')}/{totalQuestions}</div>
                     </div>
                     <div className="text-xs text-gray-500 mt-1">Câu trả lời chính xác</div>
                  </div>

                  {/* Wrong Answers */}
                  <div className="bg-white rounded-2xl border-t-4 border-t-red-500 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5 relative flex flex-col justify-between">
                     <div className="absolute top-4 right-4 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Sai</div>
                     <div>
                        <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-2">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{wrongCount.toString().padStart(2, '0')}/{totalQuestions}</div>
                     </div>
                     <div className="text-xs text-gray-500 mt-1">Câu trả lời chưa đúng</div>
                  </div>

                  {/* Time Taken */}
                  <div className="bg-white rounded-2xl border-t-4 border-t-blue-400 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5 relative flex flex-col justify-between">
                     <div className="absolute top-4 right-4 bg-blue-50 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Thời gian</div>
                     <div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center mb-2">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{formatTime(result.time_taken_seconds || 0)}</div>
                     </div>
                     <div className="text-xs text-gray-500 mt-1">Thời gian làm bài</div>
                  </div>

                  {/* Speed */}
                  <div className="bg-white rounded-2xl border-t-4 border-t-indigo-400 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5 relative flex flex-col justify-between">
                     <div className="absolute top-4 right-4 bg-indigo-50 text-indigo-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Tốc độ</div>
                     <div>
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-2">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{avgTimePerQuestion}s</div>
                     </div>
                     <div className="text-xs text-gray-500 mt-1">Trung bình mỗi câu</div>
                  </div>
               </div>
            </div>

            {/* Details Section */}
            <div className="mb-6 flex justify-between items-end">
               <h3 className="text-xl font-bold text-gray-900">Chi Tiết Câu Hỏi</h3>
               <div className="flex bg-gray-100 rounded-lg p-1">
                  <button 
                     onClick={() => setFilter('all')}
                     className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                     Tất cả
                  </button>
                  <button 
                     onClick={() => setFilter('wrong')}
                     className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === 'wrong' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                     Chỉ xem câu sai
                  </button>
               </div>
            </div>

            <div className="flex flex-col gap-6 mb-10">
               {filteredQuestions.map((question: ITestQuestion, idx: number) => {
                  const userAns = result.answers[question.id.toString()];
                  const correctAns = question.answer;
                  const isCorrect = userAns === correctAns;

                  return (
                     <div key={question.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex gap-4">
                        {/* Number Indicator */}
                        <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                           {(idx + 1).toString().padStart(2, '0')}
                        </div>

                        <div className="flex-1">
                           {/* Status Label */}
                           <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2 ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                              {isCorrect ? (
                                 <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                              ) : (
                                 <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                              )}
                              {isCorrect ? 'CHÍNH XÁC' : 'CHƯA ĐÚNG'}
                           </div>

                           <div className="text-lg font-bold text-gray-900 mb-4 leading-snug">
                              {question.text}
                           </div>

                           <div className="grid grid-cols-2 gap-3 mb-4">
                              {question.options.map((option, optIdx) => {
                                 const isUserSelection = userAns === optIdx;
                                 const isCorrectOption = correctAns === optIdx;
                                 const label = `${String.fromCharCode(65 + optIdx)}.`;

                                 let containerClass = "border-gray-100 bg-gray-50/50 text-gray-600";
                                 let textClass = "";

                                 if (isCorrectOption) {
                                    containerClass = "border-emerald-500 bg-emerald-50 text-emerald-800";
                                    textClass = "font-bold";
                                 } else if (isUserSelection && !isCorrect) {
                                    containerClass = "border-red-400 bg-red-50 text-red-800";
                                    textClass = "font-bold";
                                 }

                                 return (
                                    <div key={optIdx} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${containerClass}`}>
                                       <div className="flex items-start gap-2">
                                          <span className={`font-semibold shrink-0 ${textClass}`}>{label}</span>
                                          <span className={`text-sm ${textClass}`}>{option}</span>
                                       </div>
                                       
                                       {isCorrectOption && (
                                          <svg className="w-5 h-5 shrink-0 text-emerald-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                       )}
                                       {isUserSelection && !isCorrect && (
                                          <svg className="w-5 h-5 shrink-0 text-red-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>

                           {/* Explanations */}
                           {isCorrect ? (
                              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                                 <div className="flex items-center gap-1.5 text-[#3B66F5] text-[10px] font-bold uppercase tracking-wider mb-2">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                    GIẢI THÍCH CHI TIẾT
                                 </div>
                                 <p className="text-gray-600 text-sm italic">
                                    {question.explanation || "Giải thích chi tiết chưa được cập nhật cho câu hỏi này."}
                                 </p>
                              </div>
                           ) : (
                              <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100">
                                 <div className="flex flex-col gap-4">
                                    <div>
                                       <div className="flex items-center gap-1.5 text-red-600 text-[10px] font-bold uppercase tracking-wider mb-1">
                                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                          TẠI SAO SAI?
                                       </div>
                                       <p className="text-gray-600 text-sm italic">Bạn đã chọn sai. Xem lại kiến thức về phần này để hiểu rõ hơn.</p>
                                    </div>
                                    <div>
                                       <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase tracking-wider mb-1">
                                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                          KIẾN THỨC ĐÚNG
                                       </div>
                                       <p className="text-gray-600 text-sm italic">{question.explanation || "Giải thích chi tiết chưa được cập nhật cho câu hỏi này."}</p>
                                    </div>
                                 </div>
                              </div>
                           )}

                        </div>
                     </div>
                  );
               })}
            </div>

            {/* Recommendations */}
            <div className="bg-[#F4F7FF] rounded-2xl p-6 mb-6 flex flex-col md:flex-row gap-6 items-start border border-[#E5EDFF]">
               <div className="w-12 h-12 rounded-xl bg-[#5E6AD2] text-white flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
               </div>
               <div className="flex-1">
                  <h4 className="text-base font-bold text-gray-900 mb-2">Đề xuất học tập</h4>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                     Dựa trên kết quả, bạn đang gặp khó khăn ở các khái niệm về <strong className="text-gray-900">Học máy không giám sát</strong>. 
                     Chúng tôi khuyên bạn nên xem lại chương 4 trong tài liệu "Nguyên lý Machine Learning" để cải thiện điểm số.
                  </p>
                  <div className="flex gap-3">
                     <button className="bg-[#3B66F5] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors">
                        Xem tài liệu liên quan
                     </button>
                     <button className="bg-white text-[#3B66F5] border border-[#3B66F5] px-5 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">
                        Lưu vào ghi chú
                     </button>
                  </div>
               </div>
            </div>

            {/* Bottom 3 Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  <div>
                     <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">CẢI THIỆN</div>
                     <div className="font-bold text-gray-900">+12% so với kỳ trước</div>
                  </div>
               </div>
               
               <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                     <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">LẦN THI THỨ</div>
                     <div className="font-bold text-gray-900">Lần 03</div>
                  </div>
               </div>

               <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  </div>
                  <div>
                     <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">THỨ HẠNG</div>
                     <div className="font-bold text-gray-900">Top 10 Lớp</div>
                  </div>
               </div>
            </div>

         </main>
      </div>
   );
};

export default TestResultPage;

