import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  Calendar,
  Lock,
  ChevronRight,
  Info,
  HelpCircle,
  PlayCircle
} from 'lucide-react';
import { testService, TestOut, TestStats } from '../services/test';

const TestListPage: React.FC = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestOut[]>([]);
  const [stats, setStats] = useState<TestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TẤT CẢ');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsData, statsData] = await Promise.all([
          testService.getTests().catch(() => []),
          testService.getTestStats().catch(() => null)
        ]);
        
        setTests(testsData || []);
        setStats(statsData);
        if (testsData && testsData.length > 0) {
          setSelectedTestId(testsData[0].id);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu", error);
        setTests([]);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'TẤT CẢ' || 
                        (activeTab === 'ĐANG MỞ' && test.status === 'ĐANG LÀM') ||
                        (activeTab === 'SẮP TỚI' && test.status === 'MỚI') ||
                        (activeTab === 'ĐÃ XONG' && test.status === 'HOÀN THÀNH');
      return matchesSearch && matchesTab;
    });
  }, [tests, searchQuery, activeTab]);

  const selectedTest = useMemo(() => {
    return tests.find(t => t.id === selectedTestId) || filteredTests[0] || null;
  }, [tests, selectedTestId, filteredTests]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HOÀN THÀNH': 
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-100">COMPLETED</span>;
      case 'ĐANG LÀM': 
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-amber-100">ACTIVE</span>;
      case 'MỚI': 
        return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100">UPCOMING</span>;
      default: 
        return <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-100">LOCKED</span>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HOÀN THÀNH': return <Award className="text-emerald-500" size={24} />;
      case 'ĐANG LÀM': return <Clock className="text-amber-500" size={24} />;
      case 'MỚI': return <Calendar className="text-blue-500" size={24} />;
      default: return <Lock className="text-slate-400" size={24} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-10 min-h-screen bg-[#F0F7FF]/50 p-6 rounded-[40px]">
      {/* Left Column: List */}
      <div className="flex-1 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Danh sách bài kiểm tra</h1>
          <p className="text-slate-500 font-medium">Hoàn thành các bài đánh giá để theo dõi tiến độ học tập.</p>
        </div>

        {/* Filters & Tabs */}
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 p-1 bg-white/60 backdrop-blur-md rounded-2xl border border-white w-fit shadow-sm">
            {['TẤT CẢ', 'ĐANG MỞ', 'SẮP TỚI', 'ĐÃ XONG'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative group max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm bài thi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 shadow-sm font-bold text-slate-700 placeholder:text-slate-300 transition-all"
            />
          </div>
        </div>

        {/* List of Cards */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-white/40 rounded-3xl animate-pulse border border-white" />
            ))
          ) : filteredTests.length > 0 ? (
            filteredTests.map((test) => (
              <div 
                key={test.id}
                onClick={() => setSelectedTestId(test.id)}
                className={`group flex items-center gap-6 p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                  selectedTestId === test.id 
                    ? 'bg-white border-blue-200 shadow-xl shadow-blue-100/50 scale-[1.02]' 
                    : 'bg-white/40 border-transparent hover:bg-white/80 hover:border-white shadow-sm'
                }`}
              >
                {selectedTestId === test.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 rounded-full" />
                )}
                
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                  test.status === 'HOÀN THÀNH' ? 'bg-emerald-50 text-emerald-500' : 
                  test.status === 'ĐANG LÀM' ? 'bg-amber-50 text-amber-500' :
                  'bg-blue-50 text-blue-500'
                }`}>
                  {getStatusIcon(test.status)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(test.status)}
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{test.subject}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                    {test.title}
                  </h3>
                  <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Calendar size={12} /> Hạn chót: 20/11</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {test.duration_minutes || 45} phút</span>
                  </div>
                </div>

                <div className="text-slate-300 group-hover:text-blue-500 transition-colors mr-2">
                  {test.status === 'MỚI' ? <Lock size={20} /> : <ChevronRight size={24} />}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-white/40 rounded-[40px] border border-dashed border-slate-200">
              <BookOpen className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-bold">Không tìm thấy bài kiểm tra nào.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Sticky Preview */}
      <div className="w-full lg:w-[450px] shrink-0">
        <div className="sticky top-6 bg-white rounded-[48px] p-8 shadow-2xl shadow-blue-100/50 border border-white space-y-8">
          {selectedTest ? (
            <>
              {/* Preview Image */}
              <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden bg-slate-100 group">
                <img 
                  src={`https://api.dicebear.com/7.x/shapes/svg?seed=${selectedTest.title}&backgroundColor=3b66f5,6366f1,3b82f6`}
                  alt="Test Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-blue-500/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  PREVIEW
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                  {selectedTest.title}
                </h2>
                <p className="text-slate-500 font-medium leading-relaxed text-sm">
                  Bài kiểm tra đánh giá kiến thức chuyên sâu về {selectedTest.subject}. Đảm bảo bạn đã ôn tập kỹ trước khi bắt đầu.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                    <HelpCircle size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Số lượng câu hỏi</p>
                    <p className="font-black text-slate-800">{selectedTest.questions_count} câu trắc nghiệm</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Thời gian làm bài</p>
                    <p className="font-black text-slate-800">{selectedTest.duration_minutes || 45} phút</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Điểm đạt tối thiểu</p>
                    <p className="font-black text-slate-800">5.0 / 10.0</p>
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="bg-amber-50 rounded-2xl p-4 flex gap-4 border border-amber-100">
                <Info size={20} className="text-amber-500 shrink-0" />
                <p className="text-xs font-bold text-amber-700 leading-relaxed">
                  Lưu ý: Bạn chỉ có <span className="underline">01 lần thử</span> duy nhất. Hãy đảm bảo kết nối internet ổn định trước khi bắt đầu.
                </p>
              </div>

              {/* Start Button */}
              <button 
                onClick={() => navigate(`/take-test/${selectedTest.id}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[28px] shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                Bắt đầu làm bài
                <PlayCircle size={20} />
              </button>
            </>
          ) : (
            <div className="py-40 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <BookOpen size={40} />
              </div>
              <p className="text-slate-400 font-bold">Chọn một bài thi để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestListPage;
