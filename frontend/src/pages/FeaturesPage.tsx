import React from 'react';
import { Link } from 'react-router-dom';

const FeaturesPage: React.FC = () => {
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
              <Link to="/tinh-nang" className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600">Tính năng</Link>
              <Link to="/tai-lieu" className="text-sm font-semibold text-gray-500 transition-colors hover:text-blue-600">Tài liệu</Link>
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

      {/* Hero Header */}
      <section className="pt-20 pb-16 text-center">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-wider text-blue-600 uppercase bg-blue-100 rounded-full">
            AI ACADEMIC INTELLIGENCE
          </div>
          <h1 className="max-w-4xl mx-auto mb-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Hệ sinh thái học tập thông minh <br className="hidden sm:block" /> bậc nhất cho sinh viên
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600">
            Sử dụng trí tuệ nhân tạo để tối ưu hóa việc tiếp thu kiến thức. Học nhanh hơn, nhớ lâu hơn và đạt kết quả cao hơn.
          </p>
        </div>
      </section>

      {/* Grid Features */}
      <section className="pb-24">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          
          {/* Row 1 */}
          <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
            {/* Tóm tắt tài liệu */}
            <div className="flex flex-col overflow-hidden bg-white shadow-sm lg:col-span-2 rounded-3xl ring-1 ring-slate-100">
              <div className="p-10 pb-0">
                <div className="inline-flex items-center justify-center p-3 mb-6 bg-blue-50 rounded-2xl text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-slate-900">Tóm tắt tài liệu bằng AI</h3>
                <p className="mb-8 text-slate-600 max-w-md">
                  Chuyển đổi giáo trình hàng trăm trang thành các ý chính ngắn gọn trong 30 giây. Hỗ trợ PDF, hình ảnh và video bài giảng.
                </p>
              </div>
              <div className="mt-auto px-10 pt-4 bg-gradient-to-t from-white w-full h-[280px] relative overflow-hidden flex items-end justify-center">
                <div className="w-[85%] h-[240px] bg-white rounded-t-xl shadow-[0_0_40px_rgba(0,0,0,0.1)] border border-slate-200 text-left p-4 relative overflow-hidden">
                   {/* Mock UI text inside image */}
                   <div className="w-1/2 h-4 mb-3 bg-slate-200 rounded animate-pulse"></div>
                   <div className="w-full h-3 mb-2 bg-slate-100 rounded"></div>
                   <div className="w-5/6 h-3 mb-2 bg-slate-100 rounded"></div>
                   <div className="w-4/6 h-3 mb-6 bg-slate-100 rounded"></div>
                   
                   <div className="w-1/3 h-4 mb-3 bg-blue-100 rounded"></div>
                   <div className="w-full h-3 mb-2 bg-slate-100 rounded"></div>
                   <div className="w-11/12 h-3 bg-slate-100 rounded"></div>
                </div>
              </div>
            </div>

            {/* Mindmap & Flashcard */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              {/* Sơ đồ tư duy */}
              <div className="flex-1 p-10 relative overflow-hidden bg-[#2D3B4E] rounded-3xl shadow-sm text-white flex flex-col justify-center">
                <div className="absolute opacity-10 -bottom-4 -right-4">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 11V7h2v4h4v2h-4v4h-2v-4H7v-2h4z" />
                  </svg>
                </div>
                <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-white/10 text-white w-max">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl font-bold">Sơ đồ tư duy</h3>
                <p className="text-white/70">
                  Tự động vẽ sơ đồ quan hệ giữa các khái niệm từ bài học.
                </p>
              </div>

              {/* Flashcard AI */}
              <div className="flex-1 p-10 bg-white shadow-sm rounded-3xl ring-1 ring-slate-100 flex flex-col justify-center">
                <div className="inline-flex items-center justify-center p-3 mb-6 bg-blue-50 rounded-2xl text-blue-600 w-max">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl font-bold text-slate-900">Flashcard AI</h3>
                <p className="mb-6 text-slate-600">
                  Tạo bộ thẻ ghi nhớ thông minh từ ghi chú của bạn để ôn tập Spaced Repetition.
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 rounded-md">QUICK LEARN</span>
                  <span className="px-3 py-1 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-md">AI GEN</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: GPA */}
          <div className="grid items-center grid-cols-1 gap-12 p-10 mb-6 bg-white shadow-sm rounded-3xl ring-1 ring-slate-100 lg:grid-cols-2">
            {/* Fake UI GPA card */}
            <div className="order-2 lg:order-1 flex justify-center py-6">
              <div className="w-full max-w-sm bg-white border shadow-2xl rounded-2xl border-slate-100 shadow-blue-900/5 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-bold text-slate-900">Học kỳ 1 - Năm 2</h4>
                  <span className="font-bold text-blue-600">GPA: 3.85</span>
                </div>
                
                <div className="space-y-3 mb-8">
                   <div className="flex items-center p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-center w-10 h-10 font-bold text-blue-700 bg-blue-100 rounded-lg">A</div>
                      <div className="ml-4">
                        <div className="font-bold text-sm text-slate-900">Toán Kinh Tế</div>
                        <div className="text-xs text-slate-500">3 TÍN CHỈ</div>
                      </div>
                      <div className="ml-auto font-semibold text-slate-700">4.0</div>
                   </div>
                   <div className="flex items-center p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-center w-10 h-10 font-bold text-blue-700 bg-blue-100 rounded-lg">A-</div>
                      <div className="ml-4">
                        <div className="font-bold text-sm text-slate-900">Kinh Tế Vĩ Mô</div>
                        <div className="text-xs text-slate-500">3 TÍN CHỈ</div>
                      </div>
                      <div className="ml-auto font-semibold text-slate-700">3.7</div>
                   </div>
                </div>

                <div className="flex justify-center">
                  <div className="relative w-28 h-28">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="#E2E8F0" strokeWidth="4" fill="none" />
                      <path strokeDasharray="92, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="#2563EB" strokeWidth="4" fill="none" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-slate-900">92%</span>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Mục tiêu</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* GPA Text content */}
            <div className="order-1 lg:order-2">
              <h2 className="mb-6 text-3xl font-extrabold text-slate-900">Tính toán GPA & Lộ trình học tập cá nhân</h2>
              <p className="mb-8 text-lg text-slate-600">
                Không còn lo lắng về bảng điểm. UniStudy giúp bạn theo dõi điểm số từng môn học, tự động tính GPA theo hệ 4 và hệ 10, đồng thời dự báo điểm cần đạt để đạt mục tiêu Học bổng.
              </p>
              <ul className="mb-10 space-y-4">
                <li className="flex items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="ml-3 text-slate-700">Nhập điểm nhanh chóng, hỗ trợ import từ file Excel của trường.</span>
                </li>
                <li className="flex items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="ml-3 text-slate-700">Lập kế hoạch "Học bù" hoặc "Học cải thiện" thông minh.</span>
                </li>
                <li className="flex items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="ml-3 text-slate-700">Biểu đồ trực quan hóa tiến trình qua từng kỳ học.</span>
                </li>
              </ul>
              <button className="px-6 py-3 font-semibold text-blue-600 transition-colors bg-white border-2 border-blue-600 rounded-lg shadow-sm hover:bg-blue-50">
                Thử tính GPA ngay
              </button>
            </div>
          </div>

          {/* Row 3: Quizz & Tests */}
          <div className="p-10 mb-12 bg-white shadow-sm rounded-3xl ring-1 ring-slate-100">
            <div className="flex flex-col items-start justify-between mb-8 sm:flex-row sm:items-center">
              <div>
                <h2 className="mb-2 text-2xl font-extrabold text-slate-900">Luyện thi & Kiểm tra năng lực</h2>
                <p className="text-slate-600">Thư viện hơn 500+ đề thi TOEIC, IELTS và các môn đại cương (Toán cao cấp, Pháp luật đại cương,...) sát với đề thi thực tế.</p>
              </div>
              <Link to="/tai-lieu" className="flex items-center mt-4 text-sm font-semibold text-blue-600 sm:mt-0 hover:text-blue-700 w-max">
                Xem tất cả đề thi
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* TOEIC Card */}
              <div className="flex flex-col p-6 transition-shadow border-2 bg-slate-50 border-blue-500/20 rounded-2xl hover:shadow-md h-full">
                <div className="flex items-start justify-between mb-6">
                   <div className="flex items-center gap-4">
                     <div className="flex items-center justify-center w-12 h-12 text-white bg-blue-600 shadow-inner rounded-xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg></div>
                     <div>
                       <h4 className="font-bold text-slate-900">Luyện thi TOEIC</h4>
                       <p className="text-xs font-semibold text-slate-500">FULL TEST 2024</p>
                     </div>
                   </div>
                   <span className="px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded">MỚI CẬP NHẬT</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                    <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Listening</p>
                    <p className="font-bold text-slate-800">100 Câu</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                    <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reading</p>
                    <p className="font-bold text-slate-800">100 Câu</p>
                  </div>
                </div>
                <button className="w-full py-3 mt-auto font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                  Bắt đầu thi thử
                </button>
              </div>

              {/* Toan cao cap */}
              <div className="p-6 transition-shadow bg-white border border-slate-200 rounded-2xl hover:shadow-md flex flex-col">
                <div className="flex items-center justify-center w-10 h-10 mb-4 bg-blue-50 text-blue-600 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <h4 className="mb-1 font-bold text-slate-900">Toán cao cấp A1</h4>
                <p className="mb-6 text-xs text-slate-500">15 Đề thi | 2.5k Lượt thi</p>
                <div className="mt-auto">
                   <div className="flex justify-between text-sm mb-2">
                     <span className="font-bold text-slate-800">2.5/4.0</span>
                     <span className="text-xs text-slate-400 font-medium">Độ khó</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                     <div className="w-[62%] h-full bg-amber-400 rounded-full"></div>
                   </div>
                </div>
              </div>

              {/* Phap luat */}
              <div className="p-6 transition-shadow bg-white border border-slate-200 rounded-2xl hover:shadow-md flex flex-col">
                <div className="flex items-center justify-center w-10 h-10 mb-4 bg-blue-50 text-blue-600 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                </div>
                <h4 className="mb-1 font-bold text-slate-900">Pháp luật ĐC</h4>
                <p className="mb-6 text-xs text-slate-500">10 Đề thi | 1.8k Lượt thi</p>
                <div className="mt-auto">
                   <div className="flex justify-between text-sm mb-2">
                     <span className="font-bold text-slate-800">1.5/4.0</span>
                     <span className="text-xs text-slate-400 font-medium">Độ khó</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                     <div className="w-[37%] h-full bg-emerald-400 rounded-full"></div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="relative overflow-hidden bg-blue-600 shadow-xl rounded-3xl shadow-blue-600/20">
            <div className="absolute inset-0">
               <svg className="absolute w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <path d="M0,0 Q50,100 100,0 V100 H0 Z" fill="currentColor"/>
               </svg>
            </div>
            <div className="relative px-6 py-16 text-center sm:px-12 sm:py-20 lg:px-16">
              <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
                Sẵn sàng nâng cao hiệu suất học tập?
              </h2>
              <p className="max-w-2xl mx-auto mb-10 text-lg text-blue-100">
                Bắt đầu miễn phí ngay hôm nay và trải nghiệm sức mạnh của AI trong học tập.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link to="/register" className="w-full px-8 py-3.5 text-base font-bold text-blue-600 bg-white shadow-md rounded-xl sm:w-auto hover:bg-slate-50 hover:shadow-lg transition-all">
                  Bắt đầu ngay miễn phí
                </Link>
                <Link to="/pricing" className="w-full px-8 py-3.5 text-base font-bold text-white transition-colors border-2 sm:w-auto rounded-xl border-blue-400 backdrop-blur-sm bg-blue-500/20 hover:bg-blue-500/40">
                  Tìm hiểu bản Pro
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-slate-100">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <span className="font-bold text-slate-900">UniStudy</span>
              <p className="mt-1 text-xs text-slate-500">© 2024 UniStudy. Sapphire Logic Design System.</p>
            </div>
            <div className="flex gap-6 text-sm font-medium text-slate-500">
              <Link to="/" className="hover:text-slate-900">Điều khoản</Link>
              <Link to="/" className="hover:text-slate-900">Bảo mật</Link>
              <Link to="/" className="hover:text-slate-900">Liên hệ</Link>
              <Link to="/" className="hover:text-slate-900">Trợ giúp</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesPage;
