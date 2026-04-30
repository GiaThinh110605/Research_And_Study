import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import {
  Home,
  FileText,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  TrendingUp,
  Clock,
  Calendar,
  ChevronRight,
  Plus,
  Download,
  Upload,
  Star,
  Award,
  Target,
  BarChart3
} from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Tổng số tài liệu',
      value: '128',
      trend: '+12% tuần này',
      icon: <FileText className="text-indigo-600" size={24} />,
      bg: 'bg-indigo-50',
      borderColor: 'border-indigo-500'
    },
    {
      title: 'Bài kiểm tra đã làm',
      value: '45',
      trend: 'Hoàn thành',
      icon: <Target className="text-emerald-600" size={24} />,
      bg: 'bg-emerald-50',
      borderColor: 'border-emerald-500'
    },
    {
      title: 'Điểm GPA hiện tại',
      value: '3.85',
      trend: 'Top 5% lớp',
      icon: <TrendingUp className="text-amber-600" size={24} />,
      bg: 'bg-amber-50',
      borderColor: 'border-amber-500'
    }
  ];

  const recentDocs = [
    { title: 'Giải tích 1 - Bài tập chương 4', info: 'PDF • 2.4 MB • Cập nhật 2 giờ trước' },
    { title: 'Ghi chú Triết học Mác-Lênin', info: 'DOCX • 1.1 MB • Cập nhật hôm qua' },
    { title: 'Cấu trúc dữ liệu và giải thuật', info: 'PDF • 5.8 MB • Cập nhật 3 ngày trước' },
  ];

  const semesterProgress = [
    { name: 'Toán rời rạc', progress: 85, color: 'bg-indigo-600' },
    { name: 'Lập trình Java', progress: 60, color: 'bg-emerald-500' },
    { name: 'Anh văn chuyên ngành', progress: 40, color: 'bg-amber-500' },
  ];

  const upcomingTests = [
    { day: 'TH2', date: '12', name: 'Kiểm tra Giữa kỳ', subject: 'Mạng máy tính', time: '09:00' },
    { day: 'TH4', date: '14', name: 'Tiểu luận cuối khóa', subject: 'Kỹ năng mềm', time: 'Hạn chót' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Greeting */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Chào buổi sáng, Văn A!</h1>
        <p className="text-slate-500 font-medium">Hôm nay bạn có 3 bài kiểm tra sắp tới và 5 tài liệu mới cần nghiên cứu.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className={`bg-white p-6 rounded-3xl border-l-4 ${stat.borderColor} shadow-sm shadow-slate-200/50 flex flex-col gap-4 transition-transform hover:scale-[1.02] duration-200 cursor-default`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center shadow-inner`}>
                    {stat.icon}
                  </div>
                  <span className={`text-[11px] font-black px-2 py-1 rounded-lg ${stat.bg} ${stat.icon.props.className}`}>
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-bold">{stat.title}</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Documents */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Tài liệu gần đây</h2>
              <Link to="/tai-lieu" className="text-indigo-600 hover:text-indigo-700 font-black text-sm transition-colors">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-4">
              {recentDocs.map((doc, idx) => (
                <div 
                  key={idx} 
                  className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-100"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <FileText className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-900 font-bold group-hover:text-indigo-900 transition-colors">{doc.title}</h3>
                    <p className="text-slate-400 text-xs font-semibold mt-0.5">{doc.info}</p>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Research Banner */}
          <div className="relative overflow-hidden bg-indigo-50 rounded-[32px] p-10 flex items-center justify-between group cursor-default border border-indigo-100 shadow-sm shadow-indigo-100/20">
            <div className="max-w-md space-y-4 z-10">
              <h3 className="text-xl font-black text-indigo-900">Đề xuất nghiên cứu</h3>
              <p className="text-indigo-600/70 font-bold leading-relaxed">
                Dựa trên lịch sử học tập, bạn có thể quan tâm đến các bài báo về Trí tuệ nhân tạo trong giáo dục.
              </p>
              <button 
                onClick={() => navigate('/tai-lieu')}
                className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
              >
                Khám phá ngay
              </button>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] w-64 h-64 bg-indigo-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute right-[40px] bottom-[40px] w-32 h-32 bg-indigo-200 rounded-full opacity-30 group-hover:scale-125 transition-transform duration-500" />
            <Settings size={120} className="absolute right-[-10px] bottom-[-10px] text-indigo-200/50 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Semester Progress */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm shadow-slate-200/50 border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8">Tiến độ học kỳ</h2>
            <div className="space-y-8">
              {semesterProgress.map((item, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-600 text-sm">{item.name}</span>
                    <span className="text-indigo-600 text-sm">{item.progress}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-1000 shadow-sm`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tests */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm shadow-slate-200/50 border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8">Lịch thi sắp tới</h2>
            <div className="space-y-6 mb-8">
              {upcomingTests.map((test, idx) => (
                <div key={idx} className="flex items-center gap-4 group cursor-default">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex flex-col items-center justify-center shrink-0 border border-indigo-100 group-hover:bg-indigo-600 transition-colors duration-300">
                    <span className="text-[10px] font-black text-indigo-400 group-hover:text-indigo-200 uppercase">{test.day}</span>
                    <span className="text-lg font-black text-indigo-600 group-hover:text-white leading-tight">{test.date}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-slate-900 line-clamp-1">{test.name}</h3>
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">{test.subject} • {test.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-500 font-black text-sm hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 transition-all">
              Xem lịch chi tiết
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        className="fixed bottom-10 right-10 w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all z-20"
      >
        <Plus size={32} />
      </button>
    </div>
  );
};

export default StudentDashboard;
