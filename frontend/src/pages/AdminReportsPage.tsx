import React from 'react';
import { TrendingUp, BarChart3, Users, BookOpen, Clock } from 'lucide-react';

const AdminReportsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Chi tiết báo cáo tăng trưởng</h2>
        <p className="text-slate-500 text-[14px] mt-2">Phân tích chi tiết về hoạt động và tăng trưởng của hệ thống</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-emerald-600 text-sm font-bold bg-emerald-50 px-2 py-1 rounded-md">+40%</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-1">Tài liệu học thuật (Tháng này)</p>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">2,845</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-emerald-600 text-sm font-bold bg-emerald-50 px-2 py-1 rounded-md">+15%</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-1">Người dùng mới</p>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">342</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-emerald-600 text-sm font-bold bg-emerald-50 px-2 py-1 rounded-md">+8%</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-1">Thời gian trung bình/phiên</p>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">24m</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-800">Khuyến nghị từ AI</h3>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
          <ul className="space-y-4">
            <li className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
              <p className="text-[14px] text-slate-700 leading-relaxed">
                <span className="font-bold text-indigo-900">Mở rộng danh mục:</span> Lượng tài liệu về "Trí tuệ nhân tạo" và "Học máy" đang chiếm 60% tổng số tài liệu tải lên mới. Cân nhắc tách thành các danh mục con chuyên sâu hơn để tối ưu hóa tìm kiếm.
              </p>
            </li>
            <li className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
              <p className="text-[14px] text-slate-700 leading-relaxed">
                <span className="font-bold text-indigo-900">Tăng cường kiểm duyệt:</span> Cùng với sự gia tăng người dùng mới, tỷ lệ báo cáo vi phạm nội dung cũng tăng nhẹ. Nên bổ sung thêm bộ lọc từ khóa tự động.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
