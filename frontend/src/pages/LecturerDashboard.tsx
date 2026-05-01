import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Plus, 
  ChevronRight, 
  Edit3, 
  MoreVertical, 
  Clock, 
  User,
  Layout,
  TrendingUp,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

const LecturerDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock data for the performance chart
  const chartData = [35, 45, 60, 50, 75, 85, 65, 55];

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Giảng Viên</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            Chào mừng trở lại, <span className="text-indigo-600 font-bold">Cô Trần Thị B</span>. Dưới đây là tóm tắt hoạt động nghiên cứu và giảng dạy của bạn.
          </p>
        </div>
        <button 
          onClick={() => navigate('/lecturer/create-test')}
          className="flex items-center gap-3 bg-[#3B66F5] text-white px-8 py-4 rounded-[20px] font-black text-sm shadow-2xl shadow-indigo-200/50 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={20} />
          Tạo đề thi mới
        </button>
      </div>

      {/* Stats & Chart Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Performance Chart Card */}
        <div className="xl:col-span-8 bg-white rounded-[40px] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="text-lg font-black text-slate-900">Hiệu suất học tập</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Hoạt động trong năm</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 border border-emerald-100">
              <TrendingUp size={12} />
              Tăng 12% tháng này
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 h-48 mb-4">
            {chartData.map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-3 group/bar">
                <div 
                  className={`w-full rounded-2xl transition-all duration-1000 ease-out cursor-pointer relative overflow-hidden ${
                    idx === 5 ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-indigo-50 group-hover/bar:bg-indigo-100'
                  }`}
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-1">
             {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'].map(m => (
               <span key={m} className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{m}</span>
             ))}
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="flex-1 bg-indigo-50/50 rounded-[40px] p-8 border border-indigo-100/50 relative overflow-hidden group cursor-default">
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">TỔNG SỐ ĐỀ THI</p>
                <h4 className="text-5xl font-black text-indigo-600 tracking-tighter">24</h4>
              </div>
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <FileText size={28} />
              </div>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl"></div>
          </div>

          <div className="flex-1 bg-emerald-500 rounded-[40px] p-8 relative overflow-hidden group cursor-default shadow-2xl shadow-emerald-200/50">
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">SINH VIÊN HOẠT ĐỘNG</p>
                <h4 className="text-5xl font-black text-white tracking-tighter">1,402</h4>
              </div>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Users size={28} />
              </div>
            </div>
            <div className="absolute right-[-10px] bottom-[-10px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>

      {/* Recent Tests Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Đề thi đã tạo gần đây</h3>
          <button 
            onClick={() => navigate('/lecturer/tests')}
            className="flex items-center gap-1.5 text-indigo-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform"
          >
            Xem tất cả
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[
            { id: 1, title: "Kiểm tra giữa kỳ: Hóa học hữu cơ II", subject: "Hóa học", duration: 60, attempts: 145, time: "2 giờ trước", status: "HOẠT ĐỘNG", color: "bg-indigo-600" },
            { id: 2, title: "Giải tích 1: Ôn tập chương Đạo hàm", subject: "Toán học", duration: 45, attempts: 0, time: "1 ngày trước", status: "NHÁP", color: "bg-orange-500" },
            { id: 3, title: "Tiếng Anh chuyên ngành: Công nghệ Nano", subject: "Ngoại ngữ", duration: 30, attempts: 89, time: "3 ngày trước", status: "HOẠT ĐỘNG", color: "bg-emerald-500" }
          ].map((test) => (
            <div key={test.id} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-300 group relative">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 ${test.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/5 group-hover:scale-110 transition-transform`}>
                  <Layout size={24} />
                </div>
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border ${
                  test.status === 'HOẠT ĐỘNG' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                }`}>
                  {test.status}
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="text-[17px] font-black text-slate-900 leading-tight line-clamp-2">{test.title}</h4>
                <div className="flex items-center gap-4 text-slate-400 text-[11px] font-bold">
                  <span className="flex items-center gap-1.5"><Clock size={14} /> {test.duration} phút</span>
                  <span className="flex items-center gap-1.5"><Users size={14} /> {test.attempts} bài làm</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                <span className="text-[10px] font-bold text-slate-300 italic">Cập nhật {test.time}</span>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 size={18} /></button>
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><MoreVertical size={18} /></button>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Test Placeholder */}
          <div 
            onClick={() => navigate('/lecturer/create-test')}
            className="group border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer relative"
          >
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-indigo-500 group-hover:bg-white group-hover:shadow-lg transition-all">
              <Plus size={30} />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-slate-800">Thêm đề thi mới</h4>
              <p className="text-slate-400 text-[11px] font-bold leading-relaxed px-4">Tạo nhanh đề thi từ kho câu hỏi hoặc AI hỗ trợ</p>
            </div>
            
            <button className="absolute right-4 bottom-4 w-10 h-10 bg-[#3B66F5] rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 scale-0 group-hover:scale-100 transition-transform">
               <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Help Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-white rounded-[40px] p-10 border border-indigo-100/50 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
            <HelpCircle size={32} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xl font-black text-slate-900 tracking-tight">Cần sự giúp đỡ?</h4>
            <p className="text-slate-500 font-medium">Tham khảo tài liệu hướng dẫn giảng viên để tìm hiểu cách tạo đề thi trắc nghiệm thông minh với sự hỗ trợ của AI.</p>
          </div>
        </div>
        <button className="bg-white text-slate-900 px-8 py-3.5 rounded-2xl font-black text-sm border border-slate-100 hover:bg-slate-50 hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 shrink-0">
          Xem tài liệu
          <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
};

export default LecturerDashboard;
