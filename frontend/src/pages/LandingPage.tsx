import React from 'react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">UniStudy</div>
            </div>

            {/* Navigation */}
            <nav className="hidden space-x-8 md:flex">
              <a href="#home" className="text-gray-700 transition-colors hover:text-blue-600">Trang chủ</a>
              <a href="#features" className="text-gray-700 transition-colors hover:text-blue-600">Tính năng</a>
              <a href="#documents" className="text-gray-700 transition-colors hover:text-blue-600">Tài liệu</a>
              <a href="#community" className="text-gray-700 transition-colors hover:text-blue-600">Cộng đồng</a>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Bell icon */}
              <button className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* Login button */}
              <button className="px-4 py-2 text-blue-600 transition-colors border border-blue-600 rounded-lg hover:bg-blue-50">
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Small text */}
            <p className="mb-4 text-sm font-semibold tracking-wide text-blue-600 uppercase">
              CỔNG THÔNG TIN SINH VIÊN IUH
            </p>

            {/* Main title */}
            <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
              UniStudy - Hỗ trợ Học tập Thông minh cho sinh viên IUH
            </h1>

            {/* Description */}
            <p className="max-w-3xl mx-auto mb-8 text-xl leading-relaxed text-gray-600">
              Nền tảng quản lý học tập toàn diện giúp tối ưu hóa điểm số, lưu trữ tài liệu thông minh và kết nối cộng đồng sinh viên Công nghiệp.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button className="px-6 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                Đăng ký ngay
              </button>
              <button className="px-6 py-3 font-semibold text-blue-600 transition-colors bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50">
                Tìm hiểu thêm
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section className="py-16 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow-2xl rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Sinh viên đang học tập và hợp tác"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Preview (optional section) */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Tính năng nổi bật</h2>
            <p className="text-lg text-gray-600">Giúp bạn học tập hiệu quả hơn mỗi ngày</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Quản lý tài liệu</h3>
              <p className="text-gray-600">Lưu trữ và tổ chức tài liệu học tập một cách thông minh, dễ dàng tìm kiếm</p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 mb-4 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Theo dõi điểm số</h3>
              <p className="text-gray-600">Công cụ tính GPA chính xác, giúp bạn theo dõi và cải thiện kết quả học tập</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 mb-4 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Cộng đồng học tập</h3>
              <p className="text-gray-600">Kết nối với sinh viên khác, chia sẻ kiến thức và cùng nhau tiến bộ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-white bg-gray-900">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 text-2xl font-bold text-blue-400">UniStudy</div>
            <p className="mb-4 text-gray-400">Nền tảng học tập thông minh cho sinh viên IUH</p>
            <p className="text-sm text-gray-500">© 2026 UniStudy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
