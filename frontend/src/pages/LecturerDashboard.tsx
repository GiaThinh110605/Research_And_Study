import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const LecturerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#F4F7FE] font-sans">
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
          {/* Active Item */}
          <Link to="/lecturer-dashboard" className="flex items-center gap-4 px-4 py-3.5 bg-[#3B66F5] text-white rounded-xl font-medium shadow-md shadow-blue-200">
            <svg className="w-5 h-5 opacity-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
            TRANG CHỦ
          </Link>
          
          {/* Inactive Items */}
          {[
            { name: "THƯ VIỆN", icon: "M4 6h16M4 10h16M4 14h16M4 18h16", path: "/tai-lieu" },
            { name: "BÀI KIỂM TRA", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { name: "FLASHCARD", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
            { name: "GPA", icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
            { name: "THẢO LUẬN", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", path: "/cong-dong" },
            { name: "LIÊN KẾT IUH", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" }
          ].map((item, idx) => (
            <Link key={idx} to={item.path || '#'} className="flex items-center gap-4 px-4 py-3.5 text-gray-500 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 bg-white mt-auto border-t border-gray-50">
          <Link to="/tai-lieu/tai-len" className="flex items-center justify-center w-full gap-2 px-4 py-3 mb-6 font-semibold text-white transition-colors bg-[#3B66F5] rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Tải tài liệu lên
          </Link>
          
          <div className="space-y-1">
            <Link to="#" className="flex items-center gap-3 px-4 py-3 font-medium text-gray-500 transition-colors rounded-xl hover:bg-gray-50 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              HỖ TRỢ
            </Link>
            <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 font-medium text-gray-500 transition-colors rounded-xl hover:bg-red-50 hover:text-red-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
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
              <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Tìm kiếm tài liệu, sinh viên..." className="bg-gray-50 pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none w-full border border-gray-100 focus:border-[#3B66F5] focus:bg-white transition-all font-medium" />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-gray-600 relative">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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

        {/* Dashboard Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header section */}
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Chào buổi sáng, Thầy A!</h2>
                <p className="text-gray-500 text-lg">Hôm nay thầy có <span className="font-bold text-[#3B66F5]">2 bài kiểm tra</span> mới cần chấm điểm.</p>
              </div>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm border border-gray-200 hover:bg-gray-50 transition">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Xem lịch dạy
                </button>
                <button className="flex items-center gap-2 bg-[#3B66F5] text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-200/50 hover:bg-blue-700 transition">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Tạo bài kiểm tra
                </button>
              </div>
            </div>

            {/* Top Cards Row */}
            <div className="grid grid-cols-3 gap-6">
              {/* Students Count */}
              <div className="bg-[#DEE8FE] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-end min-h-[160px]">
                <div className="absolute top-6 right-6 text-[#A0B9FE] text-xs font-black tracking-widest uppercase">+12% THÁNG NÀY</div>
                <svg className="w-10 h-10 absolute top-5 left-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                <div className="text-5xl font-black text-white mb-1 font-sans">1,248</div>
                <div className="text-[#A0B9FE] text-sm font-bold tracking-widest uppercase">SỐ SINH VIÊN</div>
              </div>

              {/* My Documents */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-end min-h-[160px] relative">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 absolute top-5 left-6">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                </div>
                <div className="text-5xl font-black text-gray-900 mb-1">56</div>
                <div className="text-gray-500 text-sm font-bold tracking-widest uppercase">TÀI LIỆU CỦA TÔI</div>
              </div>

              {/* Tests Created */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-end min-h-[160px] relative">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 absolute top-5 left-6">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                </div>
                <div className="text-5xl font-black text-gray-900 mb-1">24</div>
                <div className="text-gray-500 text-sm font-bold tracking-widest uppercase">BÀI KIỂM TRA ĐÃ TẠO</div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-12 gap-8">
              {/* Left Column: Recent Documents */}
              <div className="col-span-12 lg:col-span-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-6 h-6 text-[#3B66F5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Tài liệu gần đây
                  </h3>
                  <Link to="/tai-lieu" className="text-sm font-bold text-[#3B66F5] hover:underline">Xem tất cả</Link>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  {/* Doc 1 */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer flex gap-5 items-center">
                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 mb-1 truncate">Giáo trình Hệ quản trị CSDL</h4>
                      <p className="text-xs text-gray-500 mb-2">Cập nhật: 2 giờ trước</p>
                      <div className="flex gap-2 text-[10px] font-bold">
                        <span className="px-2 py-1 bg-green-50 text-green-600 rounded">PDF</span>
                        <span className="px-2 py-1 text-gray-400 bg-gray-50 rounded">4.2 MB</span>
                      </div>
                    </div>
                  </div>

                  {/* Doc 2 */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer flex gap-5 items-center">
                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 mb-1 truncate">Slide Bài giảng Chương 4</h4>
                      <p className="text-xs text-gray-500 mb-2">Cập nhật: Hôm qua</p>
                      <div className="flex gap-2 text-[10px] font-bold">
                        <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded">PPTX</span>
                        <span className="px-2 py-1 text-gray-400 bg-gray-50 rounded">12.5 MB</span>
                      </div>
                    </div>
                  </div>

                  {/* Doc 3 */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer flex gap-5 items-center">
                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 mb-1 truncate">Bài tập thực hành tuần 5</h4>
                      <p className="text-xs text-gray-500 mb-2">Cập nhật: 3 ngày trước</p>
                      <div className="flex gap-2 text-[10px] font-bold">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">DOCX</span>
                        <span className="px-2 py-1 text-gray-400 bg-gray-50 rounded">1.1 MB</span>
                      </div>
                    </div>
                  </div>

                  {/* Doc 4 */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer flex gap-5 items-center">
                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 mb-1 truncate">Danh sách nhóm thảo luận</h4>
                      <p className="text-xs text-gray-500 mb-2">Cập nhật: 4 ngày trước</p>
                      <div className="flex gap-2 text-[10px] font-bold">
                        <span className="px-2 py-1 bg-teal-50 text-teal-600 rounded">XLSX</span>
                        <span className="px-2 py-1 text-gray-400 bg-gray-50 rounded">0.8 MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Recent Results & Extra */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                
                {/* Results Card */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-[#3B66F5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    Kết quả gần đây
                  </h3>
                  
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50">
                      <h4 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">SINH VIÊN NỘP BÀI MỚI NHẤT</h4>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {[
                        { name: "Trần Nam", subject: "CSDL - KIỂM TRA 1", score: "9.5", initials: "TN", color: "bg-blue-100 text-blue-600" },
                        { name: "Lê Hoa", subject: "CSDL - KIỂM TRA 1", score: "8.0", initials: "LH", color: "bg-gray-100 text-gray-600" },
                        { name: "Phạm An", subject: "CSDL - KIỂM TRA 1", score: "7.5", initials: "PA", color: "bg-gray-100 text-gray-600" },
                        { name: "Vũ Huy", subject: "CSDL - KIỂM TRA 1", score: "10.0", initials: "VH", color: "bg-gray-100 text-gray-600" }
                      ].map((student, idx) => (
                        <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer">
                          <div className="flex items-center gap-3 w-full">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${student.color}`}>
                              {student.initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-gray-900 text-sm">{student.name}</h5>
                              <p className="text-[10px] font-bold text-gray-400 truncate">{student.subject}</p>
                            </div>
                            <div className="text-[#3B66F5] font-black text-lg w-10 text-right">{student.score}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                      <button className="text-[#3B66F5] font-bold text-sm tracking-widest uppercase hover:underline">XEM TOÀN BỘ BẢNG ĐIỂM</button>
                    </div>
                  </div>
                </div>

                {/* Promo Card CTA */}
                <div className="bg-gradient-to-br from-[#3B66F5] to-blue-800 rounded-3xl p-7 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none translate-x-1/4 translate-y-1/4">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Cần hỗ trợ chấm điểm?</h3>
                    <p className="text-blue-100 text-sm leading-relaxed mb-6">
                      Hệ thống AI của UniStudy có thể giúp thầy chấm các bài trắc nghiệm tự động.
                    </p>
                    <button className="bg-white text-[#3B66F5] font-bold py-2.5 px-5 rounded-xl text-sm shadow hover:bg-blue-50 transition">
                      THỬ NGAY
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <br className="h-4"/>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
