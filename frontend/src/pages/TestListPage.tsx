import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { testService, TestOut, TestStats } from '../services/test';

const TestListPage: React.FC = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestOut[]>([]);
  const [stats, setStats] = useState<TestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('Tất cả');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsData, statsData] = await Promise.all([
          testService.getTests(),
          testService.getTestStats()
        ]);
        setTests(testsData);
        setStats(statsData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const filteredTests = tests.filter((test: TestOut) => {
    if (filterStatus === 'Tất cả') return true;
    if (filterStatus === 'Mới') return test.status === 'MỚI';
    if (filterStatus === 'Đang làm') return test.status === 'ĐANG LÀM';
    if (filterStatus === 'Hoàn thành') return test.status === 'HOÀN THÀNH';
    return true;
  });

  const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE);
  const paginatedTests = filteredTests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };
  return (
    <div className="flex h-screen bg-[#F4F7FE] font-sans">
      {/* Sidebar */}
      <div className="w-[280px] bg-white border-r flex flex-col h-full shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-gray-50 pb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl text-white flex items-center justify-center font-bold text-xl">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" /></svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-900 leading-none mb-1">UniStudy</h1>
            <p className="text-[10px] font-bold text-gray-500 tracking-wider">IUH STUDENT PORTAL</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {/* Active Item */}
          {[
            { name: "TRANG CHỦ", icon: "M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z", active: false, path: "/dashboard" },
            { name: "THƯ VIỆN", icon: "M4 6h16M4 10h16M4 14h16M4 18h16", active: false, path: "#" },
            { name: "BÀI KIỂM TRA", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", active: true, path: "/test-list" },
            { name: "FLASHCARD", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", active: false, path: "#" },
            { name: "GPA", icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z", active: false, path: "#" },
            { name: "THẢO LUẬN", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", active: false, path: "#" },
            { name: "LIÊN KẾT IUH", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1", active: false, path: "#" }
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.path || "#"}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-colors ${item.active
                ? 'bg-[#3B66F5] text-white shadow-md shadow-blue-200'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              {item.active ? (
                <svg className="w-5 h-5 opacity-90" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d={item.icon} clipRule="evenodd" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              )}
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 bg-white mt-auto border-t border-gray-50">
          <button className="flex items-center justify-center w-full gap-2 px-4 py-3 mb-6 font-semibold text-white transition-colors bg-[#3B66F5] rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Tải tài liệu lên
          </button>

          <div className="space-y-1">
            <Link to="#" className="flex items-center gap-3 px-4 py-3 font-medium text-gray-500 transition-colors rounded-xl hover:bg-gray-50 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              HỖ TRỢ
            </Link>
            <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 font-medium text-red-500 transition-colors rounded-xl hover:bg-red-50 hover:text-red-600">
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
          <div className="flex gap-8 h-full">
            <Link to="/dashboard" className="font-medium text-gray-500 flex items-center hover:text-gray-900 border-b-2 border-transparent hover:border-gray-200">Trang chủ</Link>
            <Link to="#" className="font-semibold text-[#3B66F5] flex items-center border-b-2 border-[#3B66F5]">Bài kiểm tra</Link>
            <Link to="#" className="font-medium text-gray-500 flex items-center hover:text-gray-900 border-b-2 border-transparent hover:border-gray-200">Thư viện</Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Tìm kiếm bài tập..." className="bg-gray-50 pl-11 pr-4 py-2 rounded-full text-sm outline-none w-[280px] border border-gray-100 focus:border-[#3B66F5] focus:bg-white transition-all" />
            </div>

            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-gray-600 relative">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
              </button>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden text-white">
                <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" />
              </div>
            </div>
          </div>
        </div>
        {/* Dashboard Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-10 bg-white m-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">

          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">HỆ THỐNG / <span className="text-[#3B66F5]">BÀI KIỂM TRA</span></div>
              <h2 className="text-3xl font-black text-gray-900">Danh sách Bài kiểm tra</h2>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100 px-5 py-3 rounded-2xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-[#3B66F5]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ĐÃ HOÀN THÀNH</div>
                  <div className="text-lg font-black text-gray-900 leading-tight">
                    {stats ? `${stats.completed_tests}/${stats.total_tests}` : "0/0"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 border border-gray-100 px-5 py-3 rounded-2xl">
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">GPA TRUNG BÌNH</div>
                  <div className="text-lg font-black text-gray-900 leading-tight">
                    {stats ? stats.average_score.toFixed(2) : "0.00"}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              <input type="text" placeholder="Lọc theo tên học phần hoặc mã lớp..." className="w-full bg-gray-50 pl-11 pr-4 py-3 rounded-xl text-sm outline-none border border-transparent focus:border-[#3B66F5] focus:bg-white transition-all text-gray-700 font-medium" />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl text-sm transition-colors border border-transparent flex items-center gap-2"
              >
                {filterStatus}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {showStatusMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  {['Tất cả', 'Mới', 'Đang làm', 'Hoàn thành'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status);
                        setShowStatusMenu(false);
                        setCurrentPage(1);
                      }}
                      className="w-full px-5 py-3 text-left text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-[#3B66F5] transition-colors"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl text-sm transition-colors border border-transparent flex items-center gap-2">
              Học kỳ gần nhất
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
          <div className="flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold tracking-widest text-gray-400 uppercase border-b border-gray-100 bg-gray-50/50">
                  <th className="py-4 px-6 rounded-tl-2xl">TÊN BÀI KIỂM TRA</th>
                  <th className="py-4 px-6 text-center">NGÀY TẠO</th>
                  <th className="py-4 px-6 text-center">SỐ CÂU HỎI</th>
                  <th className="py-4 px-6">TRẠNG THÁI</th>
                  <th className="py-4 px-6 text-right rounded-tr-2xl">HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500 font-medium">Đang tải dữ liệu...</td>
                  </tr>
                ) : paginatedTests.map((test, idx) => {
                  const globalIdx = (currentPage - 1) * ITEMS_PER_PAGE + idx;
                  
                  // Format Date & Time
                  const dateObj = new Date(test.created_at);
                  const formattedDate = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                  
                  // Setup Icon and Color based on type
                  let iconBg = "bg-blue-50 text-blue-500";
                  let svgPath = "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
                  
                  if (test.type === 'database') {
                     iconBg = "bg-indigo-50 text-indigo-500";
                     svgPath = "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4";
                  } else if (test.type === 'exam') {
                     iconBg = "bg-gray-100 text-gray-500";
                     svgPath = "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9";
                  } else if (test.type === 'document') {
                     iconBg = "bg-green-50 text-green-500";
                     svgPath = "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z";
                  }
                  
                  // Setup Status Tags
                  let statusTag = <span className="px-3 py-1.5 border border-gray-200 text-gray-500 text-[11px] font-bold rounded-lg uppercase tracking-wider">{test.status}</span>;
                  if (test.status === 'HOÀN THÀNH') statusTag = <span className="px-3 py-1.5 bg-green-100/60 text-green-600 text-[11px] font-bold rounded-lg uppercase tracking-wider">{test.status}</span>;
                  else if (test.status === 'ĐANG LÀM') statusTag = <span className="px-3 py-1.5 bg-orange-50 text-orange-600 text-[11px] font-bold rounded-lg uppercase tracking-wider">{test.status}</span>;

                  // Generate pseudo code
                  const hpCode = `Mã HP: 21100${globalIdx.toString().padStart(2, '0')}`;

                  return (
                    <tr key={test.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={svgPath} /></svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-[15px] mb-0.5">{test.title}</h4>
                            <div className="text-gray-400 text-[11px] font-medium tracking-wide">{hpCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <div className="font-bold text-gray-700 text-sm mb-0.5">{formattedDate}</div>
                        <div className="text-gray-400 text-xs">{formattedTime}</div>
                      </td>
                      <td className="py-5 px-6 text-center font-black text-gray-700 text-lg">{test.questions_count}</td>
                      <td className="py-5 px-6">{statusTag}</td>
                      <td className="py-5 px-6 text-right">
                        {test.status !== 'HOÀN THÀNH' && (
                          <button className="bg-[#3B66F5] hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg text-sm transition-colors shadow-md shadow-blue-200">
                            Làm bài
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center py-4 border-t border-gray-100 mt-2 px-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {filteredTests.length > 0 &&
                  `HIỂN THỊ ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredTests.length)} TRÊN ${filteredTests.length} BÀI KIỂM TRA`
                }
              </div>
              <div className="flex gap-1">
                {/* Previous */}
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((page, i) =>
                  page === '...' ? (
                    <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm transition-colors ${
                        currentPage === page
                          ? 'bg-[#3B66F5] text-white shadow-sm shadow-blue-200'
                          : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
          {/* Bottom Area */}
          <div className="grid grid-cols-[1fr_280px] gap-6 mt-4">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-[#E6EFFF] to-[#DCEHFF] relative p-8 flex items-center" style={{ background: 'linear-gradient(90deg, #E6EFFF 0%, #E8F0FF 50%, #C9DBFB 100%)' }}>
              <div className="relative z-10 w-2/3">
                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Sẵn sàng cho kỳ thi cuối kỳ?</h3>
                <p className="text-gray-500 mb-5 font-medium leading-relaxed">Bạn đã hoàn thành 85% lộ trình ôn tập. Hãy thử sức với bài kiểm tra mô phỏng để củng cố kiến thức tốt nhất.</p>
                <button className="bg-white text-[#3B66F5] font-bold py-2.5 px-6 rounded-xl hover:shadow-lg transition-shadow text-sm border border-transparent">
                  Bắt đầu mô phỏng ngay
                </button>
              </div>
              <div className="absolute right-0 bottom-0 h-full w-1/3 opacity-80" style={{
                backgroundImage: 'radial-gradient(circle at right, #A7C5FB 0%, transparent 70%)'
              }}>
                {/* Visual element placeholder for the box in image */}
                <div className="absolute right-8 bottom-4 w-16 h-20 bg-white/40 rounded-xl rounded-b-none backdrop-blur-sm border-t border-r border-white/50"></div>
                <div className="absolute right-28 top-8 w-12 h-12 bg-white/40 rounded-full backdrop-blur-sm border border-white/50"></div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center bg-white">
              <div className="relative w-24 h-24 mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#F3F4F6" strokeWidth="8" fill="none" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="#3B66F5" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 * (1 - (stats?.progress_percent || 0) / 100)} 
                    strokeLinecap="round" 
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-black text-gray-900">{stats ? Math.round(stats.progress_percent) : 0}%</span>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 text-center mb-1">Tiến độ hoàn thành</h4>
              <p className="text-gray-400 text-xs font-medium text-center">Học kỳ 1 - Năm học 2023</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TestListPage;
