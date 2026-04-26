import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'lecturer'>('student');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(''); // student_code or lecturer_code
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        role: role,
        [role === 'student' ? 'student_code' : 'lecturer_code']: code,
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
    <div className="relative min-h-screen overflow-hidden bg-[#0F172A] font-sans text-slate-200">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] -translate-x-1/3 translate-y-1/3"></div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side: Info */}
        <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-20 bg-slate-900/40 backdrop-blur-md border-r border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.754 18 18.168 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">UniStudy</span>
            </div>

            <h2 className="text-4xl font-bold mb-6">Tham gia cùng<br /><span className="text-indigo-400">Cộng đồng Tri thức</span></h2>
            
            <div className="space-y-8 mt-12">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 text-indigo-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-white">Tài liệu không giới hạn</h4>
                  <p className="text-slate-400 text-sm">Truy cập hàng ngàn giáo trình, bài giảng và đề thi mẫu.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 text-purple-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-white">Học tập với AI</h4>
                  <p className="text-slate-400 text-sm">Tóm tắt tài liệu và tạo mindmap tự động chỉ trong vài giây.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-500">
            &copy; 2024 UniStudy Platform. Built for IUH Students.
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-3/5 flex justify-center items-center p-6 lg:p-12 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 lg:p-12 rounded-3xl shadow-2xl"
          >
            <div className="mb-10">
              <h3 className="text-3xl font-bold text-white mb-2">Tạo tài khoản mới</h3>
              <p className="text-slate-400">Bắt đầu hành trình học tập thông minh ngay hôm nay.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="p-1 bg-slate-800 rounded-xl flex gap-1">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'student' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Sinh viên
                </button>
                <button
                  type="button"
                  onClick={() => setRole('lecturer')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'lecturer' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Giảng viên
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">HỌ VÀ TÊN</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">TÊN ĐĂNG NHẬP</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="nguyenvana"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">EMAIL</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="a@student.iuh.edu.vn"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">{role === 'student' ? 'MÃ SỐ SINH VIÊN' : 'MÃ GIẢNG VIÊN'}</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder={role === 'student' ? '2021xxxx' : 'GVxxxx'}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">MẬT KHẨU</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">XÁC NHẬN MẬT KHẨU</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 ml-1">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500/20"
                />
                <label htmlFor="agree" className="text-sm text-slate-400">
                  Tôi đồng ý với <a href="#" className="text-indigo-400 hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-indigo-400 hover:underline">Chính sách bảo mật</a>
                </label>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-xl shadow-indigo-600/10 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
              </button>
            </form>

            <div className="mt-8 text-center text-slate-500">
              Đã có tài khoản?
              <Link to="/login" className="ml-2 font-bold text-white hover:text-indigo-400 transition-colors">Đăng nhập</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
