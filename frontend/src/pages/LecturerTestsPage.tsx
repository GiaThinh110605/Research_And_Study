import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, Clock, Edit2, Trash2, Plus, Zap, Search } from 'lucide-react';
import { testService, TestOut } from '../services/test';
import { authService } from '../services/auth';

const LecturerTestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTests = tests.filter(test => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      (test.title && test.title.toLowerCase().includes(lowerQuery)) ||
      (test.subject && test.subject.toLowerCase().includes(lowerQuery))
    );
  });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      // Đầu tiên lấy thông tin user hiện tại để lọc theo creator_id
      const currentUser = await authService.getCurrentUser();
      const data = await testService.getTests({ creator_id: currentUser.id });
      setTests(data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài kiểm tra này?')) {
      try {
        await testService.deleteTest(id);
        setTests(tests.filter(t => t.id !== id));
      } catch (error) {
        console.error('Error deleting test:', error);
        alert('Có lỗi xảy ra khi xóa bài kiểm tra');
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Đang tải danh sách bài kiểm tra...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pb-24 relative min-h-full">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Quản lý đề thi</h1>
          <p className="text-gray-500 max-w-2xl mb-6">Xem và quản lý tất cả các bài kiểm tra hiện có. Bạn có thể cập nhật nội dung hoặc xóa các đề thi không còn sử dụng.</p>
          <div className="relative max-w-md">
            <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên đề thi, môn học..." 
              className="bg-white shadow-sm pl-14 pr-6 py-3.5 rounded-2xl text-sm outline-none w-full border border-gray-100 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300" 
            />
          </div>
        </div>
        <Link to="/lecturer/bai-kiem-tra/tao" className="bg-[#3B66F5] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200/50 hover:bg-blue-700 transition flex items-center gap-2 shrink-0">
          <Plus className="w-5 h-5" /> Tạo đề thi mới
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#3B66F5] flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng số đề thi</p>
            <p className="text-3xl font-black text-gray-900">{tests.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Đang hoạt động</p>
            <p className="text-3xl font-black text-gray-900">{tests.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Đang chờ duyệt</p>
            <p className="text-3xl font-black text-gray-900">0</p>
          </div>
        </div>
      </div>

      {/* Test Grid */}
      {filteredTests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có bài kiểm tra nào phù hợp</h3>
          <p className="text-gray-500 mb-6">Không tìm thấy bài kiểm tra nào. Hãy thử lại với từ khóa khác hoặc tạo đề thi mới.</p>
          <Link to="/lecturer/bai-kiem-tra/tao" className="inline-flex bg-[#3B66F5] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition items-center gap-2">
            <Plus className="w-5 h-5" /> Tạo đề thi ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTests.map((test, index) => (
            <div key={test.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between group hover:shadow-md transition relative overflow-hidden">
              {/* Optional background image effect for some cards to mimic design */}
              {index % 3 === 0 && (
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
              )}
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded">
                    {test.subject || 'CHUNG'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {test.created_at ? new Date(test.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{test.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">Gồm {test.questions_count} câu hỏi trắc nghiệm.</p>
                <div className="flex gap-4 items-center text-sm text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {test.duration_minutes || 60} phút
                  </span>
                  <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs font-bold">
                    Hoạt động
                  </span>
                  {test.access_code && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-xs font-bold flex items-center gap-1">
                      Mã: <span className="font-mono tracking-wider">{test.access_code}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50">
                <Link to={`/lecturer/ket-qua-sinh-vien?testId=${test.id}`} className="text-xs font-bold text-[#3B66F5] hover:underline">
                  Xem kết quả
                </Link>
                <div className="flex gap-4">
                  <button 
                    onClick={() => navigate(`/lecturer/bai-kiem-tra/tao?id=${test.id}`)}
                    className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition"
                  >
                    <Edit2 className="w-4 h-4" /> Sửa
                  </button>
                  <button onClick={() => handleDelete(test.id)} className="flex items-center gap-1 text-sm font-bold text-red-500 hover:text-red-700 transition">
                    <Trash2 className="w-4 h-4" /> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tip Box */}
      <div className="mt-8 bg-indigo-50 rounded-2xl p-6 border border-indigo-100 flex gap-4 items-start">
        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-indigo-900 mb-1">Mẹo quản lý đề thi</h4>
          <p className="text-sm text-indigo-800/80 leading-relaxed">Bạn có thể sử dụng tính năng <strong>xáo trộn câu hỏi</strong> khi tạo đề thi mới để đảm bảo tính minh bạch trong kỳ thi. Tất cả các thay đổi khi <strong>Sửa</strong> sẽ được tự động đồng bộ hóa với lịch thi của sinh viên ngay lập tức. Hãy kiểm tra kỹ trước khi lưu.</p>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8">
        <Link to="/lecturer/bai-kiem-tra/tao" className="w-14 h-14 bg-[#3B66F5] rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-300 hover:bg-blue-700 hover:scale-105 transition-all">
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
};

export default LecturerTestsPage;
