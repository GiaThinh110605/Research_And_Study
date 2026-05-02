import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Grid as GridIcon, 
  List as ListIcon, 
  Plus, 
  ClipboardCheck, 
  TrendingUp, 
  Star,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Award,
  CheckCircle2
} from 'lucide-react';
import { testService, TestOut, TestStats } from '../services/test';
import { authService } from '../services/auth';

const PAGE_SIZE = 8;

const TestListPage: React.FC = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestOut[]>([]);
  const [stats, setStats] = useState<TestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [subjectFilter, setSubjectFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsData, statsData] = await Promise.all([
          testService.getTests().catch(() => []),
          testService.getTestStats().catch(() => null)
        ]);
        
        setTests(testsData || []);
        setStats(statsData);
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

  const subjects = useMemo(() => {
    const uniqueSubjects = Array.from(new Set(tests.map(t => t.subject).filter((s): s is string => !!s)));
    return ['Tất cả', ...uniqueSubjects];
  }, [tests]);

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = subjectFilter === 'Tất cả' || test.subject === subjectFilter;
      const matchesStatus = statusFilter === 'Tất cả' || 
                           (statusFilter === 'Mới' && test.status === 'MỚI') ||
                           (statusFilter === 'Đang làm' && test.status === 'ĐANG LÀM') ||
                           (statusFilter === 'Hoàn thành' && test.status === 'HOÀN THÀNH');
      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [tests, searchQuery, subjectFilter, statusFilter]);

  const totalPages = Math.ceil(filteredTests.length / PAGE_SIZE);
  const paginatedTests = filteredTests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HOÀN THÀNH': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'ĐANG LÀM': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#3B66F5] to-[#6366F1] rounded-[40px] p-10 text-white shadow-2xl shadow-indigo-200/50">
          <div className="relative z-10 max-w-lg space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-xl rounded-full text-[10px] font-black tracking-widest uppercase">
              <ClipboardCheck size={14} />
              Hệ thống ôn luyện
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight leading-tight">Chinh phục mọi kỳ thi với kho đề chất lượng</h1>
              <p className="text-indigo-100 font-medium leading-relaxed opacity-90">
                Luyện tập hàng ngàn đề thi từ các khóa học, giúp bạn nắm vững kiến thức và tự tin hơn khi bước vào phòng thi thực tế.
              </p>
            </div>
            <div className="flex gap-4 pt-2">
              <button onClick={() => navigate('/community')} className="bg-white text-[#3B66F5] px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-xl shadow-black/10 active:scale-95">
                <TrendingUp size={18} />
                Xem bảng xếp hạng
              </button>
            </div>
          </div>
          <ClipboardCheck size={320} className="absolute right-[-60px] bottom-[-60px] text-white/10 -rotate-12" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm group hover:border-indigo-100 transition-all cursor-default">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="text-indigo-600" size={28} />
              </div>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Trung bình</span>
            </div>
            <p className="text-slate-400 text-sm font-bold">GPA của bạn</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-4xl font-black text-slate-900">{stats?.average_score.toFixed(2) || '0.00'}</p>
              <span className="text-emerald-500 font-black text-xs">/ 10.0</span>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[36px] shadow-2xl shadow-slate-200/50 group cursor-default relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="text-emerald-400" size={28} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiến độ</span>
              </div>
              <p className="text-slate-400 text-sm font-bold">Bài tập hoàn thành</p>
              <p className="text-4xl font-black text-white mt-1">{stats?.completed_tests || 0} <span className="text-lg text-slate-500 font-bold">/ {stats?.total_tests || 0}</span></p>
            </div>
            <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[48px] p-8 md:p-10 shadow-sm border border-slate-100 space-y-10">
        {/* Header & Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Kho đề kiểm tra</h2>
            <p className="text-slate-500 font-medium">Khám phá và luyện tập tất cả các bài kiểm tra được thiết kế riêng cho bạn.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề đề thi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 pl-12 pr-6 py-4 rounded-[20px] text-sm font-bold outline-none border border-transparent focus:border-indigo-500 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all active:scale-90 ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <GridIcon size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all active:scale-90 ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ListIcon size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-3">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => {
                setSubjectFilter(subject);
                setCurrentPage(1);
              }}
              className={`px-8 py-3.5 rounded-2xl text-xs font-black transition-all active:scale-95 ${
                subjectFilter === subject
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100 hover:border-slate-200'
              }`}
            >
              {subject}
            </button>
          ))}
          
          <div className="ml-auto flex items-center gap-2">
             <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-all">
                <Filter size={16} />
                Bộ lọc nâng cao
             </button>
          </div>
        </div>

        {/* Progress Bar Horizontal */}
        <div className="bg-gradient-to-r from-indigo-50/50 to-white rounded-[32px] p-8 border border-indigo-100/50 flex flex-col md:flex-row items-center gap-8">
           <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
              <TrendingUp size={32} />
           </div>
           <div className="flex-1 space-y-3 w-full">
              <div className="flex justify-between items-end">
                 <div>
                    <h4 className="font-black text-slate-900 text-lg">Tiến độ ôn tập</h4>
                    <p className="text-slate-500 text-sm font-medium">Bạn đã hoàn thành {stats?.progress_percent.toFixed(0)}% mục tiêu tuần này.</p>
                 </div>
                 <span className="text-indigo-600 font-black text-xl">{stats?.progress_percent.toFixed(0)}%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1">
                 <div 
                   className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                   style={{ width: `${stats?.progress_percent}%` }}
                 />
              </div>
           </div>
        </div>

        {/* Tests Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[300px] bg-slate-50 rounded-[32px] animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : paginatedTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {paginatedTests.map((test) => (
              <div 
                key={test.id} 
                className="group bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-100 transition-all duration-300 p-6 flex flex-col relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <BookOpen size={24} />
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${getStatusColor(test.status)}`}>
                    {test.status}
                  </span>
                </div>

                <div className="space-y-1 mb-6 flex-1">
                  <h3 className="font-black text-slate-900 text-lg leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {test.title}
                  </h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{test.subject}</p>
                </div>

                <div className="flex items-center gap-4 py-4 border-t border-slate-50">
                   <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                      <Clock size={14} className="text-slate-400" />
                      75 Phút
                   </div>
                   <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                      <ClipboardCheck size={14} className="text-slate-400" />
                      {test.questions_count} Câu
                   </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                         GV
                      </div>
                      <span className="text-xs font-bold text-slate-600">Giảng viên</span>
                   </div>
                   <button 
                     onClick={() => navigate(`/take-test/${test.id}`)}
                     className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
                   >
                     <ChevronRight size={20} />
                   </button>
                </div>
              </div>
            ))}

            {/* Add New Test Placeholder */}
            <div 
              onClick={() => navigate('/lecturer/create-test')}
              className="group border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer min-h-[300px]"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-indigo-500 group-hover:bg-white group-hover:shadow-lg transition-all">
                <Plus size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-slate-800">Tạo đề thi mới</h4>
                <p className="text-slate-400 text-xs font-bold">Thêm đề kiểm tra vào kho</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-6">
             <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-200">
                <Search size={48} />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800">Không tìm thấy bài kiểm tra</h3>
                <p className="text-slate-500 font-medium">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
             </div>
             <button 
               onClick={() => {
                 setSearchQuery('');
                 setSubjectFilter('Tất cả');
                 setStatusFilter('Tất cả');
               }}
               className="text-indigo-600 font-black text-sm hover:underline"
             >
               Xóa tất cả bộ lọc
             </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-4 rounded-2xl border border-slate-100 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-12 h-12 rounded-2xl text-sm font-black transition-all ${
                    currentPage === i + 1
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
                      : 'bg-white border border-slate-100 text-slate-500 hover:border-indigo-100 hover:text-indigo-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-4 rounded-2xl border border-slate-100 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestListPage;
