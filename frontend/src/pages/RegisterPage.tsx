import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { LogIn, UserPlus, GraduationCap, User } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'lecturer'>('student');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (tokenResponse: any) => {
    setIsLoading(true);
    setError('');
    try {
      await authService.loginGoogle(tokenResponse.access_token);
      const user = await authService.getCurrentUser();
      const role = user.role?.toLowerCase();
      if (role === 'student') navigate('/dashboard');
      else if (role === 'lecturer') navigate('/lecturer-dashboard');
      else if (role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Đăng ký Google thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Đăng ký Google thất bại'),
  });

  const handleFacebookResponse = async (response: any) => {
    if (response.accessToken) {
      setIsLoading(true);
      setError('');
      try {
        await authService.loginFacebook(response.accessToken);
        const user = await authService.getCurrentUser();
        const role = user.role?.toLowerCase();
        if (role === 'student') navigate('/dashboard');
        else if (role === 'lecturer') navigate('/lecturer-dashboard');
        else if (role === 'admin') navigate('/admin');
        else navigate('/');
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Đăng ký Facebook thất bại');
      } finally {
        setIsLoading(false);
      }
    } else if (response.status !== 'unknown') {
      setError('Đăng ký Facebook thất bại');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (!agreeTerms) {
      setError('Vui lòng đồng ý với điều khoản dịch vụ.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await authService.register({
        full_name: fullName,
        username: username,
        email: email,
        role: role.toUpperCase(),
        password: password,
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* Left Sidebar */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col h-screen sticky top-0 shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-slate-900 leading-tight">Nghiên cứu & Học tập</h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Cổng thông tin nghiên cứu</p>
            </div>
          </div>

          <nav className="space-y-2">
            <Link 
              to="/login"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <LogIn className="w-5 h-5 text-slate-400" />
              <span className="font-semibold text-sm">Đăng nhập</span>
            </Link>
            
            <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 transition-colors shadow-sm">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-sm">Đăng ký</span>
            </div>
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hỗ trợ hệ thống</h4>
             <p className="text-xs text-slate-500 font-medium leading-relaxed">
               Gặp khó khăn khi đăng ký? Liên hệ bộ phận kỹ thuật để được trợ giúp.
             </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        
        {/* Background glow effects */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Top Nav */}
        <header className="flex items-center justify-between px-10 py-6 relative z-10 border-b border-slate-100/50">
          <h2 className="text-sm font-bold text-slate-800">Nghiên cứu & Học tập</h2>
          <a href="#" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Hỗ trợ</a>
        </header>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 mb-3">Tạo tài khoản mới</h1>
            <p className="text-slate-500 font-medium">Tham gia cộng đồng nghiên cứu và học tập học thuật.</p>
          </div>

          <div className="w-full max-w-[540px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Tên đăng nhập</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-slate-400"
                    placeholder="nguyenvana"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-slate-400"
                    placeholder="example@iuh.edu.vn"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Mật khẩu</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Vai trò</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all border ${
                      role === 'student' 
                        ? 'bg-[#E5E7FF] border-[#E5E7FF] text-[#4F46E5]' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Sinh viên
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('lecturer')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all border ${
                      role === 'lecturer' 
                        ? 'bg-[#E5E7FF] border-[#E5E7FF] text-[#4F46E5]' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                    Giảng viên
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#4F46E5] focus:ring-[#4F46E5]/20 cursor-pointer"
                />
                <label htmlFor="agree" className="text-sm font-medium text-slate-600 cursor-pointer">
                  Tôi đồng ý với <a href="#" className="text-[#4F46E5] font-bold hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-[#4F46E5] font-bold hover:underline">Chính sách bảo mật</a>.
                </label>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-500 text-sm font-semibold rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold rounded-xl shadow-lg shadow-[#4F46E5]/20 transition-all active:scale-[0.99] disabled:opacity-50 mt-4"
              >
                {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>

              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-x-0 h-px bg-slate-200"></div>
                <span className="relative px-4 text-xs font-bold tracking-widest text-slate-400 uppercase bg-white">Hoặc</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  className="flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-colors bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  Google
                </button>
                <FacebookLogin
                  appId={process.env.REACT_APP_FACEBOOK_APP_ID || "123456789"}
                  fields="name,email,picture"
                  scope="public_profile,email"
                  callback={handleFacebookResponse}
                  render={(renderProps: any) => (
                    <button
                      type="button"
                      onClick={renderProps.onClick}
                      className="flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-colors bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50"
                    >
                      <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
                      Facebook
                    </button>
                  )}
                />
              </div>

              <div className="pt-6 border-t border-slate-100 text-center mt-6">
                <span className="text-sm font-medium text-slate-500">
                  Đã có tài khoản?{' '}
                  <Link to="/login" className="font-bold text-[#4F46E5] hover:underline">Đăng nhập</Link>
                </span>
              </div>
            </form>
          </div>
          
          <div className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest relative z-10">
            © 2026 Research And Study - IUH
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
