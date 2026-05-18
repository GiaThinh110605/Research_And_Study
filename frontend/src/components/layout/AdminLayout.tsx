import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { authService } from '../../services/auth';
import { 
  Bell, 
  Settings, 
  LogOut, 
  Home, 
  Users,
  MessageSquare,
  History,
  HelpCircle,
  BookOpen
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [avatar, setAvatar] = useState<string | null>(localStorage.getItem('user_avatar'));

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        if (userData.avatar_url && !localStorage.getItem('user_avatar')) {
          setAvatar(userData.avatar_url);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      }
    };
    fetchUser();

    const handleAvatarUpdate = (e: any) => setAvatar(e.detail);
    const handleNameUpdate = (e: any) => setUser((prev: any) => prev ? { ...prev, full_name: e.detail } : null);

    window.addEventListener('user-avatar-updated' as any, handleAvatarUpdate);
    window.addEventListener('user-name-updated' as any, handleNameUpdate);

    return () => {
      window.removeEventListener('user-avatar-updated' as any, handleAvatarUpdate);
      window.removeEventListener('user-name-updated' as any, handleNameUpdate);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { name: "Tổng quan", icon: Home, path: "/admin", isHome: true },
    { name: "Quản lý người dùng", icon: Users, path: "/admin/users" },
    { name: "Kiểm duyệt", icon: MessageSquare, path: "/admin/moderation" }
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans">
      {/* Sidebar */}
      <div className="w-[280px] bg-white border-r border-slate-100 flex flex-col h-full shrink-0 shadow-sm">
        <div className="p-8 flex items-center gap-3">
          <div className="w-11 h-11 bg-indigo-600 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-indigo-100">
            <BookOpen size={24} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-indigo-700 leading-none tracking-tight">Nghiên cứu</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Học tập thông minh</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path || (item.isHome && location.pathname === '/admin');
            const Icon = item.icon;

            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all active:scale-95 ${isActive
                    ? "bg-indigo-50 text-indigo-600 shadow-sm"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  }`}
              >
                <Icon size={20} className={isActive ? "text-indigo-600" : "text-slate-300"} />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-50 space-y-1">
          <Link to="/admin/settings" className="flex items-center gap-4 px-6 py-3.5 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
            <Settings size={20} className="text-slate-300" />
            <span className="text-sm">Cài đặt</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center w-full gap-4 px-6 py-3.5 rounded-2xl font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
            <LogOut size={20} className="text-slate-300" />
            <span className="text-sm">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <div className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-end items-center px-10 shrink-0 relative z-20">
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 border-r border-slate-100 pr-8">
              <button className="text-slate-400 hover:text-indigo-600 transition-colors relative">
                <Bell size={24} />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm"></div>
              </button>
              <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                <HelpCircle size={24} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right">
                <div className="text-[15px] font-black text-slate-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors">
                  {user?.full_name || 'Đang tải...'}
                </div>
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  QUẢN TRỊ VIÊN
                </div>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-white shadow-xl shadow-slate-200/50 overflow-hidden group-hover:scale-105 transition-transform">
                <img 
                  src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=6366f1&color=fff&bold=true`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="p-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
