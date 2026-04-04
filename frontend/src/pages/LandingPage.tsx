import React from 'react';
import { Link } from 'react-router-dom';

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
              {/* Search icon */}
              <button className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Bell icon */}
              <button className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* Login button */}
              <Link to="/login" className="px-4 py-2 text-blue-600 transition-colors border border-blue-600 rounded-lg hover:bg-blue-50">
                Đăng nhập
              </Link>
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

      {/* Liên kết nhanh với IUH Section */}
      <section className="py-16 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Liên kết nhanh với IUH</h2>
            <p className="mb-8 text-sm text-gray-600">
              Truy cập nhanh các tài nguyên quan trọng của trường Đại học Công nghiệp TP.HCM
            </p>
            <div className="flex justify-end mb-8">
              <a href="#" className="flex items-center text-blue-600 hover:underline">
                XEM TẤT CẢ LIÊN KẾT +
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Link Card 1 */}
            <a href="https://sv.iuh.edu.vn/sinh-vien-dang-nhap.html" target="_blank" rel="noopener noreferrer" className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Trang sinh viên IUH</h3>
            </a>

            {/* Link Card 2 */}
            <a href="https://tienichsv.com/cong-cu-tinh-diem-iuh" target="_blank" rel="noopener noreferrer" className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 mb-4 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">IUH GPA Analyzer</h3>
            </a>

            {/* Link Card 3 */}
            <a href="https://www.facebook.com/sviuh" target="_blank" rel="noopener noreferrer" className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">IUH Facebook</h3>
            </a>

            {/* Link Card 4 */}
            <a href="https://www.topuniversities.com/universities/industrial-university-ho-chi-minh-city-iuh" target="_blank" rel="noopener noreferrer" className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 mb-4 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Google IUH</h3>
            </a>

            {/* Link Card 5 */}
            <a href="https://doantn.iuh.edu.vn/login.html" target="_blank" rel="noopener noreferrer" className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 mb-4 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Điểm rèn luyện</h3>
            </a>
          </div>
        </div>
      </section>

      {/* Hệ sinh thái học tập Section */}
      <section className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Hệ sinh thái học tập số 1 dành riêng cho sinh viên IUH.
              </h2>
              <p className="mb-8 text-lg text-gray-600">
                Được phát triển bởi những sinh viên hiểu rõ cấu trúc chương trình đào tạo của trường, UniStudy mang lại những tính năng rất thực tế nhất.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="mb-2 text-3xl font-bold text-blue-600">15k+</div>
                  <div className="text-gray-600">Sinh viên tham gia</div>
                </div>
                <div>
                  <div className="mb-2 text-3xl font-bold text-blue-600">200k+</div>
                  <div className="text-gray-600">Tài liệu đã chia sẻ</div>
                </div>
              </div>

              <button className="px-6 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                Hệ thống gợi ý học thông minh bằng AI
              </button>
            </div>

            <div className="overflow-hidden shadow-2xl rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Hệ thống học tập thông minh"
                className="w-full h-auto"
              />
            </div>
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Column 1 - Logo & Description */}
            <div>
              <div className="mb-4 text-2xl font-bold text-blue-400">UniStudy</div>
              <p className="mb-4 text-gray-400">Nền tảng học tập thông minh cho sinh viên IUH</p>
              {/* Social Media Icons */}
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm5.339-9.87a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2 - NỀN TẢNG */}
            <div>
              <h3 className="mb-4 font-semibold">NỀN TẢNG</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Thư viện tài liệu</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Bộ đề ôn/trắc nghiệm</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Tính điểm GPA</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Flashcards học tập</a></li>
              </ul>
            </div>

            {/* Column 3 - IUH CONNECT */}
            <div>
              <h3 className="mb-4 font-semibold">IUH CONNECT</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Trang chủ IUH</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cổng sinh viên</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Hệ thống LMS</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Phòng đào tạo</a></li>
              </ul>
            </div>

            {/* Column 4 - HỖ TRỢ */}
            <div>
              <h3 className="mb-4 font-semibold">HỖ TRỢ</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Hướng dẫn sử dụng</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Câu hỏi thường gặp</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Điều khoản & Bảo mật</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 mt-12 text-center border-t border-gray-800">
            <p className="text-sm text-gray-500">© 2023 UniStudy Team. Thông tin và chính sách bảo mật.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
