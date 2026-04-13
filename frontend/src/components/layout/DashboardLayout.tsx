import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { authService } from '../../services/auth';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<'notifications' | 'settings' | 'profile' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Settings State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [avatarUrl] = useState<string>(localStorage.getItem('user_avatar') || '');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";
    } else {
      document.documentElement.style.filter = "none";
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate('/tai-lieu');
      // Can add query parameters here in the future
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItemsMap = {
    vi: [
      { name: "TRANG CHỦ", icon: "M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z", path: "/dashboard", isHome: true },
      { name: "THƯ VIỆN", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", path: "/tai-lieu" },
      { name: "BÀI KIỂM TRA", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", path: "/test-list" },
      { name: "FLASHCARD", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", path: "/flashcards" },
      { name: "GPA", icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z", path: "#" },
      { name: "THẢO LUẬN", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", path: "/cong-dong" },
      { name: "LIÊN KẾT IUH", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1", path: "https://iuh.edu.vn", external: true }
    ],
    en: [
      { name: "DASHBOARD", icon: "M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z", path: "/dashboard", isHome: true },
      { name: "LIBRARY", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", path: "/tai-lieu" },
      { name: "TESTS", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", path: "/test-list" },
      { name: "FLASHCARD", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", path: "/flashcards" },
      { name: "GPA", icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z", path: "#" },
      { name: "COMMUNITY", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", path: "/cong-dong" },
      { name: "IUH LINKS", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1", path: "https://iuh.edu.vn", external: true }
    ]
  };

  const t = {
    vi: {
      upload: "Tải tài liệu lên",
      support: "HỖ TRỢ",
      logout: "ĐĂNG XUẤT",
      home: "Trang chủ",
      library: "Thư viện",
      community: "Cộng đồng",
      searchPlaceholder: "Tìm kiếm tài liệu... (Nhấn Enter)",
      notifications: "Thông báo mới",
      theme: "Giao diện",
      light: "Sáng",
      dark: "Tối",
      language: "Ngôn ngữ",
      emailNotif: "Thông báo gửi Email",
      student: "Sinh Viên",
      profile: "Hồ sơ cá nhân",
      history: "Lịch sử hoạt động"
    },
    en: {
      upload: "Upload Document",
      support: "SUPPORT",
      logout: "LOGOUT",
      home: "Home",
      library: "Library",
      community: "Community",
      searchPlaceholder: "Search documents... (Press Enter)",
      notifications: "New Notifications",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      language: "Language",
      emailNotif: "Email Notifications",
      student: "Student",
      profile: "My Profile",
      history: "Activity Log"
    }
  };

  const currentT = t[language];
  const menuItems = menuItemsMap[language];

  return (
    <div className="flex h-screen bg-[#F4F7FE] font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-[280px] bg-white border-r flex flex-col h-full shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-gray-50 pb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl text-white flex items-center justify-center font-bold text-xl">
            IUH
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-900 leading-none mb-1">UNISTUDY</h1>
            <p className="text-[10px] font-bold text-gray-500 tracking-wider">IUH STUDENT PORTAL</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path || (item.isHome && location.pathname === '/dashboard');

            if (item.external) {
              return (
                <a key={idx} href={item.path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 px-4 py-3.5 text-gray-500 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                  {item.name}
                </a>
              );
            }

            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all ${isActive
                    ? "bg-[#3B66F5] text-white shadow-md shadow-blue-200"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                {item.isHome ? (
                  <svg className="w-5 h-5 opacity-90" fill="currentColor" viewBox="0 0 20 20"><path d={item.icon} /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                )}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 bg-white mt-auto border-t border-gray-50">
          <Link to="/tai-lieu/tai-len" className="flex items-center justify-center w-full gap-2 px-4 py-3 mb-6 font-semibold text-white transition-colors bg-[#3B66F5] rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            {currentT.upload}
          </Link>

          <div className="space-y-1">
            <Link to="#" className="flex items-center gap-3 px-4 py-3 font-medium text-gray-500 transition-colors rounded-xl hover:bg-gray-50 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {currentT.support}
            </Link>
            <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 font-medium text-gray-500 transition-colors rounded-xl hover:bg-red-50 hover:text-red-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              {currentT.logout}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar */}
        <div className="h-20 bg-white border-b flex justify-between items-center px-8 shrink-0 relative z-10 shadow-sm">
          <div className="flex gap-8">
            <Link to="/dashboard" className={`font-semibold pb-7 pt-7 relative top-[1px] transition-all ${location.pathname === '/dashboard' || location.pathname === '/' ? "text-[#3B66F5] border-b-2 border-[#3B66F5]" : "text-gray-500 hover:text-gray-900"}`}>{currentT.home}</Link>
            <Link to="/tai-lieu" className={`font-semibold pb-7 pt-7 relative top-[1px] transition-all ${location.pathname.startsWith('/tai-lieu') ? "text-[#3B66F5] border-b-2 border-[#3B66F5]" : "text-gray-500 hover:text-gray-900"}`}>{currentT.library}</Link>
            <Link to="/cong-dong" className={`font-semibold pb-7 pt-7 relative top-[1px] transition-all ${location.pathname.startsWith('/cong-dong') ? "text-[#3B66F5] border-b-2 border-[#3B66F5]" : "text-gray-500 hover:text-gray-900"}`}>{currentT.community}</Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder={currentT.searchPlaceholder}
                className="bg-gray-50 pl-11 pr-4 py-2.5 rounded-full text-sm outline-none w-[280px] border border-gray-100 focus:border-[#3B66F5] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-4 border-l pl-6 border-gray-100 relative">
              {/* Notifications */}
              <div className="relative">
                <button onClick={() => setActiveMenu(activeMenu === 'notifications' ? null : 'notifications')} className={`transition-colors relative ${activeMenu === 'notifications' ? 'text-[#3B66F5]' : 'text-gray-400 hover:text-gray-600'}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                </button>
                {activeMenu === 'notifications' && (
                  <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm">{currentT.notifications}</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100/50 transition-colors">
                        <p className="text-sm font-bold text-blue-900">Tài liệu mới</p>
                        <p className="text-xs text-blue-600 mt-1">Minh Anh vừa tải lên Cấu trúc dữ liệu K17</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <p className="text-sm font-bold text-gray-900">Nhắc nhở kiểm tra</p>
                        <p className="text-xs text-gray-500 mt-1">Bạn có một bài kiểm tra sắp tới hạn.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="relative">
                <button onClick={() => setActiveMenu(activeMenu === 'settings' ? null : 'settings')} className={`transition-colors relative ${activeMenu === 'settings' ? 'text-[#3B66F5]' : 'text-gray-400 hover:text-gray-600'}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
                {activeMenu === 'settings' && (
                  <div className="absolute right-0 top-10 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <button onClick={toggleTheme} className="flex justify-between items-center w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                      <span>{currentT.theme}</span>
                      <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">{theme === 'light' ? currentT.light : currentT.dark}</span>
                    </button>
                    <button onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')} className="flex justify-between items-center w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                      <span>{currentT.language}</span>
                      <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">{language === 'vi' ? 'VN' : 'EN'}</span>
                    </button>
                    <button onClick={() => setNotifEnabled(!notifEnabled)} className="flex justify-between items-center w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                      <span>{currentT.emailNotif}</span>
                      <div className={`w-8 h-4 rounded-full flex items-center transition-colors ${notifEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full mx-0.5 transition-transform ${notifEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative">
                <button onClick={() => setActiveMenu(activeMenu === 'profile' ? null : 'profile')} className={`w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center border-2 shadow-sm overflow-hidden transition-all ${activeMenu === 'profile' ? 'border-[#3B66F5] ring-2 ring-blue-100' : 'border-white'}`}>
                  <img src={avatarUrl || `https://ui-avatars.com/api/?name=${localStorage.getItem('user_name') || 'User'}&background=EBF4FF&color=3B66F5`} alt="Avatar" className="w-full h-full object-cover" />
                </button>
                {activeMenu === 'profile' && (
                  <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-gray-100 mb-2">
                      <div className="font-black text-gray-900">{localStorage.getItem('user_name') || currentT.student}</div>
                      <div className="text-xs font-bold text-gray-400 mt-0.5">Sinh viên IUH</div>
                    </div>
                    <Link to="/profile" onClick={() => setActiveMenu(null)} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">{currentT.profile}</Link>
                    <Link to="/profile" onClick={() => setActiveMenu(null)} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">{currentT.history}</Link>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors">{currentT.logout}</button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
