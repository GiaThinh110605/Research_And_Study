import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-lg font-bold text-gray-900">Research And Study</span>
            </div>


            {/* Right side */}
            <div className="flex items-center space-x-3">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center px-3 py-1 mb-6 text-xs font-medium text-indigo-600 rounded-full bg-indigo-50">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Đã tích hợp AI thông minh
              </div>

              {/* Title */}
              <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                Nghiên cứu & Học tập thông minh hơn với AI
              </h1>

              {/* Description */}
              <p className="max-w-lg mb-8 text-lg leading-relaxed text-gray-600">
                Hệ thống quản lý học tập toàn diện cho Sinh viên, Giảng viên và Quản trị viên. Tự động hóa toàn tất, tạo đề thi và kết nối tri thức.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <Link to="/register" className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700">
                  Bắt đầu ngay miễn phí
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>

              </div>

              {/* Stats */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-gray-300 border-2 border-white rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-400 border-2 border-white rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-500 border-2 border-white rounded-full"></div>
                </div>
                <span className="text-sm text-gray-600">Hơn 10.000+ sinh viên và giảng viên đã tin dùng.</span>
              </div>
            </div>

            {/* Right - App Mockups */}
            <div className="relative">
              {/* Main Dashboard Mockup */}
              <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transform rotate-[-2deg]">
                <div className="h-6 bg-gray-100 border-b border-gray-200 flex items-center px-3 gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
                <div className="p-4">
                  {/* Dashboard Content Mockup */}
                  <div className="flex gap-4">
                    {/* Sidebar */}
                    <div className="w-16 space-y-2">
                      <div className="h-8 bg-indigo-100 rounded"></div>
                      <div className="h-8 bg-gray-100 rounded"></div>
                      <div className="h-8 bg-gray-100 rounded"></div>
                      <div className="h-8 bg-gray-100 rounded"></div>
                    </div>
                    {/* Main Content */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-center h-20 rounded-lg bg-gray-50">
                        <div className="flex gap-4">
                          <div className="w-16 h-12 bg-indigo-200 rounded"></div>
                          <div className="w-16 h-12 bg-blue-200 rounded"></div>
                          <div className="w-16 h-12 bg-purple-200 rounded"></div>
                        </div>
                      </div>
                      <div className="h-32 p-3 rounded-lg bg-gray-50">
                        <div className="flex gap-2 mb-3">
                          <div className="w-20 h-3 bg-indigo-200 rounded"></div>
                          <div className="w-20 h-3 bg-gray-200 rounded"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-8 bg-white border border-gray-200 rounded"></div>
                          <div className="h-8 bg-white border border-gray-200 rounded"></div>
                          <div className="h-8 bg-white border border-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Mockup - Overlapping */}
              <div className="absolute -bottom-4 -right-4 w-3/4 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden transform rotate-[3deg]">
                <div className="flex items-center h-5 gap-1 px-2 bg-gray-100 border-b border-gray-200">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <div className="p-3 space-y-2">
                  <div className="w-24 h-3 bg-gray-200 rounded"></div>
                  <div className="space-y-1.5">
                    <div className="flex items-center h-6 px-2 bg-gray-100 rounded">
                      <div className="w-3 h-3 mr-2 bg-green-400 rounded-full"></div>
                      <div className="w-20 h-2 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center h-6 px-2 bg-gray-100 rounded">
                      <div className="w-3 h-3 mr-2 bg-yellow-400 rounded-full"></div>
                      <div className="w-24 h-2 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center h-6 px-2 bg-gray-100 rounded">
                      <div className="w-3 h-3 mr-2 bg-blue-400 rounded-full"></div>
                      <div className="w-16 h-2 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Badge */}
              <div className="absolute flex items-center gap-2 px-4 py-2 text-white bg-green-400 rounded-lg shadow-lg -bottom-6 left-8">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <div>
                  <div className="text-xs font-semibold">Chấm điểm AI</div>
                  <div className="text-[10px] opacity-90">Chính xác 98.6%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-2xl font-bold text-gray-900">Giải pháp toàn diện cho giáo dục</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              Tối ưu hóa quy trình học tập và giảng dạy với các công cụ thông minh được thiết kế riêng cho từng đối tượng.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Student Card */}
            <div className="p-8 bg-gray-50 rounded-2xl">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <div className="flex items-center justify-center w-10 h-10 mb-4 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                  <h3 className="mb-4 text-lg font-bold text-gray-900">Dành cho Sinh viên</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tóm tắt tài liệu bằng AI đa ngôn ngữ.
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Hệ thống Flashcards thông minh (Lặp lại ngắt quãng).
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Theo dõi tiến độ GPA và mục tiêu học tập.
                    </li>
                  </ul>
                </div>
                <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
                  <div className="flex items-center h-6 gap-1 px-3 border-b border-gray-100 bg-gray-50">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="w-24 h-2 bg-gray-200 rounded"></div>
                        <div className="w-16 h-2 mt-1 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center h-8 px-3 rounded-lg bg-indigo-50">
                        <div className="w-3 h-3 mr-2 bg-indigo-400 rounded-full"></div>
                        <div className="w-20 h-2 bg-indigo-200 rounded"></div>
                      </div>
                      <div className="flex items-center h-8 px-3 rounded-lg bg-gray-50">
                        <div className="w-3 h-3 mr-2 bg-gray-300 rounded-full"></div>
                        <div className="w-16 h-2 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center h-8 px-3 rounded-lg bg-gray-50">
                        <div className="w-3 h-3 mr-2 bg-gray-300 rounded-full"></div>
                        <div className="w-24 h-2 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="w-20 h-6 bg-indigo-600 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lecturer Card */}
            <div className="p-8 bg-gray-50 rounded-2xl">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <div className="flex items-center justify-center w-10 h-10 mb-4 bg-orange-100 rounded-lg">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <h3 className="mb-4 text-lg font-bold text-gray-900">Dành cho Giảng viên</h3>
                  <p className="mb-4 text-sm text-gray-600">
                    Tối ưu hóa thời gian soạn bài và đánh giá kết quả học tập của sinh viên.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-700">Tạo đề thi từ Word/Excel</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <span className="text-sm text-gray-700">Chấm điểm tự động</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="w-20 h-2 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-full h-2 mb-2 bg-gray-100 rounded"></div>
                    <div className="w-3/4 h-2 bg-gray-100 rounded"></div>
                  </div>
                  <div className="p-4 text-white bg-indigo-600 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-xs font-medium">AI Assistant</span>
                    </div>
                    <div className="w-full h-2 mb-2 rounded bg-white/30"></div>
                    <div className="w-2/3 h-2 rounded bg-white/20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Smart Management Section */}
      < section className="py-16 bg-indigo-600" >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-3 text-2xl font-bold text-white">Quản lý thông minh</h2>
              <p className="mb-6 text-sm text-indigo-100">
                Kiểm duyệt biên luận bằng AI và quản lý người dùng tập trung cho các cơ sở đào tạo quy mô lớn.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-full bg-indigo-500/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Kiểm duyệt AI
              </div>
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-full bg-indigo-500/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Quyền người dùng
              </div>
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-full bg-indigo-500/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Báo cáo tổng hợp
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* CTA Section */}
      < section className="py-20 bg-gradient-to-r from-purple-100 to-indigo-100" >
        <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">Sẵn sàng nâng tầm tri thức?</h2>
          <p className="max-w-xl mx-auto mb-8 text-gray-600">
            Tham gia cùng hàng ngàn người dùng đang thay đổi cách họ nghiên cứu và học tập mỗi ngày.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="px-8 py-3 text-sm font-semibold text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700">
              Bắt đầu miễn phí ngay
            </Link>
            <button className="px-8 py-3 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              Liên hệ bộ phận tư vấn
            </button>
          </div>
        </div>
      </section >

      {/* Footer */}
      < footer className="py-8 bg-white border-t border-gray-100" >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm font-semibold text-gray-900">Research And Study</div>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-700">Privacy Policy</a>
              <a href="#" className="hover:text-gray-700">Terms of Service</a>
              <a href="#" className="hover:text-gray-700">Contact Support</a>
              <a href="#" className="hover:text-gray-700">Status</a>
            </div>
          </div>
          <div className="mt-4 text-xs text-center text-gray-400 md:text-left">
            © 2026 Research And Study. All rights reserved.
          </div>
        </div>
      </footer >
    </div >
  );
};

export default LandingPage;
