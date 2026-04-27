import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { authService } from '../../services/auth';
import { Search, Bell, Settings, LogOut, Info, Upload } from 'lucide-react';

const LecturerLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { name: "DASHBOARD", icon: "M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z", path: "/lecturer-dashboard", isHome: true },
    { name: "TẠO BÀI KIỂM TRA", icon: "M12 4v16m8-8H4", path: "/lecturer/bai-kiem-tra/tao" },
    { name: "QUẢN LÝ BÀI KIỂM TRA", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", path: "/lecturer/bai-kiem-tra" },
    { name: "KẾT QUẢ SINH VIÊN", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", path: "/lecturer/ket-qua-sinh-vien" }
  ];

  return (
    <div className="flex h-screen bg-[#F4F7FE] font-sans">
      {/* Sidebar - Matching Home Page Branding */}
      <div className="w-[280px] bg-white border-r flex flex-col h-full shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-gray-50 pb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl text-white flex items-center justify-center font-bold text-xl transition-transform hover:scale-110 cursor-pointer">
            IUH
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-900 leading-none mb-1">UNISTUDY</h1>
            <p className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Lecturer Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path || (item.isHome && location.pathname === '/lecturer-dashboard');

            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all ${isActive
                    ? "bg-[#3B66F5] text-white shadow-md shadow-blue-200"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <svg className={isActive ? "w-5 h-5 opacity-90" : "w-5 h-5"} fill={isActive ? "currentColor" : "none"} stroke={isActive ? "none" : "currentColor"} viewBox={isActive ? "0 0 20 20" : "0 0 24 24"}>
                  {isActive ? <path d={item.icon} /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />}
                </svg>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 bg-white mt-auto border-t border-gray-50">
          <Link to="/tai-lieu/tai-len" className="flex items-center justify-center w-full gap-2 px-4 py-3 mb-6 font-bold text-white transition-colors bg-[#3B66F5] rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200">
            <Upload className="w-5 h-5" />
            TẢI TÀI LIỆU LÊN
          </Link>
          
          <div className="space-y-1">
            <Link to="#" className="flex items-center gap-3 px-4 py-3 font-medium text-gray-500 transition-colors rounded-xl hover:bg-gray-50 hover:text-gray-900">
              <Info className="w-5 h-5" />
              HỖ TRỢ
            </Link>
            <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 font-medium text-gray-500 transition-colors rounded-xl hover:bg-red-50 hover:text-red-600">
              <LogOut className="w-5 h-5" />
              ĐĂNG XUẤT
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar */}
        <div className="h-20 bg-white border-b flex justify-between items-center px-8 shrink-0 relative z-10 shadow-sm">
          <div className="flex-1 flex gap-8">
            <div className="relative w-[400px]">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tài liệu, bài kiểm tra..." 
                className="bg-gray-50 pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none w-full border border-gray-100 focus:border-[#3B66F5] focus:bg-white transition-all font-medium" 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-6 h-6" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <Settings className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 border-l pl-6 border-gray-100">
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900 leading-none mb-1">TS. Nguyễn Văn A</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">KHOA CNTT</div>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=A&background=EBF4FF&color=3B66F5" alt="Avatar" />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default LecturerLayout;
