import React, { useState } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  History, 
  Settings, 
  LogOut, 
  Search, 
  Plus,
  Bell,
  HelpCircle,
  FileSearch,
  MoreVertical,
  UserPlus,
  FileUp,
  CheckCircle2,
  TrendingUp,
  Minus
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
    { icon: Users, label: 'Quản lý người dùng', path: '/admin/users' },
    { icon: FileText, label: 'Quản lý tài liệu', path: '/admin/docs' },
    { icon: CheckSquare, label: 'Kiểm duyệt chia sẻ', path: '/admin/moderation' },
    { icon: History, label: 'Nhật ký hoạt động', path: '/admin/logs' },
    { icon: Settings, label: 'Cài đặt hệ thống', path: '/admin/settings' },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'user_register',
      user: 'Nguyễn Văn An',
      action: 'vừa đăng ký tài khoản mới',
      time: 'Cách đây 2 phút',
      meta: 'Vai trò: Sinh viên',
      status: null,
      icon: UserPlus,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50'
    },
    {
      id: 2,
      type: 'doc_upload',
      user: 'Trần Thị Bé',
      action: 'tải lên tài liệu "Giải tích 1 - Đề thi 2023"',
      time: 'Cách đây 15 phút',
      meta: 'Chờ kiểm duyệt',
      status: 'ĐANG CHỜ',
      icon: FileUp,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50'
    },
    {
      id: 3,
      type: 'system_auto',
      user: 'Hệ thống',
      action: 'đã phê duyệt 12 tài liệu mới',
      time: 'Cách đây 45 phút',
      meta: 'Tự động',
      status: null,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50'
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Users className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">UniStudy Admin</h1>
              <p className="text-[10px] text-slate-500 mt-1.5 uppercase tracking-wider font-bold">HỆ THỐNG QUẢN TRỊ</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item, index) => {
              // Custom active check since we don't have all routes yet
              const isActive = index === 0; // Hardcoded to active for this page
              return (
                <Link
                  to={item.path}
                  key={index}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                  <span className="font-bold text-sm tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm tracking-wide"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm kiếm dữ liệu, người dùng..." 
              className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors relative group">
                <Bell className="w-5 h-5 group-hover:text-slate-700 transition-colors" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors group">
                <HelpCircle className="w-5 h-5 group-hover:text-slate-700 transition-colors" />
              </button>
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-1"></div>

            <div className="flex items-center gap-4 cursor-pointer hover:bg-slate-50 p-1.5 rounded-2xl transition-colors pr-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">Admin UniStudy</p>
                <p className="text-[10px] text-blue-600 font-extrabold uppercase mt-0.5">SUPER ADMIN</p>
              </div>
              <img src="https://i.pravatar.cc/150?img=11" alt="Admin" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-10 max-w-7xl mx-auto">
          {/* Page Heading */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Tổng quan hệ thống</h2>
              <p className="text-slate-500 font-medium">
                Chào mừng trở lại, hôm nay có <span className="font-bold text-blue-600">124</span> yêu cầu mới cần xử lý.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin/users" className="bg-white text-blue-600 border border-blue-100 px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm">
                <Plus className="w-5 h-5" />
                Thêm người dùng mới
              </Link>
              <button className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:-translate-y-0.5 uppercase text-sm tracking-wide">
                <FileSearch className="w-5 h-5" />
                Kiểm duyệt ngay
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-lg">
                  +12.5%
                </div>
              </div>
              <p className="text-slate-500 font-medium mb-1">Tổng số người dùng</p>
              <h3 className="text-3xl font-black text-slate-900">24,512</h3>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-lg">
                  +3.2%
                </div>
              </div>
              <p className="text-slate-500 font-medium mb-1">Tổng tài liệu</p>
              <h3 className="text-3xl font-black text-slate-900">8,904</h3>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2 2 4-4"></path></svg>
                </div>
                <div className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-lg uppercase">
                  Ổn định
                </div>
              </div>
              <p className="text-slate-500 font-medium mb-1">Bài kiểm tra đã tạo</p>
              <h3 className="text-3xl font-black text-slate-900">1,245</h3>
            </div>

            {/* Card 4 - Highlight */}
            <div className="bg-[#1e293b] p-6 rounded-3xl shadow-xl shadow-slate-900/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <FileSearch className="w-32 h-32 -mr-8 -mt-8 text-white" />
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <FileSearch className="w-6 h-6" />
                  </div>
                  <div className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider backdrop-blur-sm">
                    Cần xử lý
                  </div>
                </div>
                <div className="mt-auto">
                  <p className="text-slate-300 font-medium mb-1">Chia sẻ chờ duyệt</p>
                  <h3 className="text-4xl font-black text-white">142</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Tăng trưởng người dùng</h3>
                  <p className="text-slate-500 text-sm mt-1">Thống kê dữ liệu 30 ngày qua</p>
                </div>
                <div className="bg-slate-50 text-slate-600 text-sm font-bold px-4 py-2 rounded-xl">
                  30 ngày gần nhất
                </div>
              </div>
              
              {/* Dummy SVGs Chart */}
              <div className="flex-1 relative mt-4 min-h-[200px]">
                {/* Y Axis Guides */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full border-t border-slate-100/60 flex-1"></div>
                  ))}
                  <div className="w-full border-t border-slate-100/60"></div>
                </div>
                
                {/* SVG Curve - Simulated Chart that mirrors the design closely */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <linearGradient id="gradientArea" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Vertical Bars Background as seen in design */}
                  <rect x="10%" y="30%" width="6%" height="70%" fill="#f1f5f9" rx="1" opacity="0.6"/>
                  <rect x="30%" y="20%" width="6%" height="80%" fill="#f1f5f9" rx="1" opacity="0.6"/>
                  <rect x="50%" y="40%" width="6%" height="60%" fill="#f1f5f9" rx="1" opacity="0.6"/>
                  <rect x="70%" y="60%" width="6%" height="40%" fill="#f1f5f9" rx="1" opacity="0.6"/>
                  <rect x="90%" y="15%" width="6%" height="85%" fill="#f1f5f9" rx="1" opacity="0.6"/>

                  {/* Smooth curve line */}
                  <path 
                    d="M 0 70 Q 20 65, 30 50 T 60 55 T 80 65 T 100 30" 
                    fill="none" 
                    stroke="url(#gradientLine)" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    className="drop-shadow-sm"
                  />
                  {/* Dots at Data Points */}
                  <circle cx="30" cy="50" r="1.5" fill="#2563eb" className="animate-pulse"/>
                  <circle cx="60" cy="55" r="1.5" fill="#2563eb" />
                  <circle cx="80" cy="65" r="1.5" fill="#2563eb" />
                  <circle cx="100" cy="30" r="1.5" fill="#2563eb" />
                </svg>

                {/* X Axis Labels */}
                <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-[10px] font-bold text-slate-400">
                  <span>01TH09</span>
                  <span>08 TH09</span>
                  <span>15 TH09</span>
                  <span>22 TH09</span>
                  <span>30 TH09</span>
                </div>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Tỷ lệ người dùng</h3>
                <p className="text-slate-500 text-sm mt-1">Phân loại theo vai trò</p>
              </div>

              {/* Fake Donut Chart via CSS Canvas approach */}
              <div className="flex-1 flex flex-col items-center justify-center py-6">
                <div className="relative w-48 h-48">
                  {/* Background Circle */}
                  <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      stroke="#f1f5f9" 
                      strokeWidth="12" 
                    />
                    {/* Progress Circle (75% for Sinh Viên) */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      stroke="#2563eb" 
                      strokeWidth="12" 
                      strokeDasharray="251.2"
                      strokeDashoffset="62.8" // 25% empty
                      strokeLinecap="round"
                      className="drop-shadow-md"
                    />
                  </svg>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900 leading-tight">24.5k</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tổng cộng</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                    <span className="font-bold text-slate-700">Sinh viên</span>
                  </div>
                  <span className="font-black text-slate-900">75%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-slate-200 rounded-full"></span>
                    <span className="font-bold text-slate-700">Giảng viên</span>
                  </div>
                  <span className="font-black text-slate-900">25%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Hoạt động gần đây</h3>
              <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700">Xem tất cả nhật ký</a>
            </div>
            
            <div className="px-4 py-2">
              {recentActivities.map((activity, idx) => (
                <div key={activity.id} className={`flex items-start gap-5 p-4 ${idx !== recentActivities.length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${activity.iconBg} ${activity.iconColor}`}>
                    <activity.icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-slate-800 font-medium">
                        <span className="font-bold text-slate-900">{activity.user}</span> {activity.action}
                      </p>
                      <button className="text-slate-300 hover:text-slate-600 p-1">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500 font-medium">{activity.time}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-sm text-slate-500 font-medium">{activity.meta}</span>
                      
                      {activity.status && (
                        <>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded tracking-wider">
                            {activity.status}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
