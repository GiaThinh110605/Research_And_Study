import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { Search, Bell, Settings, Upload, Filter, ListFilter, FileText, Download, MoreVertical, ExternalLink, ChevronDown } from 'lucide-react';

const LecturerDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const stats = [
    { label: 'Tổng tài liệu', value: '1,284', sub: '+12 TUẦN NÀY', icon: <FileText className="w-5 h-5 text-blue-500" />, subColor: 'text-green-500' },
    { label: 'Lượt tải về', value: '45.2k', sub: 'XU HƯỚNG TĂNG', icon: <Download className="w-5 h-5 text-blue-500" />, subColor: 'text-blue-500' },
  ];

  const documents = [
    {
      id: 1,
      title: 'Giáo trình Giải tích 1 - Hệ thống bài tập nâng cao',
      type: 'PDF',
      typeColor: 'bg-red-50 text-red-600',
      updatedAt: '12 Th08, 2023',
      tags: ['TOÁN HỌC', 'KỲ 1'],
      downloads: '2.4k'
    },
    {
      id: 2,
      title: 'Đề cương chi tiết: Quản trị dự án CNTT',
      type: 'DOCX',
      typeColor: 'bg-blue-50 text-blue-600',
      updatedAt: '05 Th09, 2023',
      tags: ['QUẢN TRỊ', 'CNTT'],
      downloads: '856'
    },
    {
      id: 3,
      title: 'Bài giảng: Kiến trúc máy tính hiện đại',
      type: 'PPTX',
      typeColor: 'bg-orange-50 text-orange-600',
      updatedAt: '28 Th08, 2023',
      tags: ['LECTURE', 'KIẾN TRÚC'],
      downloads: '1.2k'
    },
    {
      id: 4,
      title: 'Tài liệu tham khảo: Big Data & AI',
      type: 'PDF',
      typeColor: 'bg-red-50 text-red-600',
      updatedAt: '15 Th09, 2023',
      tags: ['DỮ LIỆU', 'AI'],
      downloads: '3.1k'
    },
    {
      id: 5,
      title: 'Báo cáo thực tập tốt nghiệp: Mẫu chuẩn...',
      type: 'DOCX',
      typeColor: 'bg-blue-50 text-blue-600',
      updatedAt: '20 Th09, 2023',
      tags: ['SINH VIÊN', 'MẪU BÁO CÁO'],
      downloads: '5.4k'
    },
    {
      id: 6,
      title: 'Giáo trình Logic học đại cương - Tái bản',
      type: 'PDF',
      typeColor: 'bg-red-50 text-red-600',
      updatedAt: '01 Th10, 2023',
      tags: ['TRIẾT HỌC', 'CƠ BẢN'],
      downloads: '942'
    }
  ];

  return (
    <div className="flex h-screen bg-[#F4F7FE] font-sans">
      {/* Sidebar - Matching Home Page */}
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
          {[
            { name: "TRANG CHỦ", icon: "M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z", path: "/lecturer-dashboard" },
            { name: "THƯ VIỆN", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", path: "/lecturer/tai-lieu", active: true },
            { name: "BÀI KIỂM TRA", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { name: "FLASHCARD", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
            { name: "GPA", icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
            { name: "THẢO LUẬN", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
            { name: "LIÊN KẾT IUH", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" }
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.path || '#'}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all ${item.active
                ? "bg-[#3B66F5] text-white shadow-md shadow-blue-200"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 bg-white mt-auto border-t border-gray-50">
          <Link to="/tai-lieu/tai-len" className="flex items-center justify-center w-full gap-2 px-4 py-3 mb-6 font-semibold text-white transition-colors bg-[#3B66F5] rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200">
            <Upload className="w-5 h-5" />
            Tải tài liệu lên
          </Link>
          <div className="space-y-1">
            <button className="flex items-center w-full gap-3 px-4 py-3 font-medium text-gray-500 transition-colors rounded-xl hover:bg-gray-50 hover:text-gray-900">
              <Settings className="w-5 h-5" />
              HỖ TRỢ
            </button>
            <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 font-medium text-gray-500 transition-colors rounded-xl hover:bg-red-50 hover:text-red-600">
              <ExternalLink className="w-5 h-5" />
              ĐĂNG XUẤT
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar - Matching Home Page */}
        <div className="h-20 bg-white border-b flex justify-between items-center px-8 shrink-0 relative z-10 shadow-sm">
          <div className="flex-1 flex gap-8">
            <div className="relative w-[400px]">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tài liệu học thuật..."
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

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F4F7FE]">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black tracking-widest text-[#3B66F5] uppercase mb-1">Thư viện số</p>
                <h2 className="text-3xl font-black text-gray-900">Thư viện tài liệu học thuật</h2>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 border border-gray-100 hover:bg-gray-50 transition">
                  <Filter className="w-4 h-4" />
                  Bộ lọc
                </button>
                <button className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 border border-gray-100 hover:bg-gray-50 transition">
                  <ListFilter className="w-4 h-4" />
                  Sắp xếp
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-12 gap-6">
              {stats.map((s, idx) => (
                <div key={idx} className="col-span-3 bg-white p-7 rounded-[2rem] border border-gray-50 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-blue-50 transition-all duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      {s.icon}
                    </div>
                  </div>
                  <div className="text-4xl font-black text-gray-900 mb-1 leading-none">{s.value}</div>
                  <p className={`text-[10px] font-black tracking-widest uppercase ${s.subColor}`}>{s.sub}</p>
                </div>
              ))}

              {/* Storage Card */}
              <div className="col-span-6 bg-gradient-to-br from-[#3B66F5] to-blue-700 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <h3 className="font-black text-xl mb-1">Dung lượng lưu trữ</h3>
                    <p className="text-xs text-blue-100 font-medium">Gói Academic Premium đang được sử dụng</p>
                  </div>
                  <div className="mt-8 space-y-3">
                    <div className="flex justify-between items-end text-xs font-black tracking-widest">
                      <p className="uppercase">78% đã dùng</p>
                      <p>15.6 GB / 20 GB</p>
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full w-[78%] relative">
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-2xl hover:shadow-blue-50 transition-all duration-500 overflow-hidden flex flex-col group">
                  <div className="p-8 pb-4">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest ${doc.typeColor}`}>
                        {doc.type}
                      </div>
                      <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    <h4 className="text-lg font-black text-gray-900 leading-tight mb-2 group-hover:text-[#3B66F5] transition-colors line-clamp-2 h-14">
                      {doc.title}
                    </h4>
                    <p className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">Cập nhật: {doc.updatedAt}</p>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {doc.tags.map(tag => (
                        <span key={tag} className="px-3 py-1.5 bg-gray-50 rounded-lg text-[9px] font-black text-gray-400 tracking-widest">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-auto p-8 pt-0 flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" />
                      {doc.downloads} lượt tải
                    </p>
                    <button className="flex items-center gap-2 text-[#3B66F5] text-sm font-black tracking-widest uppercase hover:gap-3 transition-all">
                      Xem ngay
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="flex justify-center pt-8">
              <button className="flex items-center gap-3 bg-white px-8 py-4 rounded-[1.5rem] border border-gray-50 shadow-sm text-sm font-black text-gray-600 hover:bg-gray-50 transition-all group">
                Xem thêm tài liệu
                <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerDocumentsPage;
