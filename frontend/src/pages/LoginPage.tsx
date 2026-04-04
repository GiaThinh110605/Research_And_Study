import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="overflow-hidden bg-white shadow-2xl rounded-2xl">
            <div className="flex flex-col lg:flex-row">
              {/* Left Side - Branding */}
              <div className="lg:w-1/2 bg-[#9fa6b7] p-12 flex flex-col justify-between">
                {/* Logo and Title */}
                <div>
                  <div className="mb-6 text-3xl font-bold text-white">UniStudy</div>
                  <h1 className="mb-4 text-2xl font-semibold text-white">
                    Nền tảng học tập thông minh cho sinh viên
                  </h1>
                  <p className="mb-8 leading-relaxed text-blue-100">
                    Quản lý điểm số, tài liệu học tập và thảo luận cùng cộng đồng sinh viên IUH một cách hiệu quả.
                  </p>
                </div>

                {/* Stats Section */}
                <div>
                  <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm">
                    <div className="flex items-center mb-4">
                      {/* Profile Icons */}
                      <div className="flex -space-x-2">
                        <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-blue-400 rounded-full">SV</div>
                        <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-blue-500 rounded-full">IT</div>
                        <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-blue-600 rounded-full">CK</div>
                        <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-blue-700 rounded-full">+5k</div>
                      </div>
                    </div>
                    <div className="mb-2 text-white">
                      <span className="text-3xl font-bold">HƠN 5,000+</span>
                    </div>
                    <div className="mb-4 text-blue-100">SINH VIÊN THAM GIA</div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="mb-1 text-sm text-white">TIẾN ĐỘ CỘNG ĐỒNG</div>
                      <div className="w-full h-2 rounded-full bg-white/20">
                        <div className="h-2 bg-white rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className="text-sm text-blue-100">MỤC TIÊU 2024</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="flex flex-col justify-center p-12 lg:w-1/2">
                <div className="w-full max-w-md mx-auto">
                  {/* Login Form Header */}
                  <div className="mb-8 text-center">
                    <h2 className="mb-2 text-3xl font-bold text-gray-900">Chào mừng trở lại</h2>
                    <p className="text-gray-600">Nhập thông tin của bạn để tiếp tục hành trình học tập.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                        EMAIL
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="example@student.iuh.edu.vn"
                          className="w-full py-3 pl-10 pr-4 transition border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                        MẬT KHẨU
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full py-3 pl-10 pr-12 transition border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <button type="button" className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Forgot Password */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input id="remember" type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <label htmlFor="remember" className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</label>
                      </div>
                      <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        Quên mật khẩu?
                      </a>
                    </div>

                    {/* Login Button */}
                    <button
                      type="submit"
                      className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Đăng nhập
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </form>

                  {/* Social Login */}
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 text-gray-500 bg-white">HOẶC ĐĂNG NHẬP VỚI</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                      {/* Google Login */}
                      <button className="flex items-center justify-center w-full px-4 py-2 transition bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-gray-700">Google</span>
                      </button>

                      {/* Facebook Login */}
                      <button className="flex items-center justify-center w-full px-4 py-2 transition bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span className="text-gray-700">Facebook</span>
                      </button>
                    </div>
                  </div>

                  {/* Register Link */}
                  <div className="mt-8 text-center">
                    <span className="text-gray-600">Chưa có tài khoản? </span>
                    <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
                      Đăng ký ngay
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 py-6 text-sm text-center text-gray-300">
        2024 UNISTUDY - NỀN TẢNG HỖ TRỢ HỌC TẬP IUH
      </div>
    </div>
  );
};

export default LoginPage;
