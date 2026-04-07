import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DocumentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data for document cards
  const documents = [
    {
      id: 1,
      type: 'PDF',
      category: 'CNTT',
      size: '1.2 MB',
      title: 'Cấu trúc dữ liệu và Giải thuật - Đề thi cuối kỳ 2023',
      author: 'Nguyễn Văn A',
      avatar: 'https://i.pravatar.cc/150?img=11',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      type: 'DOCX',
      category: 'TOÁN HỌC',
      size: '450 KB',
      title: 'Giáo trình Toán Cao Cấp A1 - IUH (Full bài giải)',
      author: 'Lê Thị B',
      avatar: 'https://i.pravatar.cc/150?img=5',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      type: 'PDF',
      category: 'KINH TẾ',
      size: '3.5 MB',
      title: 'Tiểu luận Marketing Căn Bản: Phân tích Vinamilk 2024',
      author: 'Trần Minh C',
      avatar: 'https://i.pravatar.cc/150?img=12',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    }
  ];

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
              <Link to="/tai-lieu" className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600">Tài liệu</Link>
              <Link to="/cong-dong" className="text-sm font-semibold text-gray-500 transition-colors hover:text-blue-600">Cộng đồng</Link>
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

      {/* Hero Search Section */}
      <section className="pt-16 pb-12 text-center">
        <div className="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Thư viện tài liệu học thuật IUH
          </h1>
          <p className="max-w-2xl mx-auto mb-10 text-lg text-slate-600">
            Khám phá hàng ngàn đề thi, bài giảng và tài liệu chuyên ngành được chia sẻ bởi cộng đồng sinh viên Đại học Công nghiệp TP.HCM.
          </p>
          
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="w-full py-5 pl-14 pr-6 text-lg transition-shadow bg-white border border-slate-200 rounded-full shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:shadow-md"
              placeholder="Tìm kiếm tài liệu, môn học, mã học phần..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative">
          <div className="flex flex-col gap-8 md:flex-row">
            
            {/* Left Sidebar - Filters */}
            <div className="w-full md:w-64 shrink-0">
              <div className="bg-white border rounded-2xl border-slate-100 p-6 shadow-sm sticky top-6">
                
                {/* Bộ lọc môn học */}
                <div className="flex items-center gap-3 mb-6">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  <h3 className="font-bold text-slate-900">Bộ lọc môn học</h3>
                </div>
                
                <ul className="mb-8 space-y-1">
                  <li>
                    <button className="w-full px-4 py-2.5 text-left text-sm font-semibold text-blue-700 bg-blue-50 rounded-xl">
                      Tất cả tài liệu
                    </button>
                  </li>
                  <li>
                    <button className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors rounded-xl hover:bg-slate-50 hover:text-slate-900">
                      Công nghệ thông tin
                    </button>
                  </li>
                  <li>
                    <button className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors rounded-xl hover:bg-slate-50 hover:text-slate-900">
                      Toán học & Thống kê
                    </button>
                  </li>
                  <li>
                    <button className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors rounded-xl hover:bg-slate-50 hover:text-slate-900">
                      Kinh tế & Quản trị
                    </button>
                  </li>
                  <li>
                    <button className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors rounded-xl hover:bg-slate-50 hover:text-slate-900">
                      Cơ khí - Ô tô
                    </button>
                  </li>
                  <li>
                    <button className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors rounded-xl hover:bg-slate-50 hover:text-slate-900">
                      Ngoại ngữ
                    </button>
                  </li>
                </ul>

                <hr className="mb-8 border-slate-100" />

                {/* Phân loại tài liệu */}
                <h3 className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">LOẠI TÀI LIỆU</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 border-2 rounded bg-white border-slate-300 group-hover:border-blue-500">
                      <input type="checkbox" className="absolute opacity-0 w-full h-full cursor-pointer" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 select-none">Đề thi / Kiểm tra</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 border-2 rounded bg-white border-slate-300 group-hover:border-blue-500">
                      <input type="checkbox" className="absolute opacity-0 w-full h-full cursor-pointer" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 select-none">Giáo trình / Slide</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 border-2 rounded bg-white border-slate-300 group-hover:border-blue-500">
                      <input type="checkbox" className="absolute opacity-0 w-full h-full cursor-pointer" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 select-none">Bài tập lớn (Report)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-600">
                  Hiển thị <span className="font-bold text-slate-900">1,248</span> tài liệu
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <span className="uppercase tracking-widest text-[11px] font-bold">SẮP XẾP:</span>
                  <button className="flex items-center gap-1 font-bold text-blue-600">
                    Mới nhất
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
              </div>

              {/* Grid of Documents */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex flex-col overflow-hidden transition-all bg-white border cursor-pointer border-slate-100 rounded-2xl hover:shadow-lg hover:-translate-y-1">
                    {/* Image Area */}
                    <div className="relative h-40 bg-slate-100">
                      <img src={doc.image} alt={doc.title} className="object-cover w-full h-full" />
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-white/90 backdrop-blur-sm rounded shadow-sm">
                        <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                        {doc.type}
                      </div>
                    </div>
                    {/* Content Area */}
                    <div className="flex flex-col flex-1 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded uppercase tracking-wider">{doc.category}</span>
                        <span className="text-xs font-medium text-slate-400">• {doc.size}</span>
                      </div>
                      <h4 className="mb-4 font-bold leading-snug line-clamp-2 text-slate-900 group-hover:text-blue-600">
                        {doc.title}
                      </h4>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          <img src={doc.avatar} alt={doc.author} className="w-6 h-6 rounded-full border border-slate-200" />
                          <span className="text-xs font-medium text-slate-600">{doc.author}</span>
                        </div>
                        <svg className="w-5 h-5 text-slate-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Login Overlay (Paywall effect) */}
              <div className="mt-6 relative">
                 {/* Faded dummy cards */}
                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 opacity-30 pointer-events-none filter blur-[2px]">
                    <div className="h-64 bg-slate-200 rounded-2xl w-full"></div>
                    <div className="h-64 bg-slate-200 rounded-2xl w-full hidden sm:block"></div>
                    <div className="h-64 bg-slate-200 rounded-2xl w-full hidden lg:block"></div>
                 </div>
                 
                 {/* The Wall Modal */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                    <div className="w-full max-w-lg p-10 text-center bg-white border shadow-2xl rounded-3xl border-slate-100 shadow-blue-900/5">
                       <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-blue-50 rounded-2xl">
                          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                             <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                       </div>
                       <h3 className="mb-4 text-2xl font-extrabold text-slate-900">Mở khóa toàn bộ thư viện</h3>
                       <p className="mb-8 text-slate-600">
                         Bạn đã xem hết các tài liệu công khai. Đăng nhập với email sinh viên IUH để truy cập không giới hạn hơn 50.000+ tài liệu chuyên sâu khác.
                       </p>
                       <div className="flex items-center justify-center gap-4">
                          <Link to="/login" className="px-6 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                            Đăng nhập ngay
                          </Link>
                          <Link to="/pricing" className="px-6 py-3 font-semibold text-slate-700 transition-colors bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                            Tìm hiểu thêm
                          </Link>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
          
          {/* Floating Action Button */}
          <button className="fixed flex items-center justify-center w-14 h-14 text-white transition-transform bg-blue-600 rounded-full shadow-xl bottom-8 right-8 hover:bg-blue-700 hover:scale-110 shadow-blue-600/30">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-slate-200">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 md:mb-0 text-center md:text-left">
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

export default DocumentsPage;
