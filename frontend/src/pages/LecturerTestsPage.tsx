import React from 'react';
import { LayoutDashboard, Users, GraduationCap, Clock, FileEdit, MoreHorizontal, ChevronRight, Share2, Eye, BarChart2 } from 'lucide-react';

const LecturerTestsPage: React.FC = () => {
    const stats = [
        { label: 'Tổng số bài kiểm tra', value: '24', sub: 'THÁNG NÀY', icon: <LayoutDashboard className="w-5 h-5 text-blue-500" />, color: 'bg-white' },
        { label: 'Lượt tham gia', value: '1,284', sub: 'SINH VIÊN', icon: <Users className="w-5 h-5 text-emerald-500" />, color: 'bg-white' },
        { label: 'Điểm trung bình', value: '7.8', sub: 'TOÀN KHOA', icon: <GraduationCap className="w-5 h-5 text-amber-500" />, color: 'bg-white' },
        { label: 'Đang chờ chấm', value: '15', sub: 'BÀI TỰ LUẬN', icon: <Clock className="w-5 h-5 text-indigo-500" />, color: 'bg-white' },
    ];

    const tests = [
        { id: 1, title: 'Kiểm tra Giữa kỳ: Cấu trúc Dữ liệu', duration: '60 phút', questions: '40 câu hỏi', status: 'ĐANG MỞ', statusColor: 'bg-green-50 text-green-600', attempts: 124, trend: '+12%', avgScore: 7.5, createdAt: '15/10/2023' },
        { id: 2, title: 'Cơ sở Dữ liệu - Lab 03', duration: '45 phút', questions: '20 câu hỏi', status: 'ĐÃ ĐÓNG', statusColor: 'bg-gray-100 text-gray-600', attempts: 89, trend: '', avgScore: 8.2, createdAt: '10/10/2023' },
        { id: 3, title: 'Toán rời rạc - Kiểm tra Chương 2', duration: '30 phút', questions: '15 câu hỏi', status: 'LÊN LỊCH', statusColor: 'bg-amber-50 text-amber-600', attempts: 0, trend: '', avgScore: '--', createdAt: '18/10/2023' },
        { id: 4, title: 'An toàn Thông tin - Cuối kỳ', duration: '90 phút', questions: '50 câu hỏi', status: 'ĐANG MỞ', statusColor: 'bg-green-50 text-green-600', attempts: 45, trend: '-5%', avgScore: 6.8, createdAt: '20/10/2023' },
    ];

    return (
        <div className="p-8 space-y-8 bg-[#F4F7FE] min-h-full">
            {/* Header section */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Quản lý Bài kiểm tra</h2>
                    <p className="text-gray-500 font-medium">Theo dõi hiệu suất và quản lý danh sách các đề thi đã tạo.</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-bold shadow-sm border border-gray-100 hover:bg-gray-50 transition">
                        <BarChart2 className="w-5 h-5" />
                        Xem báo cáo
                    </button>
                    <button className="flex items-center gap-2 bg-[#3B66F5] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200/50 hover:bg-blue-700 transition">
                        <FileEdit className="w-5 h-5" />
                        Tạo đề thi mới
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6">
                {stats.map((s, idx) => (
                    <div key={idx} className={`${idx === 0 ? 'bg-[#111827] text-white' : 'bg-white text-gray-900'} p-7 rounded-3xl shadow-sm border border-gray-50 flex flex-col justify-between min-h-[160px] relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}>
                        <div className="flex justify-between items-start">
                             <div className={`p-2 rounded-xl ${idx === 0 ? 'bg-white/10' : 'bg-gray-50'}`}>
                                {s.icon}
                             </div>
                             <span className={`text-[10px] font-black tracking-widest uppercase ${idx === 0 ? 'text-blue-400' : 'text-gray-400'}`}>
                                {s.sub}
                             </span>
                        </div>
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${idx === 0 ? 'text-gray-400' : 'text-gray-500'}`}>
                                {s.label}
                            </p>
                            <h3 className="text-5xl font-black">{s.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* List Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 uppercase tracking-widest text-sm">DANH SÁCH ĐỀ THI</h3>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] font-black tracking-[0.15em] text-gray-400 uppercase">
                                <th className="px-8 py-4">Tên bài kiểm tra</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Lượt thi</th>
                                <th className="px-6 py-4">Điểm TB</th>
                                <th className="px-6 py-4">Ngày tạo</th>
                                <th className="px-8 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {tests.map((test) => (
                                <tr key={test.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                                                <FileEdit className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 mb-0.5">{test.title}</p>
                                                <p className="text-xs text-gray-400 font-medium">{test.duration} • {test.questions}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest ${test.statusColor}`}>
                                            {test.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{test.attempts}</span>
                                            {test.trend && <span className="text-[10px] font-bold text-green-500">{test.trend}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: typeof test.avgScore === 'number' ? `${(test.avgScore / 10) * 100}%` : '0%' }}></div>
                                            </div>
                                            <span className="font-bold text-gray-900">{test.avgScore}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-gray-500">
                                        {test.createdAt}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Eye className="w-5 h-5" /></button>
                                            <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Share2 className="w-5 h-5" /></button>
                                            <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><FileEdit className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-8 py-5 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hiển thị 1-10 của 24 bài kiểm tra</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-50 transition">Trước</button>
                        <button className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-bold text-white shadow-md shadow-blue-200">1</button>
                        <button className="px-4 py-2 border border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-50 transition">2</button>
                        <button className="px-4 py-2 border border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-50 transition">3</button>
                        <button className="px-4 py-2 border border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-50 transition">Sau</button>
                    </div>
                </div>
            </div>

            {/* Bottom Cards row */}
            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-7 bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm relative overflow-hidden group flex flex-col justify-between">
                    <div>
                        <h4 className="text-xl font-black text-gray-900 mb-3">Tối ưu hóa bài giảng</h4>
                        <p className="text-gray-500 font-medium max-w-md leading-relaxed">
                            Các bài kiểm tra của bạn có tỷ lệ hoàn thành trung bình là 92%. Hãy thử thêm các câu hỏi trắc nghiệm hình ảnh để tăng tính tương tác.
                        </p>
                    </div>
                    <button className="flex items-center gap-2 text-[#3B66F5] font-black text-sm tracking-widest uppercase mt-8 hover:gap-3 transition-all">
                        Khám phá hướng dẫn <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute right-8 bottom-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                         <div className="w-32 h-32 bg-blue-900 rounded-full"></div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex items-center gap-8 relative overflow-hidden group">
                    <div className="w-24 h-24 rounded-full border-[8px] border-blue-50 flex items-center justify-center relative shrink-0">
                         <div className="absolute inset-0 border-[8px] border-blue-500 rounded-full border-t-transparent" style={{ transform: 'rotate(45deg)' }}></div>
                         <span className="text-xl font-black text-blue-600">85%</span>
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-gray-900 mb-2">Hiệu suất tổng quát</h4>
                        <p className="text-sm font-medium text-gray-500 mb-4 leading-relaxed">
                            Sinh viên đang gặp khó khăn nhất ở chương "Cấu trúc dữ liệu cây". Bạn có muốn tạo một bài ôn tập riêng?
                        </p>
                        <button className="text-[10px] font-black tracking-widest text-[#3B66F5] uppercase border-b-2 border-blue-100 hover:border-blue-500 transition-all">
                            TẠO ÔN TẬP NGAY
                        </button>
                    </div>
                </div>
            </div>
            <div className="h-4"></div>
        </div>
    );
};

export default LecturerTestsPage;
