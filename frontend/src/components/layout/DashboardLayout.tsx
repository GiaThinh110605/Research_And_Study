import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { authService } from '../../services/auth';
import {
  Home,
  FileText,
  BookOpen,
  Users,
  Target,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Upload,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState({
    name: 'Đang tải...',
    role: '...',
    avatar: 'https://ui-avatars.com/api/?name=User&background=random'
  });

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const me = await authService.getCurrentUser();
        const storedAvatar = localStorage.getItem('user_avatar');
        setUser({
          name: me.full_name || me.username || 'Người dùng',
          role: me.role?.toUpperCase() === 'ADMIN' ? 'Quản trị viên' : (me.role?.toUpperCase() === 'LECTURER' ? 'Giảng viên' : 'Sinh viên'),
          avatar: storedAvatar || me.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(me.full_name || me.username || 'U')}&background=EBF4FF&color=3B66F5&size=128`
        });
      } catch (err) {
        console.error('Không thể lấy thông tin user:', err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Trang chủ', icon: <Home size={20} />, path: '/dashboard' },
    { name: 'Tài liệu', icon: <FileText size={20} />, path: '/tai-lieu' },
    { name: 'Bài kiểm tra', icon: <Target size={20} />, path: '/test-list' },
    { name: 'Flashcard', icon: <BookOpen size={20} />, path: '/flashcard' },
    { name: 'Điểm số', icon: <BarChart3 size={20} />, path: '/gpa' },
  ];

  const bottomNavItems = [
    { name: 'Cài đặt', icon: <Settings size={20} />, path: '/profile' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <GraduationCap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-blue-600 tracking-tight">Nghiên cứu</h1>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Học tập thông minh</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </span>
                <span className="font-semibold text-sm">{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-6 bg-indigo-600 rounded-full" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          {bottomNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all font-semibold text-sm"
            >
              <span className="text-slate-400">{item.icon}</span>
              {item.name}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-semibold text-sm"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm học phần, flashcard..."
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/tai-lieu?q=${searchQuery}`);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 leading-tight">{user.name}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{user.role}</p>
              </div>
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100"
              />
              <button className="relative p-2.5 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 rounded-xl transition-all">
                <Bell size={20} />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
              </button>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
