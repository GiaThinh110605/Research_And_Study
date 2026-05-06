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
  const [sortAsc, setSortAsc] = useState(false);
  const [creatorFilter, setCreatorFilter] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await testService.getTests();
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
    if (creatorFilter === 'STUDENT' && test.creator_role !== 'STUDENT') return false;
    if (creatorFilter === 'LECTURER' && test.creator_role !== 'LECTURER' && test.creator_role !== 'ADMIN') return false;

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
    <div className="max-w-[1100px] mx-auto space-y-6 pb-20 pt-4 px-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500 mb-2">
        <span className="hover:text-blue-600 cursor-pointer transition-colors">Học tập</span>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-blue-600 font-bold">Bài kiểm tra</span>
      </div>

      {/* Header */}
      <div className="space-y-1.5 mb-8">
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Danh sách bài kiểm tra</h1>
        <p className="text-slate-500 text-[14px]">Kiểm tra kiến thức của bạn với các bộ đề thi thử được cập nhật mới nhất.</p>
      </div>

      {/* Top Section: Featured & Progress */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Featured Card */}
        <div className="flex-1">
          <div className="bg-[#4F46E5] rounded-[20px] p-8 text-white relative overflow-hidden flex items-center justify-between shadow-lg shadow-indigo-200/50 h-full min-h-[220px]">
            <div className="relative z-10 max-w-[65%] space-y-4">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wide">
                PHỔ BIẾN NHẤT
              </span>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold">Đề thi Đánh giá năng lực 2024</h2>
                <p className="text-indigo-100 text-[13px] leading-relaxed opacity-90">
                  Tổng hợp các câu hỏi trọng tâm từ đề minh họa và các năm trước. Giúp bạn làm quen với cấu trúc đề mới nhất.
                </p>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <button 
                  className="bg-white text-indigo-600 px-5 py-2.5 rounded-lg font-bold text-[13px] hover:bg-indigo-50 transition-colors shadow-sm"
                  onClick={() => navigate('/take-test/1')}
                >
                  Bắt đầu ngay
                </button>
                <div className="flex items-center gap-1.5 text-indigo-100 text-[13px] font-medium">
                  <Clock size={14} />
                  <span>120 phút</span>
                </div>
              </div>
            </div>
            
            {/* Abstract Bars Graphic */}
            <div className="absolute right-8 bottom-0 flex items-end gap-2 opacity-20">
              <div className="w-6 h-16 bg-white rounded-t-lg"></div>
              <div className="w-6 h-24 bg-white rounded-t-lg"></div>
              <div className="w-6 h-12 bg-white rounded-t-lg"></div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Progress */}
        <div className="w-full lg:w-[300px] shrink-0">
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-200 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-1">Tiến độ học tập</h3>
              <p className="text-[12px] text-slate-500 mb-6">Tiến độ hoàn thành bài tập của bạn</p>
              
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <span className="text-[32px] font-bold text-indigo-600 leading-none">{progressPercent}%</span>
                  <span className="text-[11px] font-bold text-slate-400 mb-1">{completedTests}/{totalTests} Bài tập</span>
                </div>
                
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/gpa')}
              className="mt-6 text-[13px] font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Xem chi tiết báo cáo <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Full Width List */}
      <div className="space-y-6 pt-4">
        {/* Toolbar: Tabs & Filters */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  activeTab === tab 
                    ? 'bg-blue-50 text-blue-600 font-bold' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button 
                onClick={() => setCreatorFilter('ALL')}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${creatorFilter === 'ALL' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Tất cả
              </button>
              <button 
                onClick={() => setCreatorFilter('LECTURER')}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${creatorFilter === 'LECTURER' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Giảng viên
              </button>
              <button 
                onClick={() => setCreatorFilter('STUDENT')}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${creatorFilter === 'STUDENT' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Cá nhân
              </button>
            </div>

            <div className="relative group">
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
              >
                <Filter size={14} />
                Lọc
              </button>
              
              {/* Dropdown Menu on Hover */}
              <div className="absolute right-0 pt-2 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 overflow-hidden">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">Sắp xếp</div>
                  <button 
                    onClick={() => setSortAsc(false)}
                    className={`w-full text-left px-4 py-2 text-[13px] transition-colors flex items-center justify-between ${!sortAsc ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}
                  >
                    Mới nhất
                    {!sortAsc && <CheckCircle2 size={14} />}
                  </button>
                  <button 
                    onClick={() => setSortAsc(true)}
                    className={`w-full text-left px-4 py-2 text-[13px] transition-colors flex items-center justify-between ${sortAsc ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}
                  >
                    Cũ nhất
                    {sortAsc && <CheckCircle2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test List Items (Rows) */}
        <div className="space-y-4">
          {filteredTests.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-[20px] border border-dashed border-slate-200 text-slate-400 font-medium">
               Không có bài kiểm tra nào trong danh mục này.
             </div>
          ) : (
            filteredTests.map((test, index) => {
              const styleIndex = index % 4;
              
              let iconBlock;
              if (styleIndex % 2 === 0) {
                iconBlock = (
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center font-serif italic text-2xl">
                    <BookOpen size={24} />
                  </div>
                );
              } else {
                iconBlock = (
                  <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                    <Microscope size={24} />
                  </div>
                );
              }

              return (
                <div 
                  key={test.id} 
                  onClick={() => navigate(`/take-test/${test.id}`)} 
                  className="bg-white p-5 rounded-[16px] border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className="shrink-0 group-hover:scale-105 transition-transform">
                      {iconBlock}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-bold text-slate-800 mb-1 truncate pr-8">{test.title}</h3>
                      <div className="flex items-center gap-x-4 text-[12px] font-medium text-slate-500">
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {test.duration_minutes || 60} phút</span>
                        <span className="flex items-center gap-1.5"><FileText size={14} /> {test.questions_count || 0} câu hỏi</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 shrink-0 ml-4">
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] text-slate-400 font-medium mb-0.5">Lượt làm bài</p>
                      <p className="text-[14px] font-bold text-slate-800">{(test.participants_count || 0).toLocaleString()}</p>
                    </div>
                    <button className="bg-blue-700 hover:bg-blue-800 text-white px-7 py-2.5 rounded-lg text-[13px] font-bold transition-colors shadow-sm whitespace-nowrap">
                      Bắt đầu
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom CTA Box */}
        <div className="mt-8 bg-[#F8FAFC] rounded-[20px] border border-dashed border-[#CBD5E1] p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 flex items-center justify-center bg-white border border-blue-100 rounded-full shadow-sm mb-1">
            <CheckCircle2 size={24} className="text-blue-500" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-[16px] font-bold text-blue-900">Bạn muốn ôn tập thêm?</h3>
            <p className="text-[13px] text-blue-600/80 font-medium max-w-sm mx-auto">Hãy yêu cầu thêm bài tập hoặc tự tạo bộ đề trắc nghiệm riêng của mình.</p>
          </div>
          <button 
            onClick={() => navigate('/test/create')}
            className="mt-2 px-6 py-2.5 bg-white border border-blue-600 text-blue-600 rounded-lg font-bold text-[13px] hover:bg-blue-50 transition-colors shadow-sm"
          >
            Tạo đề thi mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestListPage;
