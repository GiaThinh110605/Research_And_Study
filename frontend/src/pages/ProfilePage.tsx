import React, { useState, useRef } from 'react';
import { validateName, validateEmail, validatePhone } from '../utils/validation';
import api from '../services/api';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'activity' | 'security'>('info');
  const [userName, setUserName] = useState('Đang tải...');
  const [userRole, setUserRole] = useState('Sinh viên');

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const [profileData, setProfileData] = useState({
    name: 'Đang tải...',
    email: 'Đang tải...',
    phone: '',
    major: ''
  });

  // Avatar Upload State
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Activities State
  const [activities, setActivities] = useState<any[]>([]);

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const { authService } = await import('../services/auth');
        
        const me = await authService.getCurrentUser();
        const name = me.full_name || me.username || 'Người dùng';
        
        setUserName(name);
        setUserRole(me.role === 'admin' ? 'Quản trị viên' : (me.role === 'lecturer' ? 'Giảng viên' : 'Sinh viên'));
        
        setProfileData(prev => ({
          ...prev,
          name: name,
          email: me.email || ''
        }));

        const storedAvatar = localStorage.getItem('user_avatar');
        setAvatarUrl(storedAvatar || me.avatar_url || '');

        try {
          const actRes = await api.get('/api/v1/activities/me/activities');
          setActivities(actRes.data);
        } catch (actErr) {
          console.error('Lỗi tải hoạt động', actErr);
        }

      } catch (err) {
        console.error('Lỗi tải thông tin cá nhân', err);
      }
    };
    loadProfile();
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          const result = event.target.result;
          setAvatarUrl(result);
          localStorage.setItem('user_avatar', result);
          // Dispatch custom event for real-time update in layout
          window.dispatchEvent(new CustomEvent('user-avatar-updated', { detail: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    const nameErr = validateName(profileData.name);
    if (nameErr) newErrors.name = nameErr;
    
    const emailErr = validateEmail(profileData.email);
    if (emailErr) newErrors.email = emailErr;
    
    const phoneErr = validatePhone(profileData.phone);
    if (phoneErr) newErrors.phone = phoneErr;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProfile = () => {
    if (!validateForm()) return;
    
    setIsEditing(false);
    setUserName(profileData.name);
    localStorage.setItem('user_name', profileData.name);
    window.dispatchEvent(new CustomEvent('user-name-updated', { detail: profileData.name }));
    alert('Đã cập nhật thông tin hồ sơ thành công!');
  };

  // Password State
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [passStatus, setPassStatus] = useState<{type: 'success'|'error'|'loading'|null, message: string}>({type: null, message: ''});
  
  const handlePasswordChange = async () => {
    if (!passwords.old || !passwords.new || !passwords.confirm) {
      setPassStatus({ type: 'error', message: 'Vui lòng điền đầy đủ tất cả các trường mật khẩu!' });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPassStatus({ type: 'error', message: 'Mật khẩu xác nhận không khớp!' });
      return;
    }
    if (passwords.new.length < 6) {
      setPassStatus({ type: 'error', message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
      return;
    }

    setPassStatus({ type: 'loading', message: 'Đang xử lý...' });
    try {
      await api.post('/api/v1/users/change-password', {
        current_password: passwords.old,
        new_password: passwords.new
      });
      
      setPassStatus({ type: 'success', message: 'Đổi mật khẩu thành công!' });
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Có lỗi xảy ra khi đổi mật khẩu';
      setPassStatus({ type: 'error', message: errorMsg });
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Vừa xong';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
      if (diffInSeconds < 172800) return 'Hôm qua';
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    } catch (e) {
      return 'Vừa xong';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8">
      {/* Header Profile */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        {/* BG Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 w-32 h-32 rounded-full border-4 border-white shadow-xl bg-blue-100 flex items-center justify-center overflow-hidden shrink-0">
          <img src={avatarUrl || `https://ui-avatars.com/api/?name=${userName}&background=EBF4FF&color=3B66F5&size=128`} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative z-10 flex-1 text-center md:text-left">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{userName}</h1>
          <p className="text-blue-600 font-semibold mb-4 text-sm flex items-center justify-center md:justify-start gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
            {userRole} Đại học Công nghiệp TP.HCM (IUH)
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-medium text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">12</span>
              Bài viết
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">45</span>
              Tài liệu
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">8.5</span>
              GPA
            </div>
          </div>
        </div>
        
        <div className="relative z-10 flex gap-3">
          <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
          <button onClick={handleAvatarClick} className="px-6 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors text-sm border border-gray-200">
            Cập nhật Avatar
          </button>
          {isEditing ? (
            <button onClick={saveProfile} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors text-sm shadow-md shadow-emerald-200">
              Lưu thay đổi
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm shadow-md shadow-blue-200">
              Chỉnh sửa hồ sơ
            </button>
          )}
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-64 shrink-0">
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('info')}
              className={`text-left px-5 py-3.5 rounded-xl font-bold transition-all ${activeTab === 'info' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-transparent text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100'}`}
            >
              Thông tin chung
            </button>
            <button 
              onClick={() => setActiveTab('activity')}
              className={`text-left px-5 py-3.5 rounded-xl font-bold transition-all ${activeTab === 'activity' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-transparent text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100'}`}
            >
              Lịch sử hoạt động
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`text-left px-5 py-3.5 rounded-xl font-bold transition-all ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-transparent text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100'}`}
            >
              Bảo mật & Mật khẩu
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[400px]">
          
          {activeTab === 'info' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </span>
                Thông tin cá nhân
              </h2>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Họ và tên</label>
                  {isEditing ? (
                    <>
                      <input 
                        type="text" 
                        value={profileData.name} 
                        onChange={e => {
                          setProfileData({...profileData, name: e.target.value});
                          if (errors.name) setErrors({...errors, name: ''});
                        }} 
                        className={`w-full px-4 py-3 bg-white border-2 ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-blue-100 focus:border-blue-500'} rounded-xl font-medium text-gray-900 outline-none transition-all`} 
                      />
                      {errors.name && <p className="text-rose-500 text-[10px] font-bold mt-1 px-1">{errors.name}</p>}
                    </>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 border border-gray-100">{profileData.name}</div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Email liên hệ</label>
                  {isEditing ? (
                    <>
                      <input 
                        type="email" 
                        value={profileData.email} 
                        onChange={e => {
                          setProfileData({...profileData, email: e.target.value});
                          if (errors.email) setErrors({...errors, email: ''});
                        }} 
                        className={`w-full px-4 py-3 bg-white border-2 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-blue-100 focus:border-blue-500'} rounded-xl font-medium text-gray-900 outline-none transition-all`} 
                      />
                      {errors.email && <p className="text-rose-500 text-[10px] font-bold mt-1 px-1">{errors.email}</p>}
                    </>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 border border-gray-100">{profileData.email}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                Hoạt động gần đây
              </h2>
              
              {activities.length > 0 ? (
                <div className="relative border-l-2 border-gray-100 ml-3 pl-6 space-y-8">
                  {activities.map((act, idx) => (
                    <div key={idx} className="relative">
                       <div className={`absolute w-4 h-4 rounded-full border-4 border-white -left-[31px] top-1 ${
                         act.type === 'test' ? 'bg-emerald-500' : act.type === 'document' ? 'bg-blue-500' : 'bg-purple-500'
                       }`}></div>
                       <p className="text-sm text-gray-500 font-medium mb-1">{getRelativeTime(act.created_at)}</p>
                       <p className="font-bold text-gray-900">{act.title}</p>
                       <p className={`text-sm mt-1 ${act.type === 'test' ? 'text-emerald-600 font-bold' : 'text-gray-500'}`}>
                         {act.description}
                       </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">Chưa có hoạt động nào được ghi lại.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
                Bảo mật & Mật khẩu
              </h2>
              <div className="max-w-md space-y-4">
                 {passStatus.type && (
                   <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${passStatus.type === 'error' ? 'bg-red-50 text-red-600' : passStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                     {passStatus.type === 'error' && <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                     {passStatus.type === 'success' && <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                     {passStatus.type === 'loading' && <svg className="w-5 h-5 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                     {passStatus.message}
                   </div>
                 )}
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                    <input type="password" value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu mới</label>
                    <input type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nhập lại mật khẩu mới</label>
                    <input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none" />
                 </div>
                 <button onClick={handlePasswordChange} disabled={passStatus.type === 'loading'} className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl mt-4 hover:bg-rose-700 transition-colors shadow-md shadow-rose-200 disabled:opacity-50">
                    {passStatus.type === 'loading' ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                 </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
