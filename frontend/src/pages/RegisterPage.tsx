import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [studentIdError, setStudentIdError] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateStudentId = (value: string) => {
    if (value && !/^\d{8}$/.test(value)) {
      setStudentIdError('Mã số sinh viên phải có đúng 8 chữ số');
    } else {
      setStudentIdError('');
    }
  };

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setStudentId(value);
      if (errors.studentId) setErrors({...errors, studentId: ''});
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Họ tên ít nhất có 2 chữ
    if (fullName.trim().split(/\s+/).length < 2) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 2 chữ';
    }
    
    // Email phải có @
    if (!email.includes('@')) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    // Mã số sinh viên bắt buộc 8 chữ số
    if (!/^\d{8}$/.test(studentId)) {
      newErrors.studentId = 'Mã số sinh viên phải có đúng 8 chữ số';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!agreeTerms) {
      setError('Vui lòng đồng ý với các điều khoản.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await authService.register({
        full_name: fullName,
        email: email,
        student_id: studentId,
        password: password,
        role: 'student'
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="overflow-hidden bg-white shadow-2xl rounded-2xl">
            <div className="flex flex-col lg:flex-row">
              {/* Left Side - Branding */}
              <div className="flex flex-col justify-between p-12 bg-gray-200 lg:w-1/2">
                {/* Logo and Title */}
                <div>
                  <div className="mb-6 text-3xl font-bold text-gray-800">UniStudy</div>
                  <h1 className="mb-4 text-2xl font-semibold text-gray-800">
                    Kiến tạo tương lai học thuật của bạn.
                  </h1>
                  <p className="mb-8 leading-relaxed text-gray-600">
                    Nền tảng học tập thông minh giúp sinh viên quản lý tài liệu, theo dõi điểm số và kết nối cộng đồng hiệu quả.
                  </p>
                </div>

                {/* Testimonial Section */}
                <div>
                  <div className="p-6 bg-white rounded-lg shadow-md">
                    <div className="flex items-center mb-4">
                      {/* Profile Icons */}
                      <div className="flex -space-x-2">
                        <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-gray-400 rounded-full">NV</div>
                        <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-gray-500 rounded-full">TH</div>
                        <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-gray-600 rounded-full">PK</div>
                      </div>
                    </div>
                    <div className="mb-2 text-gray-700">
                      <span className="text-lg font-semibold">Hơn 5,000+ sinh viên tham gia</span>
                    </div>
                    <div className="text-sm italic text-gray-500">
                      "UniStudy giúp mình quản lý bài tập và ôn thi hiệu quả hơn gấp 2 lần so với cách truyền thống."
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Registration Form */}
              <div className="flex flex-col justify-center p-12 lg:w-1/2">
                <div className="w-full max-w-md mx-auto">
                  {/* Registration Form Header */}
                  <div className="mb-8 text-center">
                    <h2 className="mb-2 text-3xl font-bold text-gray-900">Bắt đầu hành trình</h2>
                    <p className="text-gray-600">Vui lòng điền thông tin để tạo tài khoản mới.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name Field */}
                    <div>
                      <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-gray-700">
                        HỌ VÀ TÊN
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (errors.fullName) setErrors({...errors, fullName: ''});
                          }}
                          placeholder="Nguyễn Văn A"
                          className={`w-full py-3 pl-10 pr-4 transition border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                        />
                      </div>
                      {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                    </div>

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
                          onChange={(e) => {
                             setEmail(e.target.value);
                             if (errors.email) setErrors({...errors, email: ''});
                          }}
                          placeholder="example@student.iuh.edu.vn"
                          className={`w-full py-3 pl-10 pr-4 transition border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    {/* Student ID Field */}
                    <div>
                      <label htmlFor="studentId" className="block mb-2 text-sm font-medium text-gray-700">
                        MÃ SỐ SINH VIÊN (MSSV)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                        </div>
                        <input
                          id="studentId"
                          name="studentId"
                          type="text"
                          required
                          value={studentId}
                          onChange={handleStudentIdChange}
                          placeholder="20211234"
                          maxLength={8}
                          className={`w-full py-3 pl-10 pr-4 transition border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.studentId ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                      </div>
                      {errors.studentId && (
                        <p className="mt-1 text-sm text-red-500">{errors.studentId}</p>
                      )}
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
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full py-3 pl-10 pr-12 transition border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start">
                      <input
                        id="agreeTerms"
                        type="checkbox"
                        required
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="agreeTerms" className="ml-3 text-sm text-gray-600">
                        Tôi đồng ý với các <a href="#" className="text-blue-600 hover:text-blue-700">điều khoản dịch vụ</a> và <a href="#" className="text-blue-600 hover:text-blue-700">chính sách bảo mật</a> của UniStudy.
                      </label>
                    </div>

                    {error && (
                      <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                        {error}
                      </div>
                    )}

                    {/* Register Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </form>

                  {/* Login Link */}
                  <div className="mt-8 text-center">
                    <span className="text-gray-600">Bạn đã có tài khoản? </span>
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                      Đăng nhập ngay
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
