import React, { useState, useEffect } from 'react';
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
  MoreVertical,
  Bell,
  HelpCircle,
  Filter,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';
import { userService } from '../services/user';

const AdminUserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

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

  const stats = [
    { label: 'TỔNG NGƯỜI DÙNG', value: users.length.toLocaleString(), change: '+12%', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'SINH VIÊN', value: users.filter(u => u.role === 'student').length.toLocaleString(), icon: UserCheck, color: 'bg-indigo-50 text-indigo-600' },
    { icon: UserCheck, label: 'GIẢNG VIÊN', value: users.filter(u => u.role === 'lecturer').length.toLocaleString(), color: 'bg-purple-50 text-purple-600' },
    { label: 'ĐÃ BỊ KHÓA', value: '0', change: '0.3%', icon: UserX, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Users className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">UniStudy Admin</h1>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">HỆ THỐNG QUẢN TRỊ</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item, index) => {
              const isActive = index === 1; // "Quản lý người dùng"
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
            className="w-full flex items-center gap-4 px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-semibold text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm kiếm nhanh..." 
              className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-2"></div>

            <div className="flex items-center gap-4 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors pr-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">Admin UniStudy</p>
                <p className="text-xs text-slate-500 font-medium">QUẢN TRỊ VIÊN</p>
              </div>
              <img src="https://i.pravatar.cc/150?img=68" alt="Admin" className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-10">
          {/* Page Heading */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý người dùng</h2>
              <p className="text-slate-500 mt-2 font-medium">Theo dõi, kiểm duyệt và quản lý quyền truy cập của toàn bộ thành viên UniStudy.</p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:translate-y-[-2px] active:translate-y-0">
              <Plus className="w-5 h-5" />
              Thêm người dùng mới
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                {stat.change && (
                  <div className={`absolute top-6 right-6 text-xs font-bold px-2 py-1 rounded-lg ${stat.label.includes('KHÓA') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-emerald-500'}`}>
                    {stat.change}
                  </div>
                )}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                   <stat.icon className="w-24 h-24 -mr-8 -mt-8" />
                </div>
              </div>
            ))}
          </div>

          {/* Table Control Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-8 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Tìm theo tên, MSSV hoặc Email..." 
                className="w-full bg-slate-50 border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <select className="bg-slate-50 border-slate-100 text-slate-600 rounded-2xl py-3 px-6 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer min-w-[160px]">
                <option>Tất cả vai trò</option>
                <option>Sinh viên</option>
                <option>Giảng viên</option>
                <option>Quản trị viên</option>
              </select>
              <select className="bg-slate-50 border-slate-100 text-slate-600 rounded-2xl py-3 px-6 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer min-w-[160px]">
                <option>Trạng thái</option>
                <option>Hoạt động</option>
                <option>Bị khóa</option>
              </select>
              <button className="flex items-center gap-2 bg-slate-50 text-slate-600 py-3 px-6 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-colors border border-slate-100">
                <Filter className="w-4 h-4" />
                Lọc nâng cao
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">STT</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">NGƯỜI DÙNG</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">EMAIL</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">VAI TRÒ</th>
                  <th className="px-8 py-5 text-[10px) font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">NGÀY THAM GIA</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">TRẠNG THÁI</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-8 py-10 bg-slate-50/20"></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                      <p className="text-slate-400 font-semibold">Chưa có dữ liệu người dùng.</p>
                    </td>
                  </tr>
                ) : users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 text-sm font-bold text-slate-400">{(index + 1).toString().padStart(2, '0')}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <img 
                            src={`https://i.pravatar.cc/150?u=${user.email}`} 
                            alt={user.full_name} 
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm" 
                          />
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${user.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{user.full_name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                            {user.role === 'student' ? `MSSV: ${user.student_id || 'Chưa cập nhật'}` : `MSGV: ${user.student_id || 'GV.UNISTUDY'}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-500">{user.email}</td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex flex-col items-center justify-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        user.role === 'student' 
                          ? 'bg-blue-50 text-blue-600' 
                          : user.role === 'admin' 
                            ? 'bg-amber-50 text-amber-600' 
                            : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        <span className="leading-tight">{user.role === 'student' ? 'SINH' : user.role === 'admin' ? 'QUẢN' : 'GIẢNG'}</span>
                        <span className="leading-tight">{user.role === 'student' ? 'VIÊN' : user.role === 'admin' ? 'TRỊ' : 'VIÊN'}</span>
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-500">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        HOẠT ĐỘNG
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors inline-flex">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="p-8 border-t border-slate-50 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400">
                Hiển thị <span className="text-slate-900">1 - {users.length}</span> trong số <span className="text-slate-900">{users.length.toLocaleString()}</span> người dùng
              </p>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-black">1</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 text-xs font-bold hover:bg-slate-100 transition-colors">2</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 text-xs font-bold hover:bg-slate-100 transition-colors">3</button>
                  <span className="mx-1 text-slate-300">...</span>
                  <button className="w-10 h-8 flex items-center justify-center rounded-lg text-slate-400 text-xs font-bold hover:bg-slate-100 transition-colors">1,249</button>
                </div>
                <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUserManagement;
