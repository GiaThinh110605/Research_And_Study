import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { LogIn, UserPlus, GraduationCap, User } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authService.login(usernameOrEmail, password);
      const user = await authService.getCurrentUser();
      const role = user.role?.toLowerCase();
      if (role === 'student') {
        navigate('/dashboard');
      } else if (role === 'lecturer') {
        navigate('/lecturer-dashboard');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Đăng nhập thất bại. Kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-slate-50">

      {/* Left Sidebar */}
      <aside className="sticky top-0 flex-col hidden h-screen bg-white border-r md:flex w-72 border-slate-200 shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-blue-500/20">
              <GraduationCap className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-slate-900 leading-tight">Nghiên cứu & Học tập</h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Cổng thông tin nghiên cứu</p>
            </div>
          </div>

          <nav className="space-y-2">
            <div className="flex items-center w-full gap-3 px-4 py-3 text-blue-700 transition-colors shadow-sm rounded-xl bg-blue-50">
              <LogIn className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-bold">Đăng nhập</span>
            </div>

            <Link
              to="/register"
              className="flex items-center w-full gap-3 px-4 py-3 transition-colors rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            >
              <UserPlus className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-semibold">Đăng ký</span>
            </Link>
          </nav>
        </div>

        <div className="p-6 mt-auto">
          <div className="p-5 border bg-slate-50 border-slate-100 rounded-2xl">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hỗ trợ hệ thống</h4>
            <p className="text-xs font-medium leading-relaxed text-slate-500">
              Gặp khó khăn khi đăng nhập? Liên hệ bộ phận kỹ thuật để được trợ giúp.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex flex-col flex-1 overflow-hidden bg-white">

        {/* Background glow effects */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Top Nav */}
        <header className="relative z-10 flex items-center justify-between px-10 py-6 border-b border-slate-100/50">
          <h2 className="text-sm font-bold text-slate-800">Nghiên cứu & Học tập</h2>
          <a href="#" className="text-sm font-bold transition-colors text-slate-500 hover:text-slate-800">Hỗ trợ</a>
        </header>

        {/* Form Container */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-6">
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-3xl font-black text-slate-900">Đăng nhập</h1>
            <p className="font-medium text-slate-500">Chào mừng bạn quay trở lại với cộng đồng học tập.</p>
          </div>

          <div className="w-full max-w-[540px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-10">
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Tên đăng nhập hoặc Email</label>
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-medium transition-all bg-white border outline-none border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder:text-slate-400"
                  placeholder="yourname@iuh.edu.vn"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Mật khẩu</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-medium transition-all bg-white border outline-none border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#4F46E5] focus:ring-[#4F46E5]/20 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-600">Ghi nhớ đăng nhập</span>
                </label>
                <a href="#" className="text-sm font-bold text-[#4F46E5] hover:underline">Quên mật khẩu?</a>
              </div>

              {error && (
                <div className="p-3 text-sm font-semibold text-center text-red-500 border border-red-100 bg-red-50 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold rounded-xl shadow-lg shadow-[#4F46E5]/20 transition-all active:scale-[0.99] disabled:opacity-50 mt-4"
              >
                {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>

              <div className="pt-6 text-center border-t border-slate-100">
                <span className="text-sm font-medium text-slate-500">
                  Chưa có tài khoản?{' '}
                  <Link to="/register" className="font-bold text-[#4F46E5] hover:underline">Đăng ký</Link>
                </span>
              </div>
            </form>
          </div>

          <div className="relative z-10 mt-8 text-xs font-bold tracking-widest uppercase text-slate-400">
            2026 Research And Study - IUH
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
