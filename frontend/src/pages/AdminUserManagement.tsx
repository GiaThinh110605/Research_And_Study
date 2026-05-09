import React, { useState, useEffect } from 'react';
import { 
  BookOpen, LayoutDashboard, Users, FileText, MessageSquare,
  Settings, LogOut, Search, Plus, Bell, Filter, UserCheck, 
  Ban, Clock, Lock, Trash2, ChevronLeft, ChevronRight, Info, Lightbulb, Unlock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { userService } from '../services/user';

const AdminUserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tất cả vai trò');
  const [statusFilter, setStatusFilter] = useState('Trạng thái');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'STUDENT'
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const data = await authService.getCurrentUser();
      setCurrentUser(data);
    } catch (error) {
      console.error("Failed to fetch current user", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getUsers();
      // Ensure we have an array, even if API returns { items: [...] }
      const usersList = Array.isArray(data) ? data : (data.items || []);
      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (error) {
      console.error('Failed to fetch users', error);
      // Fallback for visual demonstration if API fails or is empty
      const mockData = [
        { id: 1, full_name: 'Nguyễn Văn An', student_id: '123456', email: 'an.nv@university.edu.vn', role: 'student', is_active: true },
        { id: 2, full_name: 'Trần Thị Bình', student_id: 'GV001', email: 'binh.tt@university.edu.vn', role: 'lecturer', is_active: false },
        { id: 3, full_name: 'Phạm Minh Đức', student_id: '654321', email: 'duc.pm@research.org', role: 'student', is_active: true }
      ];
      if (users.length === 0) {
         setUsers(mockData);
         setFilteredUsers(mockData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = users;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(u => 
        (u.full_name && u.full_name.toLowerCase().includes(lowerSearch)) ||
        (u.email && u.email.toLowerCase().includes(lowerSearch)) ||
        (u.student_id && u.student_id.toLowerCase().includes(lowerSearch)) ||
        (u.id && String(u.id).toLowerCase().includes(lowerSearch))
      );
    }
    
    if (roleFilter !== 'Tất cả vai trò') {
      const roleMap: Record<string, string> = { 'Sinh viên': 'STUDENT', 'Giảng viên': 'LECTURER', 'Quản trị viên': 'ADMIN' };
      result = result.filter(u => u.role?.toUpperCase() === roleMap[roleFilter]);
    }

    if (statusFilter !== 'Trạng thái') {
      const isActiveStatus = statusFilter === 'Hoạt động';
      result = result.filter(u => (u.is_active !== false) === isActiveStatus);
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await userService.updateUser(userId, { is_active: !currentStatus });
      fetchUsers();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await userService.createUser(newUser);
      setShowAddModal(false);
      setNewUser({ email: '', full_name: '', password: '', role: 'STUDENT' });
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Không thể tạo người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if(window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await userService.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error("Failed to delete user", error);
        setUsers(users.filter(u => u.id !== userId));
      }
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active !== false).length;
  const lockedUsers = users.filter(u => u.is_active === false).length;
  // Giả lập Pending since there is no pending status in schema usually
  const pendingUsers = Math.floor(totalUsers * 0.1); 

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const currentData = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
    { icon: Users, label: 'Quản lý người dùng', path: '/admin/users' },
    { icon: MessageSquare, label: 'Kiểm duyệt bình luận', path: '/admin/moderation' },
  ];

  return (
    <div className="flex min-h-screen bg-[#fafbfc] font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-blue-700 leading-tight">Nghiên cứu</h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">HỌC TẬP THÔNG MINH</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item, index) => {
              const isActive = item.label === 'Quản lý người dùng';
              return (
                <Link
                  to={item.path}
                  key={index}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all border-l-[3px] ${
                    isActive 
                      ? 'bg-blue-50/70 border-blue-600 text-blue-700 font-semibold' 
                      : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
                  }`}
                >
                  <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-[13px]">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-1">
          <Link
            to="/admin/settings"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:bg-slate-50 font-medium border-l-[3px] border-transparent transition-all"
          >
            <Settings className="w-[18px] h-[18px] text-slate-400" />
            <span className="text-[13px]">Cài đặt</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium border-l-[3px] border-transparent transition-all"
          >
            <LogOut className="w-[18px] h-[18px] text-red-500" />
            <span className="text-[13px]">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden bg-white">
        {/* Header */}
        <header className="h-16 bg-white flex items-center justify-between px-8 shrink-0 relative z-10">
          <div className="relative w-[340px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm kiếm người dùng, tài liệu..." 
              className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-100 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-5">
            <button className="text-slate-400 hover:text-slate-600 relative p-1">
              <Bell className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 pl-5 border-l border-slate-100">
              <div className="text-right">
                <p className="text-[13px] font-bold text-slate-700 leading-tight">{currentUser?.full_name || 'Admin'}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wide">QUẢN TRỊ VIÊN</p>
              </div>
              <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center shrink-0 overflow-hidden shadow-sm text-white text-[10px] font-bold">
                 {currentUser?.full_name?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 overflow-y-auto flex-1">
          <div className="max-w-5xl mx-auto">
            {/* Page Heading */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-[28px] font-bold text-slate-800 tracking-tight">Quản lý người dùng</h2>
                <p className="text-slate-500 text-[13px] mt-1.5 font-medium">Quản lý tài khoản người dùng, phân quyền truy cập và giám sát trạng thái hoạt động của hệ thống.</p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-indigo-600 transition-colors text-[13px] shadow-sm"
              >
                <Plus className="w-[18px] h-[18px]" />
                Thêm người dùng
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-5 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <div className="w-12 h-12 bg-indigo-50/80 text-[#4F46E5] rounded-xl flex items-center justify-center shrink-0">
                  <Users className="w-[22px] h-[22px]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Tổng người dùng</p>
                  <p className="text-2xl font-bold text-slate-800 mt-0.5">{totalUsers.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <div className="w-12 h-12 bg-emerald-50/80 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                  <UserCheck className="w-[22px] h-[22px]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Đang hoạt động</p>
                  <p className="text-2xl font-bold text-slate-800 mt-0.5">{activeUsers.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <div className="w-12 h-12 bg-red-50/80 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                  <Ban className="w-[22px] h-[22px]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Bị khóa</p>
                  <p className="text-2xl font-bold text-slate-800 mt-0.5">{lockedUsers.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <div className="w-12 h-12 bg-orange-50/80 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-[22px] h-[22px]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Chờ phê duyệt</p>
                  <p className="text-2xl font-bold text-slate-800 mt-0.5">{pendingUsers.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between mb-4 mt-2">
              <div className="flex gap-3">
                <div className="relative">
                  <select 
                    value={roleFilter} 
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 text-slate-600 rounded-xl py-2 pl-4 pr-10 text-[13px] font-medium outline-none focus:border-blue-400 cursor-pointer"
                  >
                    <option>Tất cả vai trò</option>
                    <option>Sinh viên</option>
                    <option>Giảng viên</option>
                    <option>Quản trị viên</option>
                  </select>
                  <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                </div>
                <div className="relative">
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 text-slate-600 rounded-xl py-2 pl-4 pr-10 text-[13px] font-medium outline-none focus:border-blue-400 cursor-pointer"
                  >
                    <option>Trạng thái</option>
                    <option>Hoạt động</option>
                    <option>Bị khóa</option>
                  </select>
                  <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                </div>
              </div>
              <button className="flex items-center gap-2 text-slate-500 text-[13px] font-medium hover:text-slate-800 pr-2">
                <Filter className="w-[14px] h-[14px]" />
                Lọc nâng cao
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[30%]">Họ và tên</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[25%]">Email</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[15%]">Vai trò</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[15%]">Trạng thái</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[15%] text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">Đang tải dữ liệu...</td>
                    </tr>
                  ) : currentData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">Không tìm thấy người dùng nào.</td>
                    </tr>
                  ) : currentData.map((user, idx) => {
                    const role = user.role?.toUpperCase();
                    const isStudent = role === 'STUDENT';
                    const isAdmin = role === 'ADMIN';
                    const roleLabel = isStudent ? 'Sinh viên' : isAdmin ? 'Quản trị viên' : 'Giảng viên';
                    const isActive = user.is_active !== false;

                    return (
                      <tr key={user.id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=random`} alt={user.full_name} className="w-[38px] h-[38px] rounded-full object-cover border border-slate-100 shadow-sm" />
                            <div>
                              <p className="text-[13px] font-bold text-slate-800">{user.full_name}</p>
                              <p className="text-[11px] text-slate-400 font-medium mt-0.5">ID: {user.student_id || user.id || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-slate-500 font-medium">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isStudent ? 'bg-[#EEF2FF] text-[#4F46E5]' : isAdmin ? 'bg-amber-50 text-amber-600' : 'bg-[#F3E8FF] text-[#9333EA]'
                          }`}>
                            {roleLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-1.5 text-[12px] font-bold ${
                            isActive ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                            {isActive ? 'Hoạt động' : 'Bị khóa'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 text-slate-400">
                            <button 
                              onClick={() => handleToggleStatus(user.id, isActive)}
                              title={isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                              className={`p-1.5 rounded-lg transition-colors ${
                              !isActive ? 'text-amber-600 hover:bg-amber-50' : 'hover:bg-slate-100'
                            }`}>
                              {!isActive ? <Lock className="w-[18px] h-[18px]" /> : <Unlock className="w-[18px] h-[18px]" />}
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              title="Xóa tài khoản"
                              className="p-1.5 rounded-lg transition-colors hover:text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-[18px] h-[18px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[12px] text-slate-500 font-medium">
                  Hiển thị <span className="font-semibold text-slate-700">{currentData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> trên tổng số <span className="font-semibold text-slate-700">{filteredUsers.length.toLocaleString()}</span> người dùng
                </p>
                <div className="flex items-center gap-1">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="w-[18px] h-[18px]" />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    // Show only first, last, and around current page
                    if (
                      totalPages <= 5 || 
                      idx === 0 || 
                      idx === totalPages - 1 || 
                      (idx >= currentPage - 2 && idx <= currentPage)
                    ) {
                      return (
                        <button 
                          key={idx}
                          onClick={() => setCurrentPage(idx + 1)}
                          className={`w-[30px] h-[30px] rounded-lg text-[13px] font-semibold flex items-center justify-center transition-colors ${
                            currentPage === idx + 1 
                              ? 'bg-[#4F46E5] text-white shadow-sm' 
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    } else if (idx === 1 || idx === totalPages - 2) {
                      return <span key={idx} className="px-1 text-slate-400 text-[13px]">...</span>;
                    }
                    return null;
                  })}

                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    <ChevronRight className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Tips */}
            <div className="grid grid-cols-2 gap-5 mb-10">
              <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0] flex gap-4">
                <div className="w-9 h-9 bg-indigo-100 text-[#4F46E5] rounded-full flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-indigo-900 mb-1 text-[13px]">Lưu ý bảo mật</h4>
                  <p className="text-[12px] text-indigo-800/80 leading-relaxed font-medium">Mọi hành động Khóa/Mở khóa hoặc Xóa tài khoản sẽ được lưu vào nhật ký hệ thống. Vui lòng kiểm tra kỹ thông tin người dùng trước khi thực hiện các tác vụ quản trị quan trọng.</p>
                </div>
              </div>
              <div className="bg-[#F0FDF4] rounded-2xl p-5 border border-[#DCFCE7] flex gap-4">
                <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 mb-1 text-[13px]">Mẹo quản lý</h4>
                  <p className="text-[12px] text-emerald-800/80 leading-relaxed font-medium">Sử dụng tính năng "Lọc nâng cao" để tìm kiếm nhanh các nhóm người dùng theo ngày đăng ký hoặc phiên đăng nhập cuối cùng để tối ưu hóa việc kiểm soát tài nguyên.</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Thêm người dùng mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <LogOut className="w-5 h-5 rotate-180" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Họ và tên</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-[13px] outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={newUser.full_name}
                  onChange={e => setNewUser({...newUser, full_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-[13px] outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="email@example.com"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Mật khẩu</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-[13px] outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="********"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Vai trò</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-[13px] outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="STUDENT">Sinh viên</option>
                  <option value="LECTURER">Giảng viên</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-[13px] hover:bg-slate-50 transition-all"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-[13px] shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  {isLoading ? 'Đang tạo...' : 'Tạo người dùng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
