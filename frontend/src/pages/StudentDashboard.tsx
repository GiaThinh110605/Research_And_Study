import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { studentStats, recentDocuments, myTests, recentDiscussions } from '../mock_data/dashboard';
const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Chào buổi sáng, {localStorage.getItem('user_name') || 'Minh'}! 👋</h2>
            <p className="text-gray-500 text-lg">Bạn có {studentStats.upcomingTestsCount} bài kiểm tra sắp tới trong tuần này.</p>
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
              <span className="text-6xl font-black text-[#3B66F5] font-sans tracking-tight">{studentStats.gpa}</span>
              <span className="text-2xl font-bold text-gray-400">/ {studentStats.maxGpa}</span>
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-gray-600">Tiến độ kỳ học</span>
                <span className="text-[#3B66F5]">{studentStats.progressPercent}%</span>
              </div>
              <div className="h-2.5 bg-blue-50 rounded-full overflow-hidden">
                <div className="h-full bg-[#3B66F5] rounded-full" style={{ width: `${studentStats.progressPercent}%` }}></div>
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
              {recentDocuments.map(doc => (
                <div key={doc.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50 hover:shadow-md transition cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                    doc.iconColor === 'red' ? 'bg-red-50 text-red-500' :
                    doc.iconColor === 'blue' ? 'bg-blue-50 text-blue-500' :
                    'bg-green-50 text-green-500'
                  }`}>
                    {doc.iconColor === 'red' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>}
                    {doc.iconColor === 'blue' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" /></svg>}
                    {doc.iconColor === 'green' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>}
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1 truncate">{doc.title}</h4>
                  <p className="text-sm text-gray-400 mb-4">{doc.updatedAt}</p>
                  <div className="flex gap-2 text-xs font-bold">
                    <span className={`px-2 py-1 rounded ${
                      doc.iconColor === 'red' ? 'bg-red-50 text-red-600' :
                      doc.iconColor === 'blue' ? 'bg-blue-50 text-blue-600' :
                      'bg-green-50 text-green-600'
                    }`}>{doc.format}</span>
                    <span className="px-2 py-1 text-gray-400">{doc.size}</span>
                  </div>
                </div>
              ))}
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
                {myTests.map(test => (
                  <tr key={test.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-5 font-bold text-gray-900">{test.title}</td>
                    <td className="py-5 text-gray-600 font-medium">{test.subject}</td>
                    <td className="py-5 text-gray-600 font-medium">{test.time}</td>
                    <td className="py-5">
                      {test.trend === 'up' && <span className="text-[#3B66F5] font-bold flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg> {test.result}</span>}
                      {test.trend === 'down' && <span className="text-[#3B66F5] font-bold flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg> {test.result}</span>}
                      {test.trend === 'none' && <span className="text-gray-400 font-bold">{test.result}</span>}
                    </td>
                    <td className="py-5">
                      {test.status === 'HOÀN THÀNH' && <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-md">{test.status}</span>}
                      {test.status === 'ĐANG MỞ' && <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-md">{test.status}</span>}
                    </td>
                    <td className="py-5 text-right">
                      {test.status === 'HOÀN THÀNH' ? (
                        <button onClick={() => navigate(`/test-result/${test.id}`)} className="text-[#3B66F5] p-2 hover:bg-blue-50 rounded-lg transition"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                      ) : (
                        <button onClick={() => navigate(`/take-test/${test.id}`)} className="bg-[#3B66F5] text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition">LÀM BÀI</button>
                      )}
                    </td>
                  </tr>
                ))}
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
                <span className="text-6xl font-black text-white font-sans tracking-tight">{studentStats.totalDocuments}</span>
                <div className="w-12 h-12 bg-[#3B66F5] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                </div>
              </div>
              <p className="text-blue-200 text-sm font-medium">+{studentStats.newDocumentsThisWeek} tài liệu mới tuần này</p>
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
              <p className="text-gray-500 text-sm mb-6">Bạn đã thuộc {studentStats.knownVocab}/{studentStats.totalVocab} từ vựng.</p>
              <button onClick={() => navigate('/tai-lieu')} className="w-full bg-gray-50 text-gray-900 font-bold py-3 rounded-xl hover:bg-[#3B66F5] hover:text-white transition shadow-sm border border-gray-100 hover:border-transparent">TIẾP TỤC HỌC</button>
            </div>
          </div>

          {/* Discussions */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-7 shadow-sm border border-gray-100 relative">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#3B66F5]" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
              Thảo luận mới
            </h3>
            <div className="space-y-5">
              {recentDiscussions.map(disc => (
                <div key={disc.id} className="flex gap-3 items-center">
                  <img src={disc.avatar} className="w-10 h-10 rounded-full bg-gray-100" alt="user" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm truncate">{disc.title}</h4>
                    <p className="text-xs text-gray-500">{disc.author} • {disc.time}</p>
                  </div>
                </div>
              ))}
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
  );
};

export default StudentDashboard;
