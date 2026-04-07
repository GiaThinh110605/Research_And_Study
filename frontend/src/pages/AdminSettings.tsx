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
  Bell,
  HelpCircle,
  Save,
  RotateCcw,
  SlidersHorizontal,
  Bot,
  ShieldCheck,
  UserPlus,
  Mail,
  HelpCircle as HelpIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();

  // State for toggles
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    aiSummary: true,
    mindmapGen: true,
    plagiarismCheck: false,
    manualApproval: true,
    alertEmails: true,
    reportNotifications: true,
    signupDigests: false
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

  // Custom Toggle Component to match Figma exactly
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
      className={`w-[42px] h-6 rounded-full flex items-center p-1 transition-all duration-300 ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}
      onClick={onChange}
    >
      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${checked ? 'translate-x-full' : 'translate-x-0'}`}></div>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      {/* Sidebar - Matching previous screens for consistency */}
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
              const isActive = index === 5; // "Cài đặt hệ thống"
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
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between mb-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/150?img=11" alt="Admin" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
              <div>
                <p className="text-sm font-bold text-slate-900 leading-tight">Admin User</p>
                <p className="text-[10px] text-slate-500 font-medium">Principal Administrator</p>
              </div>
            </div>
          </div>
          
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
      <main className="flex-1 ml-72 flex flex-col min-h-screen pb-12">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10 shrink-0">
          <div className="relative w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm kiếm cài đặt..." 
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

            <button className="flex items-center justify-between gap-2 px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors min-w-[140px]">
               <span className="text-sm font-bold text-slate-700">Admin Profile</span>
               <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>
        </header>

        {/* Content Space */}
        <div className="flex-1 px-10 pt-10">
          <div className="max-w-6xl mx-auto">
            {/* Page Heading & Actions */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Cài đặt hệ thống</h2>
                <p className="text-slate-500 font-medium">
                  Quản lý cấu hình toàn cục và các dịch vụ nền của UniStudy.
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <button className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm text-sm">
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  Reset to Defaults
                </button>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:-translate-y-0.5 text-sm tracking-wide">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>

            {/* Grid Layout for Settings Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* General Settings Block - Spans 2 cols */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">General Settings</h3>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">WEBSITE NAME</label>
                      <input 
                        type="text" 
                        defaultValue="UniStudy Platform" 
                        className="w-full bg-slate-50 border-none text-slate-700 font-bold text-sm rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-100 outline-none transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">LANGUAGE SETTINGS</label>
                      <div className="relative">
                        <select className="w-full bg-slate-50 border-none text-slate-700 font-bold text-sm rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-100 outline-none appearance-none cursor-pointer transition-shadow">
                          <option>Tiếng Việt (VN)</option>
                          <option>English (US)</option>
                        </select>
                        <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="bg-slate-50 rounded-2xl p-6 h-full border border-slate-100">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-slate-900">Maintenance Mode</h4>
                        <ToggleSwitch checked={settings.maintenanceMode} onChange={() => toggleSetting('maintenanceMode')} />
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Kích hoạt để tạm thời chặn truy cập từ người dùng thông thường khi bảo trì hệ thống.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Services Block */}
              <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">AI Services</h3>
                </div>

                <div className="space-y-4">
                  {/* AI Summary */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between hover:bg-blue-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-0.5">AI Summary</h4>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">OPERATIONAL</span>
                      </div>
                    </div>
                    <ToggleSwitch checked={settings.aiSummary} onChange={() => toggleSetting('aiSummary')} />
                  </div>

                  {/* Mindmap */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between hover:bg-blue-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2-1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-0.5">Mindmap Generation</h4>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">OPERATIONAL</span>
                      </div>
                    </div>
                    <ToggleSwitch checked={settings.mindmapGen} onChange={() => toggleSetting('mindmapGen')} />
                  </div>

                  {/* Plagiarism */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-0.5">Plagiarism Check</h4>
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">MAINTENANCE</span>
                      </div>
                    </div>
                    <ToggleSwitch checked={settings.plagiarismCheck} onChange={() => toggleSetting('plagiarismCheck')} />
                  </div>
                </div>
              </div>

              {/* Storage & Security Block */}
              <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Storage & Security</h3>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CURRENT STORAGE USAGE</span>
                       <span className="text-xs font-bold text-slate-700">78% (390GB / 500GB)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full w-[78%]"></div>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">FILE SIZE LIMIT</label>
                      <div className="relative">
                        <input type="text" defaultValue="50" className="w-full font-bold text-sm text-center text-slate-700 bg-slate-50 border-none rounded-xl py-3 focus:ring-2 focus:ring-blue-100" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 uppercase">MB</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SESSION TIMEOUT</label>
                      <div className="relative">
                        <input type="text" defaultValue="120" className="w-full font-bold text-sm text-center text-slate-700 bg-slate-50 border-none rounded-xl py-3 focus:ring-2 focus:ring-blue-100" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 uppercase">MIN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User & Roles Block - Spans 2 cols */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">User & Roles</h3>
                </div>

                <div className="space-y-6">
                  {/* Manual Reg */}
                  <div className="border border-slate-100 rounded-2xl p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1 leading-tight">Manual Registration Approval</h4>
                      <p className="text-xs text-slate-500 font-medium">Admin must verify each account before access.</p>
                    </div>
                    <div className="ml-4">
                      <ToggleSwitch checked={settings.manualApproval} onChange={() => toggleSetting('manualApproval')} />
                    </div>
                  </div>

                  {/* Upload Limits */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">UPLOAD LIMITS PER ROLE (MONTHLY)</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2 flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-700">Student</span>
                        <div className="flex items-center gap-2">
                          <input type="text" defaultValue="20" className="w-16 text-center text-sm font-bold border border-slate-200 rounded-lg py-1 px-2 focus:ring-2 focus:ring-blue-100 outline-none" />
                          <span className="text-[10px] font-black text-slate-400 uppercase">FILES</span>
                        </div>
                      </div>
                      <div className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2 flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-700">Lecturer</span>
                        <div className="flex items-center gap-2">
                          <input type="text" defaultValue="100" className="w-16 text-center text-sm font-bold border border-slate-200 rounded-lg py-1 px-2 focus:ring-2 focus:ring-blue-100 outline-none" />
                          <span className="text-[10px] font-black text-slate-400 uppercase">FILES</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Notifications Block - Spans all 3 cols */}
              <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/60 shadow-sm p-8 relative overflow-hidden">
                 <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">System Notifications</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1 leading-tight">System Alert Emails</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Notify admins of server issues.</p>
                    </div>
                    <ToggleSwitch checked={settings.alertEmails} onChange={() => toggleSetting('alertEmails')} />
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1 leading-tight">New Report Notifications</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Daily summary of system reports.</p>
                    </div>
                    <ToggleSwitch checked={settings.reportNotifications} onChange={() => toggleSetting('reportNotifications')} />
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1 leading-tight">User Signup Digests</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Weekly new user activity stats.</p>
                    </div>
                    <ToggleSwitch checked={settings.signupDigests} onChange={() => toggleSetting('signupDigests')} />
                  </div>
                </div>

                {/* Floating Help Button on right side bottom */}
                <button className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 text-white hover:scale-110 transition-transform">
                  <HelpIcon className="w-6 h-6 mb-4 mr-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
