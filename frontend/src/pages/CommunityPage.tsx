import React from 'react';
import { Link } from 'react-router-dom';

const CommunityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="text-2xl font-black tracking-tight text-blue-600">UniStudy</div>
            </Link>

            {/* Navigation */}
            <nav className="hidden space-x-10 md:flex">
              <Link to="/" className="text-sm font-semibold text-gray-500 transition-colors hover:text-blue-600">Trang chủ</Link>
              <Link to="/tinh-nang" className="text-sm font-semibold text-gray-500 transition-colors hover:text-blue-600">Tính năng</Link>
              <Link to="/tai-lieu" className="text-sm font-semibold text-gray-500 transition-colors hover:text-blue-600">Tài liệu</Link>
              <Link to="/cong-dong" className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600">Cộng đồng</Link>
              <Link to="/thao-luan" className="text-sm font-semibold text-gray-500 transition-colors hover:text-blue-600">Thảo luận</Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:text-blue-600">
                Đăng nhập
              </Link>
              <Link to="/register" className="px-5 py-2.5 text-sm font-semibold text-white transition-all bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg">
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Hero Banner */}
        <div className="relative p-10 mb-12 overflow-hidden bg-blue-600 shadow-xl rounded-3xl shadow-blue-600/20 sm:p-14 lg:p-16">
          <div className="absolute inset-0">
            {/* Abstract background blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 right-48 w-64 h-64 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 right-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-10">
            <div className="max-w-xl text-white">
              <h1 className="mb-4 text-4xl font-extrabold sm:text-5xl leading-tight">
                Tham gia cộng đồng <br className="hidden sm:block" /> sinh viên IUH
              </h1>
              <p className="mb-8 text-lg font-medium text-blue-100">
                Nơi kết nối hơn 10,000 sinh viên Công nghiệp. Chia sẻ tài liệu, thảo luận bài tập và cùng nhau chinh phục học bổng.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button className="px-8 py-3.5 text-sm font-bold text-blue-600 transition-all bg-white shadow-md rounded-xl hover:bg-slate-50 hover:shadow-lg">
                  Tham gia ngay
                </button>
                <button className="px-8 py-3.5 text-sm font-bold text-white transition-colors border-2 border-white/30 backdrop-blur-sm rounded-xl hover:bg-white/10">
                  Khám phá nhóm
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 sm:flex-row md:flex-col lg:flex-row">
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <div className="text-3xl font-extrabold text-white">2.4k+</div>
                <div className="mt-1 text-[10px] font-bold tracking-widest text-blue-200 uppercase">Đang trực tuyến</div>
              </div>
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <div className="text-3xl font-extrabold text-white">500+</div>
                <div className="mt-1 text-[10px] font-bold tracking-widest text-blue-200 uppercase">Nhóm học tập</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Main Feed (Left 2 cols) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center text-xl font-bold text-slate-900">
                <span className="flex items-center justify-center w-8 h-8 mr-3 text-red-500 bg-red-100 rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.281.436-.506.914-.769 1.36-1.03 1.774-2.25 3.518-4.053 4.39A9.97 9.97 0 009 19h1a9.97 9.97 0 006.075-2.07l-.924-.925a8.966 8.966 0 01-5.151 1.995c-1.385 0-2.695-.365-3.83-1.01 1.705-.623 2.92-2.016 3.864-3.565.733-1.2 1.43-2.487 2.37-3.468.94-.98 2.064-1.63 3.327-1.745-.33-.675-.758-1.298-1.28-1.84a9.058 9.058 0 00-2.056-1.52zM12 2A9.965 9.965 0 0118 10a9.965 9.965 0 01-2.925 7.075l-1.414-1.414A7.962 7.962 0 0015 10a7.965 7.965 0 00-2-5.292" clipRule="evenodd" />
                  </svg>
                </span>
                Thảo luận sôi nổi nhất
              </h2>
              <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Xem tất cả</a>
            </div>

            <div className="space-y-5">
              {/* Post 1 */}
              <article className="p-6 transition-shadow bg-white border border-slate-200 rounded-3xl hover:shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <img src="https://i.pravatar.cc/150?img=11" alt="Minh Anh" className="w-10 h-10 border rounded-full border-slate-100" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 rounded uppercase tracking-wider">Tài liệu</span>
                      <span className="text-sm text-slate-500">Đăng bởi <span className="font-bold text-slate-900">Minh Anh</span> • 2 giờ trước</span>
                    </div>
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">Tổng hợp đề thi cuối kỳ môn Cấu trúc dữ liệu và Giải thuật (K17)</h3>
                <p className="mb-4 leading-relaxed text-slate-600 line-clamp-2">
                  Mình vừa tổng hợp xong bộ đề của 5 năm gần nhất kèm lời giải chi tiết của thầy Tiến. Mọi người tham khảo nhé, chúc các bạn qua môn...
                </p>
                <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
                  <button className="flex items-center gap-2 transition-colors hover:text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                    128
                  </button>
                  <button className="flex items-center gap-2 transition-colors hover:text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    45
                  </button>
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    1.2k
                  </span>
                </div>
              </article>

              {/* Post 2 */}
              <article className="p-6 transition-shadow bg-white border border-slate-200 rounded-3xl hover:shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <img src="https://i.pravatar.cc/150?img=33" alt="Quốc Bảo" className="w-10 h-10 border rounded-full border-slate-100" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 rounded uppercase tracking-wider">Hỏi đáp</span>
                      <span className="text-sm text-slate-500">Đăng bởi <span className="font-bold text-slate-900">Quốc Bảo</span> • 5 giờ trước</span>
                    </div>
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">Lỗi kết nối cơ sở dữ liệu khi dùng Docker cho đồ án cơ sở?</h3>
                <p className="mb-4 leading-relaxed text-slate-600 line-clamp-2">
                  Có bạn nào rành về Docker không ạ? Mình đang setup con MySQL mà cứ bị lỗi "Connection refused" dù đã config port đầy đủ...
                </p>
                <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
                  <button className="flex items-center gap-2 transition-colors hover:text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                    32
                  </button>
                  <button className="flex items-center gap-2 transition-colors hover:text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    18
                  </button>
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    430
                  </span>
                </div>
              </article>
            </div>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="lg:col-span-1">
            <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-3xl sticky top-6">
              <h2 className="flex items-center mb-6 text-xl font-bold text-slate-900">
                <span className="flex items-center justify-center w-8 h-8 mr-3 bg-yellow-100 rounded-lg text-yellow-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011-1h8a1 1 0 011 1v2a3.001 3.001 0 01-2 2.83V9a1 1 0 01-1 1H8a1 1 0 01-1-1V6.83A3.001 3.001 0 015 4V2zm2 2v2a1 1 0 102 0V4H7zm4 0v2a1 1 0 102 0V4h-2z" clipRule="evenodd" />
                    <path d="M7 11a1 1 0 00-1 1v4a1 1 0 001 1h6a1 1 0 001-1v-4a1 1 0 00-1-1H7z" />
                  </svg>
                </span>
                Sinh viên tiêu biểu tuần
              </h2>

              <ul className="space-y-3 mb-6">
                {/* Top 1 */}
                <li className="flex items-center gap-4 p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="relative">
                    <img src="https://i.pravatar.cc/150?img=5" alt="Avatar" className="w-12 h-12 border-2 border-yellow-400 rounded-full" />
                    <div className="absolute flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-yellow-500 rounded-full -bottom-1 -right-1 ring-2 ring-white">1</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">Lê Thị Thanh</h4>
                    <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-bold text-white bg-slate-800 rounded">2,450 XP</span>
                  </div>
                </li>

                {/* Top 2 */}
                <li className="flex items-center gap-4 p-3 bg-transparent rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="relative">
                    <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-10 h-10 border-2 rounded-full border-slate-300" />
                    <div className="absolute flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-slate-400 rounded-full -bottom-1 -right-1 ring-2 ring-white">2</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-slate-900">Trần Văn Tú</h4>
                    <span className="inline-block px-1.5 py-0.5 mt-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 rounded">1,920 XP</span>
                  </div>
                </li>

                {/* Top 3 */}
                <li className="flex items-center gap-4 p-3 bg-transparent rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="relative">
                    <img src="https://i.pravatar.cc/150?img=9" alt="Avatar" className="w-10 h-10 border-2 border-amber-600 rounded-full" />
                    <div className="absolute flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-amber-600 rounded-full -bottom-1 -right-1 ring-2 ring-white">3</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-slate-900">Nguyễn Thu Hà</h4>
                    <span className="inline-block px-1.5 py-0.5 mt-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 rounded">1,850 XP</span>
                  </div>
                </li>
              </ul>
              
              <button className="w-full py-3 text-sm font-bold text-blue-600 transition-colors rounded-xl bg-blue-50 hover:bg-blue-100">
                Xem bảng xếp hạng
              </button>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="pt-16 pb-12 mt-12 border-t border-slate-200">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="mb-2 text-2xl font-extrabold text-slate-900">Nhóm học tập theo môn học</h2>
              <p className="text-slate-600">Tìm đồng đội cùng chinh phục các môn chuyên ngành</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center justify-center w-10 h-10 transition-colors bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:text-blue-600 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button className="flex items-center justify-center w-10 h-10 transition-colors bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:text-blue-600 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1 */}
            <div className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1">
              <div className="relative h-32">
                <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Web" className="object-cover w-full h-full" />
                <div className="absolute bottom-2 left-3 px-2 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold tracking-wider uppercase rounded">Công nghệ thông tin</div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h4 className="font-bold text-slate-900 mb-2">Lập trình Web Cơ bản</h4>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-6">
                  <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg> 1.2k</span>
                  <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg> 85 tài liệu</span>
                </div>
                <button className="w-full mt-auto py-2.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-colors rounded-xl">Tham gia</button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1">
              <div className="relative h-32">
                <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Kế toán" className="object-cover w-full h-full" />
                <div className="absolute bottom-2 left-3 px-2 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold tracking-wider uppercase rounded">Kế toán - Kiểm toán</div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h4 className="font-bold text-slate-900 mb-2">Nguyên lý Kế toán</h4>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-6">
                  <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg> 850</span>
                  <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg> 42 tài liệu</span>
                </div>
                <button className="w-full mt-auto py-2.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-colors rounded-xl">Tham gia</button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1">
              <div className="relative h-32">
                <img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Vật lý" className="object-cover w-full h-full" />
                <div className="absolute bottom-2 left-3 px-2 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold tracking-wider uppercase rounded">Khoa học cơ bản</div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h4 className="font-bold text-slate-900 mb-2">Vật lý Đại cương 1</h4>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-6">
                  <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg> 2.1k</span>
                  <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg> 120 tài liệu</span>
                </div>
                <button className="w-full mt-auto py-2.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-colors rounded-xl">Tham gia</button>
              </div>
            </div>

            {/* Card 4 */}
            <div className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1">
              <div className="relative h-32">
                <img src="https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Marketing" className="object-cover w-full h-full" />
                <div className="absolute bottom-2 left-3 px-2 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold tracking-wider uppercase rounded">Quản trị kinh doanh</div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h4 className="font-bold text-slate-900 mb-2">Marketing Căn bản</h4>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-6">
                  <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg> 1.5k</span>
                  <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg> 65 tài liệu</span>
                </div>
                <button className="w-full mt-auto py-2.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-colors rounded-xl">Tham gia</button>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 mt-12 bg-white border-t border-slate-200">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 text-center md:mb-0 md:text-left">
              <span className="font-bold text-slate-900">UniStudy</span>
              <p className="mt-1 text-xs text-slate-500">© 2024 UniStudy. Sapphire Logic Design System.</p>
            </div>
            <div className="flex gap-6 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-slate-900">Điều khoản</a>
              <a href="#" className="hover:text-slate-900">Bảo mật</a>
              <a href="#" className="hover:text-slate-900">Liên hệ</a>
              <a href="#" className="hover:text-slate-900">Trợ giúp</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CommunityPage;
