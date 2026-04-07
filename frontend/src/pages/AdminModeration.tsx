import React from 'react';
import { 
  Users, 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  History, 
  Settings, 
  LogOut, 
  Search, 
  Bell,
  HelpCircle,
  Filter,
  History as HistoryIcon,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  AlertTriangle,
  Globe,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const AdminModeration: React.FC = () => {
  const navigate = useNavigate();

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

  const requests = [
    {
      id: 1,
      type: 'report',
      date: '15:42, 24/10/2023',
      title: 'Tài liệu: Giải thuật và Cấu trúc dữ liệu nâng cao.pdf',
      content: '"Nội dung này vi phạm bản quyền từ sách của tác giả XYZ, vui lòng gỡ bỏ."',
      user: 'Lê Văn Hùng',
      userRole: 'Người báo cáo',
      category: 'Vi phạm bản quyền',
      categoryType: 'Lý do báo cáo',
      avatar: 'https://i.pravatar.cc/150?img=11',
    },
    {
      id: 2,
      type: 'share',
      date: '14:20, 24/10/2023',
      title: 'Bộ đề thi trắc nghiệm Kinh tế vĩ mô 2023',
      content: 'Người dùng yêu cầu đưa tài liệu này vào thư mục công khai của Khoa Kinh tế...',
      user: 'Trần Thùy Linh',
      userRole: 'Người chia sẻ',
      category: 'Khoa Kinh tế',
      categoryType: 'Chuyên mục',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    {
      id: 3,
      type: 'report',
      date: '10:05, 24/10/2023',
      title: 'Thảo luận: Bài tập lớn HĐH nhóm 4',
      content: '"Bình luận của người dùng chứa ngôn từ không phù hợp và công kích cá nhân."',
      user: 'Nguyễn Anh Tuấn',
      userRole: 'Người báo cáo',
      category: 'Ngôn từ không phù hợp',
      categoryType: 'Lý do báo cáo',
      avatar: 'https://i.pravatar.cc/150?img=15',
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
              const isActive = index === 3; // "Kiểm duyệt chia sẻ"
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
      <main className="flex-1 ml-72 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10 shrink-0">
          <div className="relative w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm kiếm yêu cầu, người dùng..." 
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
                <p className="text-sm font-bold text-slate-900 leading-tight">Admin_Uni</p>
                <p className="text-[10px] text-slate-500 font-extrabold uppercase mt-0.5">Quản trị viên cấp cao</p>
              </div>
              <img src="https://i.pravatar.cc/150?img=11" alt="Admin" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
            </div>
          </div>
        </header>

        {/* Content Space */}
        <div className="flex-1 overflow-auto p-10">
          <div className="max-w-[1400px] mx-auto">
            {/* Page Heading */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Kiểm duyệt chia sẻ & Báo cáo</h2>
                <p className="text-slate-500 font-medium">
                  Xử lý các yêu cầu công khai và phản hồi vi phạm từ cộng đồng.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="bg-white text-slate-700 border border-slate-200 px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                  <Filter className="w-5 h-5" />
                  Bộ lọc
                </button>
                <button className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:-translate-y-0.5 text-sm tracking-wide">
                  <HistoryIcon className="w-5 h-5" />
                  Lịch sử xử lý
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Card 1 - Highlight Blue */}
              <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-600/30 text-white">
                <p className="text-blue-100 font-bold mb-4 text-xs uppercase tracking-wider">Chờ xử lý</p>
                <h3 className="text-5xl font-black mb-4">24</h3>
                <div className="flex items-center text-blue-100 text-xs font-bold gap-1 mt-auto">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12% so với hôm qua</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-slate-400 font-bold mb-4 text-xs uppercase tracking-wider">Báo cáo vi phạm</p>
                <h3 className="text-5xl font-black text-slate-900 mb-4">08</h3>
                <div className="flex items-center text-red-500 text-xs font-bold gap-1 mt-auto">
                  <AlertCircle className="w-4 h-4" />
                  <span>! Cần xử lý ngay</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-slate-400 font-bold mb-4 text-xs uppercase tracking-wider">Đã duyệt hôm nay</p>
                <h3 className="text-5xl font-black text-slate-900 mb-4">156</h3>
                <div className="flex items-center text-emerald-500 text-xs font-bold gap-1 mt-auto">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hiệu suất tốt</span>
                </div>
              </div>

              {/* Card 4 - Dark */}
              <div className="bg-[#1a1c29] p-6 rounded-3xl shadow-xl shadow-slate-900/20 text-white">
                <p className="text-slate-400 font-bold mb-4 text-xs uppercase tracking-wider">Thời gian phản hồi TB</p>
                <h3 className="text-5xl font-black mb-4">12 <span className="text-xl font-medium text-slate-400">phút</span></h3>
                <div className="flex items-center text-slate-300 text-xs font-bold gap-1 mt-auto">
                  <Clock className="w-4 h-4" />
                  <span>Nhanh hơn 5 phút</span>
                </div>
              </div>
            </div>

            {/* List Area */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
              {/* List Header */}
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Danh sách yêu cầu mới nhất</h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-bold text-blue-600">Yêu cầu công khai (18)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs font-bold text-red-600">Bị báo cáo (6)</span>
                  </div>
                </div>
              </div>

              {/* List Items */}
              <div className="divide-y divide-slate-50">
                {requests.map((req) => (
                  <div key={req.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-start justify-between gap-6">
                    {/* Left Icon & Content block */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Status Icon */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
                        ${req.type === 'report' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}
                      >
                        {req.type === 'report' ? <AlertCircle className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider
                            ${req.type === 'report' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}
                          >
                            {req.type === 'report' ? 'Báo cáo vi phạm' : 'Yêu cầu chia sẻ'}
                          </span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="text-xs text-slate-400 font-bold">{req.date}</span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mb-2 leading-tight">{req.title}</h4>
                        
                        {req.type === 'report' ? (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-3">
                             <MessageSquare className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                             <p className="text-sm font-medium text-slate-600 italic leading-relaxed">
                               {req.content}
                             </p>
                          </div>
                        ) : (
                          <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-2xl">
                            {req.content}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Info & Actions block */}
                    <div className="flex items-center gap-8 pl-6 border-l border-slate-100 shrink-0 w-[450px]">
                      {/* Meta info */}
                      <div className="flex-1 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <img src={req.avatar} alt={req.user} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-none">{req.user}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wide cursor-default">{req.userRole}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                             {req.type === 'report' ? '⚖️' : '📚'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-none">{req.category}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wide cursor-default">{req.categoryType}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-3">
                        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                        {req.type === 'report' ? (
                          <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-red-500/20 transition-colors">
                            Ẩn nội dung
                          </button>
                        ) : (
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-colors">
                            Duyệt
                          </button>
                        )}
                        <button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="p-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Hiển thị 1-10 trên 24 yêu cầu</span>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-black shadow-sm">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 text-xs font-bold hover:bg-slate-100 transition-colors">2</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 text-xs font-bold hover:bg-slate-100 transition-colors">3</button>
                  </div>
                  <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminModeration;
