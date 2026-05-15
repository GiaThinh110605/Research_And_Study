import React, { useState, useEffect } from 'react';
import { 
  BookOpen, LayoutDashboard, Users, FileText, MessageSquare,
  Settings, LogOut, Search, Bell, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, HelpCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { dashboardService } from '../services/dashboard';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [dashboardData, userData] = await Promise.all([
          dashboardService.getAdminDashboard(),
          authService.getCurrentUser()
        ]);
        setStats(dashboardData.stats);
        setActivities(dashboardData.activities);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Failed to fetch admin dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
    { icon: Users, label: 'Quản lý người dùng', path: '/admin/users' },
    { icon: MessageSquare, label: 'Kiểm duyệt bình luận', path: '/admin/moderation' },
  ];

  const recentActivities = activities;

  return (
    <div className="p-10 max-w-6xl mx-auto">
      {/* Page Heading */}
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-slate-800 tracking-tight">Chào buổi sáng, {currentUser?.full_name?.split(' ').pop() || 'Admin'}</h2>
        <p className="text-slate-500 text-[13px] mt-2 font-medium">Hệ thống đang hoạt động ổn định. Dưới đây là thống kê tổng quát ngày hôm nay.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-500 mb-1">Tổng người dùng</p>
            <p className="text-3xl font-bold text-slate-800 tracking-tight">{stats?.total_users || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-500 mb-1">Tổng tài liệu</p>
            <p className="text-3xl font-bold text-slate-800 tracking-tight">{stats?.total_documents || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-500 mb-1">Tổng đề thi</p>
            <p className="text-3xl font-bold text-slate-800 tracking-tight">{stats?.total_tests || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-500 mb-1">Bình luận mới</p>
            <p className="text-3xl font-bold text-slate-800 tracking-tight">{stats?.total_discussions || 0}</p>
          </div>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Recent Activities */}
        <div className="col-span-8 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] font-bold text-slate-800">Hoạt động gần đây</h3>
            <a href="#" className="text-[13px] font-semibold text-blue-600 hover:text-blue-700">Xem tất cả</a>
          </div>
          
          <div className="space-y-6">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start justify-between group">
                <div className="flex items-start gap-4">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user)}&background=random`} alt={activity.user} className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-100" />
                  <div>
                    <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
                      <span className="font-bold text-slate-900">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      {new Date(activity.time).toLocaleString('vi-VN')} • {activity.type}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider shrink-0 ${activity.statusColor}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Analysis */}
        <div className="col-span-4 bg-[#4F46E5] rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(79,70,229,0.3)]">
           <div className="relative z-10">
              <h3 className="text-[16px] font-bold text-white mb-4">Phân tích tăng trưởng</h3>
              <p className="text-[13px] text-indigo-100 font-medium leading-relaxed">
                Lượng tài liệu học thuật về AI tăng đột biến 40% trong tháng này. Cân nhắc tạo một danh mục chuyên biệt.
              </p>
           </div>
           
           <button className="relative z-10 w-full mt-8 bg-white text-[#4F46E5] py-3 rounded-xl font-bold text-[13px] hover:bg-slate-50 transition-colors shadow-sm">
             Xem chi tiết báo cáo
           </button>

           {/* Decorative background blur */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
           <div className="absolute bottom-10 left-0 w-24 h-24 bg-indigo-600 rounded-full blur-2xl opacity-50 -ml-10"></div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
