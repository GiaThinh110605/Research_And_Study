import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Clock, 
  Filter, 
  BarChart3, 
  Plus, 
  CheckCircle2,
  FileText,
  BookOpen,
  Microscope,
  Search,
  Star,
  TrendingUp
} from 'lucide-react';
import { testService, TestOut } from '../services/test';

const TestListPage: React.FC = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [creatorFilter, setCreatorFilter] = useState('ALL');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await testService.getTests();
        console.log("Danh sách đề thi tải về từ API:", data);
        setTests(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách bài test", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tabs = ['Tất cả', 'Toán học', 'Ngữ văn', 'Tiếng Anh', 'Khoa học'];

  const filteredTests = tests.filter(test => {
    // 1. Filter by Creator Role
    const role = test.creator_role?.toUpperCase();
    if (creatorFilter === 'STUDENT' && role !== 'STUDENT') return false;
    if (creatorFilter === 'LECTURER' && role !== 'LECTURER' && role !== 'ADMIN') return false;

    // 2. Filter by Subject Tab
    if (activeTab === 'Tất cả') return true;
    
    const keywords: Record<string, string[]> = {
      'Toán học': ['toán', 'math', 'đại số', 'giải tích'],
      'Ngữ văn': ['văn', 'literature'],
      'Tiếng Anh': ['anh', 'english', 'toeic', 'ielts'],
      'Khoa học': ['khoa học', 'science', 'lý', 'hóa', 'sinh', 'sinh học']
    };
    
    const titleLower = test.title.toLowerCase();
    const subjectLower = test.subject?.toLowerCase() || '';
    
    // Check if subject exactly matches (ignoring case)
    if (subjectLower === activeTab.toLowerCase()) return true;
    
    // Fallback to keyword matching in title or subject
    const matchKeywords = keywords[activeTab] || [];
    return matchKeywords.some(kw => titleLower.includes(kw) || subjectLower.includes(kw));
  }).sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return sortAsc ? timeA - timeB : timeB - timeA;
  });

  const completedTests = tests.filter(t => t.status === 'HOÀN THÀNH').length;
  const totalTests = tests.length || 1; // Prevent division by zero
  const progressPercent = Math.round((completedTests / totalTests) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#F8FAFF] pb-20 pt-4 px-4"
      style={{ backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(79, 70, 229, 0.05) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.05) 0%, transparent 40%)' }}
    >
      <div className="max-w-[1100px] mx-auto space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
          <span className="hover:text-indigo-600 cursor-pointer transition-colors">Học tập</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-indigo-600">Bài kiểm tra</span>
        </div>

        {/* Header */}
        <div className="space-y-1 mb-8">
          <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">Hệ thống bài kiểm tra</h1>
          <p className="text-slate-500 text-[15px] font-medium">Luyện tập kiến thức và đánh giá năng lực cá nhân với bộ đề thi chất lượng.</p>
        </div>

        {/* Top Section: Featured & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Card */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-[32px] p-10 text-white shadow-xl shadow-indigo-200/50 min-h-[260px] flex items-center group">
              <div className="relative z-10 max-w-[70%] space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  <Star size={12} className="fill-white" />
                  PHỔ BIẾN NHẤT
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black tracking-tight leading-tight">Đề thi Đánh giá năng lực 2024</h2>
                  <p className="text-indigo-100 text-[14px] font-medium leading-relaxed opacity-90">
                    Tổng hợp các câu hỏi trọng tâm từ đề minh họa và các năm trước. Giúp bạn làm quen với cấu trúc đề mới nhất.
                  </p>
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <button 
                    className="bg-white text-indigo-600 px-8 py-3.5 rounded-2xl font-black text-[13px] hover:bg-indigo-50 transition-all shadow-lg shadow-black/10 active:scale-95"
                    onClick={() => navigate('/take-test/1')}
                  >
                    Bắt đầu ngay
                  </button>
                  <div className="flex items-center gap-2 text-indigo-100 text-[13px] font-bold">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Clock size={18} />
                    </div>
                    <span>120 phút</span>
                  </div>
                </div>
              </div>
              
              {/* Abstract Graphic */}
              <div className="absolute right-[-20px] bottom-[-20px] w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
              <BarChart3 size={240} className="absolute right-[-40px] bottom-[-40px] text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
            </div>
          </div>

          {/* Right Sidebar: Progress */}
          <div className="w-full">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 h-full flex flex-col justify-between group hover:border-indigo-100 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <TrendingUp size={24} />
                  </div>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Tiến độ cá nhân</span>
                </div>
                
                <h3 className="text-lg font-black text-slate-900 mb-1">Kết quả học tập</h3>
                <p className="text-[13px] text-slate-400 font-medium mb-8">Bạn đã hoàn thành {completedTests} trên tổng số {totalTests} bài tập.</p>
                
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <span className="text-[42px] font-black text-indigo-600 leading-none tracking-tighter">{progressPercent}%</span>
                    <span className="text-[11px] font-black text-slate-400 mb-1 uppercase tracking-widest">{completedTests}/{totalTests} Đã xong</span>
                  </div>
                  
                  <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 p-0.5">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-indigo-200" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/gpa')}
                className="mt-10 w-full py-4 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-2xl font-black text-[12px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all group-hover:bg-indigo-50 group-hover:text-indigo-600"
              >
                Phân tích chi tiết <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Full Width List */}
        <div className="space-y-8 pt-10">
          {/* Toolbar: Tabs & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-2xl text-[13px] font-black transition-all whitespace-nowrap ${
                    activeTab === tab 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-white border border-transparent hover:border-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4">

              <div className="relative group">
                <button 
                  className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 shadow-sm transition-all"
                >
                  <Filter size={16} />
                  Sắp xếp
                </button>
                
                <div className="absolute right-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white border border-slate-100 rounded-[24px] shadow-2xl py-2 overflow-hidden">
                    <div className="px-5 py-2 text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50 mb-1">Thời gian</div>
                    <button 
                      onClick={() => setSortAsc(false)}
                      className={`w-full text-left px-5 py-3 text-[13px] transition-colors flex items-center justify-between ${!sortAsc ? 'bg-indigo-50 text-indigo-600 font-black' : 'text-slate-600 hover:bg-slate-50 font-bold'}`}
                    >
                      Mới nhất
                      {!sortAsc && <CheckCircle2 size={16} />}
                    </button>
                    <button 
                      onClick={() => setSortAsc(true)}
                      className={`w-full text-left px-5 py-3 text-[13px] transition-colors flex items-center justify-between ${sortAsc ? 'bg-indigo-50 text-indigo-600 font-black' : 'text-slate-600 hover:bg-slate-50 font-bold'}`}
                    >
                      Cũ nhất
                      {sortAsc && <CheckCircle2 size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test List Items (Grid for rows) */}
          <div className="grid grid-cols-1 gap-4">
            {filteredTests.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200 text-center space-y-4">
                 <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                   <Search size={40} />
                 </div>
                 <div>
                   <h3 className="text-lg font-black text-slate-800">Không tìm thấy bài thi</h3>
                   <p className="text-slate-400 font-medium max-w-xs mx-auto mt-1">Hãy thử thay đổi danh mục hoặc bộ lọc để xem các kết quả khác.</p>
                 </div>
               </div>
            ) : (
              filteredTests.map((test, index) => {
                const styleIndex = index % 4;
                const colors = [
                  { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-600' },
                  { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-600' },
                  { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-600' },
                  { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-600' }
                ];
                const color = colors[styleIndex];

                return (
                  <div 
                    key={test.id} 
                    onClick={() => navigate(`/take-test/${test.id}`)} 
                    className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group border-l-4"
                    style={{ borderLeftColor: color.text.includes('indigo') ? '#4F46E5' : color.text.includes('emerald') ? '#10B981' : color.text.includes('amber') ? '#F59E0B' : '#F43F5E' }}
                  >
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      <div className={`w-16 h-16 ${color.bg} ${color.text} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-inner`}>
                        {styleIndex % 2 === 0 ? <BookOpen size={28} /> : <Microscope size={28} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${color.bg} ${color.text}`}>
                            {test.subject || 'Chưa phân loại'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-300">• {test.creator_role === 'LECTURER' || test.creator_role === 'ADMIN' ? 'GIẢNG VIÊN' : 'CÁ NHÂN'}</span>
                        </div>
                        <h3 className="text-[17px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate pr-8 leading-tight">
                          {test.title}
                        </h3>
                        <div className="flex items-center gap-x-6 mt-3">
                          <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400">
                            <Clock size={14} className="text-slate-300" />
                            <span>{test.duration_minutes || 60} phút</span>
                          </div>
                          <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400">
                            <FileText size={14} className="text-slate-300" />
                            <span>{test.questions_count || 0} câu hỏi</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8 shrink-0 mt-6 md:mt-0 ml-0 md:ml-6 pt-6 md:pt-0 border-t md:border-t-0 border-slate-50">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Lượt tham gia</p>
                        <p className="text-lg font-black text-slate-900 leading-none">{(test.participants_count || 0).toLocaleString()}</p>
                      </div>
                      <button className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl text-[13px] font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-100 active:scale-95 whitespace-nowrap">
                        Bắt đầu thi
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* End of List */}
        </div>
      </div>
    </div>

  );
};

export default TestListPage;
