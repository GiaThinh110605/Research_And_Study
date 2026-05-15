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
  Filter,
  Activity,
  LogIn,
  FilePlus,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const AdminLogs: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

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

  const logs = [
    {
      id: "LOG-001",
      user: "Nguyễn Văn An",
      email: "an.nguyen@student.edu.vn",
      action: "Đăng nhập hệ thống",
      module: "Authentication",
      time: "10:24:32 - 24/10/2023",
      ip: "192.168.1.45",
      status: "Thành công",
      icon: LogIn,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50"
    },
    {
      id: "LOG-002",
      user: "Trần Thị Bé",
      email: "be.tran@student.edu.vn",
      action: "Tải lên tài liệu mới",
      module: "Documents",
      time: "09:15:10 - 24/10/2023",
      ip: "113.160.20.1",
      status: "Thành công",
      icon: FilePlus,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50"
    },
    {
      id: "LOG-003",
      user: "Hệ thống",
      email: "system@unistudy.vn",
      action: "Phát hiện địa chỉ IP truy cập bất thường",
      module: "Security",
      time: "03:45:00 - 24/10/2023",
      ip: "45.22.11.99",
      status: "Cảnh báo",
      icon: ShieldAlert,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-50"
    },
    {
      id: "LOG-004",
      user: "Lê Văn Hùng",
      email: "hung.le@lecturer.edu.vn",
      action: "Cập nhật điểm thi học kỳ",
      module: "Grades",
      time: "16:20:15 - 23/10/2023",
      ip: "10.0.5.122",
      status: "Thành công",
      icon: Activity,
      iconColor: "text-indigo-500",
      iconBg: "bg-indigo-50"
    },
    {
      id: "LOG-005",
      user: "Unknown",
      email: "N/A",
      action: "Sai mật khẩu quá 5 lần",
      module: "Authentication",
      time: "22:10:05 - 22/10/2023",
      ip: "171.240.50.2",
      status: "Thất bại",
      icon: ShieldAlert,
      iconColor: "text-red-500",
      iconBg: "bg-red-50"
    }
  ];

  return (
    <div className="p-10 max-w-6xl mx-auto">
            {/* Page Heading */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Nhật ký hoạt động (System Logs)</h2>
                <p className="text-slate-500 font-medium">
                  Truy xuất và giám sát các sự kiện truy cập, thao tác của người dùng từ hệ thống.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="bg-white text-slate-700 border border-slate-200 px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm text-sm">
                  <Filter className="w-5 h-5" />
                  Lọc thời gian
                </button>
                <button className="bg-slate-800 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-slate-900/20 text-sm tracking-wide">
                  <Download className="w-5 h-5" />
                  Xuất dữ liệu (.CSV)
                </button>
              </div>
            </div>

            {/* Main Log Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
              {/* Filter Row */}
              <div className="p-4 border-b border-slate-50 flex items-center gap-4 bg-slate-50/50">
                <select className="bg-white border border-slate-200 text-slate-700 rounded-xl py-2 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100 shadow-sm">
                  <option>Tất cả Module</option>
                  <option>Authentication</option>
                  <option>Documents</option>
                  <option>Security</option>
                </select>
                <select className="bg-white border border-slate-200 text-slate-700 rounded-xl py-2 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100 shadow-sm">
                  <option>Mọi trạng thái</option>
                  <option>Thành công</option>
                  <option>Cảnh báo</option>
                  <option>Thất bại</option>
                </select>
              </div>

              {/* Table wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-white">
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-20">ID LOG</th>
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[200px]">NGƯỜI GÂY TÁC ĐỘNG</th>
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">HÀNH ĐỘNG</th>
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">THỜI GIAN / IP</th>
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">TRẠNG THÁI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-6 py-5 align-top">
                          <span className="text-[10px] font-black text-slate-400 tracking-wider font-mono">{log.id}</span>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div>
                            <p className="font-bold text-slate-900">{log.user}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{log.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${log.iconBg} ${log.iconColor}`}>
                              <log.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 leading-tight mb-1">{log.action}</p>
                              <span className="inline-flex bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded tracking-widest uppercase">
                                Module: {log.module}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-slate-700">{log.time}</span>
                            <span className="text-[11px] text-slate-400 font-medium font-mono">{log.ip}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top text-right">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            log.status === 'Thành công' ? 'bg-emerald-50 text-emerald-600' :
                            log.status === 'Cảnh báo' ? 'bg-amber-50 text-amber-600' :
                            'bg-red-50 text-red-600'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Hiển thị 5 trên hơn 12,000 logs</span>
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
  );
};

export default AdminLogs;
