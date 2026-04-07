import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const StudentDashboard: React.FC = () => {
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
          <Link to="/dashboard" className="flex items-center gap-4 px-4 py-3.5 bg-[#3B66F5] text-white rounded-xl font-medium shadow-md shadow-blue-200">
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
          <div className="flex gap-8">
            <Link to="/dashboard" className="font-semibold text-[#3B66F5] border-b-2 border-[#3B66F5] pb-7 pt-7 relative top-[1px]">Trang chủ</Link>
            <Link to="/tai-lieu" className="font-medium text-gray-500 pb-7 pt-7 hover:text-gray-900">Thư viện</Link>
            <Link to="/cong-dong" className="font-medium text-gray-500 pb-7 pt-7 hover:text-gray-900">Cộng đồng</Link>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Tìm kiếm tài liệu..." className="bg-gray-50 pl-11 pr-4 py-2.5 rounded-full text-sm outline-none w-[280px] border border-gray-100 focus:border-[#3B66F5] focus:bg-white transition-all" />
            </div>
            
            <div className="flex items-center gap-4 border-l pl-6 border-gray-100">
              <button className="text-gray-400 hover:text-gray-600 relative">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Minh&background=EBF4FF&color=3B66F5" alt="Avatar" />
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
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Chào buổi sáng, Minh! 👋</h2>
                <p className="text-gray-500 text-lg">Bạn có 2 bài kiểm tra sắp tới trong tuần này.</p>
              </div>
              <Link to="/tai-lieu/tai-len" className="flex items-center gap-2 bg-[#3B66F5] text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-200/50 hover:bg-blue-700 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Tải lên nhanh
              </Link>
            </div>

            {/* Top Cards Row */}
            <div className="grid grid-cols-12 gap-6">
              {/* GPA Card */}
              <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                <div className="text-sm font-bold tracking-widest text-[#3B66F5] uppercase mb-1">HỌC TẬP</div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">GPA Hiện tại</h3>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-6xl font-black text-[#3B66F5] font-sans tracking-tight">3.82</span>
                  <span className="text-2xl font-bold text-gray-400">/ 4.0</span>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-gray-600">Tiến độ kỳ học</span>
                    <span className="text-[#3B66F5]">75%</span>
                  </div>
                  <div className="h-2.5 bg-blue-50 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3B66F5] rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>

              {/* Recent Docs */}
              <div className="col-span-12 lg:col-span-8 bg-transparent">
                <div className="flex justify-between items-center mb-6 px-1">
                  <h3 className="text-xl font-bold text-gray-900">Tài liệu gần đây</h3>
                  <Link to="/tai-lieu" className="text-sm font-bold text-[#3B66F5] uppercase tracking-wider hover:underline">XEM TẤT CẢ</Link>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  {/* Doc 1 */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50 hover:shadow-md transition cursor-pointer">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 mb-5">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1 truncate">Toán cao cấp A1 - ...</h4>
                    <p className="text-sm text-gray-400 mb-4">Cập nhật 2 giờ trước</p>
                    <div className="flex gap-2 text-xs font-bold">
                      <span className="px-2 py-1 bg-red-50 text-red-600 rounded">PDF</span>
                      <span className="px-2 py-1 text-gray-400">1.2 MB</span>
                    </div>
                  </div>
                  {/* Doc 2 */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50 hover:shadow-md transition cursor-pointer">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 mb-5">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" /></svg>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1 truncate">Cơ sở dữ liệu - Lab 4</h4>
                    <p className="text-sm text-gray-400 mb-4">Cập nhật 5 giờ trước</p>
                    <div className="flex gap-2 text-xs font-bold">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">DOCX</span>
                      <span className="px-2 py-1 text-gray-400">850 KB</span>
                    </div>
                  </div>
                  {/* Doc 3 */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50 hover:shadow-md transition cursor-pointer">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500 mb-5">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1 truncate">Xác suất thống kê - Data</h4>
                    <p className="text-sm text-gray-400 mb-4">Cập nhật Hôm qua</p>
                    <div className="flex gap-2 text-xs font-bold">
                      <span className="px-2 py-1 bg-green-50 text-green-600 rounded">XLSX</span>
                      <span className="px-2 py-1 text-gray-400">3.1 MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Table Row */}
            <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Bài test của tôi</h3>
                <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
                  <button className="px-4 py-1.5 rounded-md bg-white text-[#3B66F5] text-sm font-bold shadow-sm">HOẠT ĐỘNG</button>
                  <button className="px-4 py-1.5 rounded-md text-gray-500 text-sm font-bold hover:text-gray-900 hover:bg-white transition">LỊCH SỬ</button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] font-bold tracking-widest text-gray-400 uppercase border-b border-gray-100">
                      <th className="pb-4 font-bold">TÊN BÀI KIỂM TRA</th>
                      <th className="pb-4 font-bold">MÔN HỌC</th>
                      <th className="pb-4 font-bold">THỜI GIAN</th>
                      <th className="pb-4 font-bold">KẾT QUẢ</th>
                      <th className="pb-4 font-bold">TRẠNG THÁI</th>
                      <th className="pb-4 font-bold text-right">THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr className="group hover:bg-gray-50 transition-colors">
                      <td className="py-5 font-bold text-gray-900">Kiểm tra giữa kỳ - Logic học</td>
                      <td className="py-5 text-gray-600 font-medium">Triết học Mác-Lênin</td>
                      <td className="py-5 text-gray-600 font-medium">15/10/2023</td>
                      <td className="py-5"><span className="text-[#3B66F5] font-bold flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg> 9.5/10</span></td>
                      <td className="py-5"><span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-md">HOÀN THÀNH</span></td>
                      <td className="py-5 text-right"><button className="text-[#3B66F5] p-2 hover:bg-blue-50 rounded-lg transition"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button></td>
                    </tr>
                    <tr className="group hover:bg-gray-50 transition-colors">
                      <td className="py-5 font-bold text-gray-900">Quiz ôn tập: Lập trình Java</td>
                      <td className="py-5 text-gray-600 font-medium">Kỹ thuật lập trình</td>
                      <td className="py-5 text-gray-600 font-medium">12/10/2023</td>
                      <td className="py-5"><span className="text-[#3B66F5] font-bold flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg> 8.0/10</span></td>
                      <td className="py-5"><span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-md">HOÀN THÀNH</span></td>
                      <td className="py-5 text-right"><button className="text-[#3B66F5] p-2 hover:bg-blue-50 rounded-lg transition"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button></td>
                    </tr>
                    <tr className="group hover:bg-gray-50 transition-colors">
                      <td className="py-5 font-bold text-gray-900">Final Mock Test: Tiếng Anh 3</td>
                      <td className="py-5 text-gray-600 font-medium">Ngoại ngữ cơ sở</td>
                      <td className="py-5 text-gray-600 font-medium">Sắp tới</td>
                      <td className="py-5 text-gray-400 font-bold">—</td>
                      <td className="py-5"><span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-md">ĐANG MỞ</span></td>
                      <td className="py-5 text-right"><button className="bg-[#3B66F5] text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition">LÀM BÀI</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Cards Row */}
            <div className="grid grid-cols-12 gap-6">
              {/* Total Docs */}
              <div className="col-span-12 lg:col-span-4 bg-[#0A1A3F] rounded-3xl p-7 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-20">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                </div>
                <div className="relative z-10">
                  <div className="text-sm font-bold tracking-widest text-[#829DF8] uppercase mb-4">TỔNG TÀI LIỆU</div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-6xl font-black text-white font-sans tracking-tight">124</span>
                    <div className="w-12 h-12 bg-[#3B66F5] rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                    </div>
                  </div>
                  <p className="text-blue-200 text-sm font-medium">+12 tài liệu mới tuần này</p>
                </div>
              </div>

              {/* Flashcards */}
              <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-7 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
                  </div>
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-md tracking-wider">ĐANG HỌC</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Flashcards chuyên ngành</h3>
                  <p className="text-gray-500 text-sm mb-6">Bạn đã thuộc 45/120 từ vựng.</p>
                  <button className="w-full bg-gray-50 text-gray-900 font-bold py-3 rounded-xl hover:bg-[#3B66F5] hover:text-white transition shadow-sm border border-gray-100 hover:border-transparent">TIẾP TỤC HỌC</button>
                </div>
              </div>

              {/* Discussions */}
              <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-7 shadow-sm border border-gray-100 relative">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#3B66F5]" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                  Thảo luận mới
                </h3>
                <div className="space-y-5">
                  <div className="flex gap-3 items-center">
                    <img src="https://ui-avatars.com/api/?name=Anh+Nguyen&background=random" className="w-10 h-10 rounded-full bg-gray-100" alt="user" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm truncate">Giải đáp bài tập Cấu trúc dữ liệu</h4>
                      <p className="text-xs text-gray-500">Anh Nguyen • 5 phút trước</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <img src="https://ui-avatars.com/api/?name=Tran+Hoang&background=random" className="w-10 h-10 rounded-full bg-gray-100" alt="user" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm truncate">Tài liệu ôn thi cuối kỳ Triết học</h4>
                      <p className="text-xs text-gray-500">Tran Hoang • 1 giờ trước</p>
                    </div>
                  </div>
                </div>
                
                {/* Float Action Button equivalent */}
                <button className="absolute bottom-6 right-6 w-14 h-14 bg-[#3B66F5] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-300 hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </button>
              </div>
            </div>
          </div>
          <br className="h-4"/>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
