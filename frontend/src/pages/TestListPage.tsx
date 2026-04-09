import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { testService, TestOut, TestStats } from '../services/test';
import { mockTests, mockTestStats } from '../mock_data/test_list';

const TestListPage: React.FC = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestOut[]>([]);
  const [stats, setStats] = useState<TestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('Tất cả');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsData, statsData] = await Promise.all([
          testService.getTests().catch(() => null),
          testService.getTestStats().catch(() => null)
        ]);
        
        setTests(testsData && testsData.length > 0 ? testsData : mockTests);
        setStats(statsData && statsData.total_tests > 0 ? statsData : mockTestStats);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu", error);
        setTests(mockTests);
        setStats(mockTestStats);
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
    // Search filter
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Status filter
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
    <div className="flex-1 overflow-y-auto p-6 md:p-8 rounded-3xl flex flex-col">
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
          <input
            type="text"
            placeholder="Tìm kiếm bài kiểm tra..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-gray-50 pl-11 pr-4 py-3 rounded-xl text-sm outline-none border border-transparent focus:border-[#3B66F5] focus:bg-white transition-all text-gray-700 font-medium"
          />
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
      <div className="flex-1 bg-white border border-gray-100 rounded-3xl shadow-sm">
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
                      <button
                        onClick={() => navigate(`/take-test/${test.id}`)}
                        className="bg-[#3B66F5] hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg text-sm transition-colors shadow-md shadow-blue-200"
                      >
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
                  className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm transition-colors ${currentPage === page
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
            <p className="text-gray-500 mb-5 font-medium leading-relaxed">Bạn đã hoàn thành {stats ? Math.round(stats.progress_percent) : 0}% lộ trình ôn tập. Hãy thử sức với bài kiểm tra mô phỏng để củng cố kiến thức tốt nhất.</p>
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
  );
};
export default TestListPage;
