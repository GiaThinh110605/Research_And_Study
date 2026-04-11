import React from 'react';
import { Link } from 'react-router-dom';

const LecturerDashboard: React.FC = () => {
  return (
    <div className="p-8">
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
              <Link to="/lecturer/tai-lieu" className="text-sm font-bold text-[#3B66F5] hover:underline">Xem tất cả</Link>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              {[
                { title: "Giáo trình Hệ quản trị CSDL", time: "2 giờ trước", type: "PDF", size: "4.2 MB", color: "text-blue-600" },
                { title: "Slide Bài giảng Chương 4", time: "Hôm qua", type: "PPTX", size: "12.5 MB", color: "text-orange-600" },
                { title: "Bài tập thực hành tuần 5", time: "3 ngày trước", type: "DOCX", size: "1.1 MB", color: "text-blue-600" },
                { title: "Danh sách nhóm thảo luận", time: "4 ngày trước", type: "XLSX", size: "0.8 MB", color: "text-teal-600" }
              ].map((doc, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer flex gap-5 items-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 mb-1 truncate">{doc.title}</h4>
                    <p className="text-xs text-gray-500 mb-2">Cập nhật: {doc.time}</p>
                    <div className="flex gap-2 text-[10px] font-bold">
                      <span className={`px-2 py-1 bg-gray-50 rounded ${doc.color}`}>{doc.type}</span>
                      <span className="px-2 py-1 text-gray-400 bg-gray-50 rounded">{doc.size}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Recent Results & Extra */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
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
      <div className="h-4"></div>
    </div>
  );
};

export default LecturerDashboard;
