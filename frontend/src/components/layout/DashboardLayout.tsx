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
  X
} from 'lucide-react';

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
      { name: "FLASHCARD", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", path: "/flashcard" },
      { name: "THẢO LUẬN", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", path: "/thao-luan" },
      { name: "GPA", icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z", path: "/gpa" },
      { name: "LIÊN KẾT IUH", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1", path: "https://iuh.edu.vn", external: true }
    ],
    en: [
      { name: "DASHBOARD", icon: "M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z", path: "/dashboard", isHome: true },
      { name: "LIBRARY", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", path: "/tai-lieu" },
      { name: "TESTS", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", path: "/test-list" },
      { name: "FLASHCARD", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", path: "/flashcard" },
      { name: "GPA", icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z", path: "/gpa" },
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">UniStudy</h1>
              <p className="text-xs text-gray-500">Học tập thông minh</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium">
              <Home className="w-5 h-5" />
              Dashboard
            </Link>
            <Link to="/tai-lieu" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">
              <FileText className="w-5 h-5" />
              Tài liệu
            </Link>
            <Link to="/flashcard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">
              <BookOpen className="w-5 h-5" />
              Flashcards
            </Link>
            <Link to="/test-list" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">
              <Target className="w-5 h-5" />
              Bài kiểm tra
            </Link>
            <Link to="/thao-luan" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">
              <Users className="w-5 h-5" />
              Thảo luận
            </Link>
            <Link to="/gpa" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">
              <BarChart3 className="w-5 h-5" />
              GPA
            </Link>
          </div>
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium cursor-pointer" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tài liệu, bài kiểm tra..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">User Name</p>
                  <p className="text-xs text-gray-500">Student</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
