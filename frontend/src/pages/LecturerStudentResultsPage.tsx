import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Download, Users, Star, Clock, Eye, AlertCircle, ArrowLeft } from 'lucide-react';
import { testService, TestResultOut, TestOut } from '../services/test';

const LecturerStudentResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('testId');
  const navigate = useNavigate();

  const [results, setResults] = useState<TestResultOut[]>([]);
  const [testInfo, setTestInfo] = useState<TestOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (testId) {
      fetchData(parseInt(testId));
    } else {
      setIsLoading(false);
    }
  }, [testId]);

  const fetchData = async (id: number) => {
    try {
      setIsLoading(true);
      const [testData, resultsData] = await Promise.all([
        testService.getTest(id),
        testService.getTestResults(id)
      ]);
      setTestInfo(testData);
      setResults(resultsData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAverageScore = () => {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, r) => sum + (r.score || 0), 0);
    return (total / results.length).toFixed(1);
  };

  const calculateAverageTime = () => {
    if (results.length === 0) return '0 phút';
    const validTimes = results.filter(r => r.time_taken_seconds != null).map(r => r.time_taken_seconds!);
    if (validTimes.length === 0) return 'Không rõ';
    const avgSeconds = validTimes.reduce((sum, t) => sum + t, 0) / validTimes.length;
    return `${Math.floor(avgSeconds / 60)} phút ${Math.round(avgSeconds % 60)} giây`;
  };

  if (!testId) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 pb-24 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Vui lòng chọn một bài kiểm tra</h2>
        <p className="text-gray-500 mb-6">Bạn cần chọn một bài kiểm tra từ trang Quản lý đề thi để xem kết quả.</p>
        <button onClick={() => navigate('/lecturer/bai-kiem-tra')} className="bg-[#3B66F5] text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-blue-700">
          Quay lại Quản lý đề thi
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center">Đang tải dữ liệu kết quả...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pb-24">
      {/* Header Info */}
      <div>
        <button onClick={() => navigate('/lecturer/bai-kiem-tra')} className="flex items-center text-sm font-semibold text-[#3B66F5] hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại trang quản lý
        </button>
        <p className="text-xs font-bold text-[#3B66F5] uppercase tracking-widest flex items-center gap-1 mb-2">
          <Star className="w-3 h-3" /> BÁO CÁO HỌC TẬP {testInfo && `- ${testInfo.title}`}
        </p>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Kết quả sinh viên</h1>
        <p className="text-gray-500">Theo dõi hiệu suất và thời gian hoàn thành bài kiểm tra của các học viên.</p>
      </div>

      {results.length === 0 && (
        <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-3 text-blue-800 border border-blue-100">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Chưa có sinh viên nào hoàn thành bài kiểm tra này. Hãy chia sẻ đề thi để bắt đầu nhận kết quả.</p>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 mb-1">Tổng sinh viên tham gia</p>
          <p className="text-4xl font-black text-gray-900">{results.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 mb-1">Điểm trung bình</p>
          <p className="text-4xl font-black text-gray-900">{calculateAverageScore()}<span className="text-xl text-gray-400 font-bold">/10</span></p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 mb-1">Thời gian TB</p>
          <p className="text-4xl font-black text-gray-900">{calculateAverageTime()}</p>
        </div>
      </div>

      {/* Main Table Area */}
      {results.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Danh sách hoàn thành</h3>
            <div className="flex gap-3">
              <button onClick={() => alert('Chức năng lọc đang được phát triển')} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100">
                <Filter className="w-4 h-4" /> Lọc dữ liệu
              </button>
              <button onClick={() => alert('Đang xuất báo cáo PDF...')} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#3B66F5] rounded-lg shadow-md hover:bg-blue-700">
                <Download className="w-4 h-4" /> Xuất báo cáo
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-4 px-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase border-b border-gray-50">Sinh viên</th>
                  <th className="py-4 px-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase border-b border-gray-50">Ngày làm</th>
                  <th className="py-4 px-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase border-b border-gray-50">Điểm số</th>
                  <th className="py-4 px-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase border-b border-gray-50">Thời gian</th>
                  <th className="py-4 px-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase border-b border-gray-50">Trạng thái</th>
                  <th className="py-4 px-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase border-b border-gray-50">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {results.map((result, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-indigo-100 text-indigo-600 uppercase">
                        {(result.full_name || 'SV').substring(0, 2)}
                      </div>
                      <span className="font-bold text-gray-900 text-sm">{result.full_name || `Học viên ID: ${result.user_id}`}</span>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-500">
                      {new Date(result.completed_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-900">{result.score}</span>
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${result.score >= 8 ? 'bg-green-500' : result.score >= 5 ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${result.score * 10}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-500">
                      {result.time_taken_seconds ? `${Math.floor(result.time_taken_seconds / 60)} phút` : 'Không rõ'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold ${result.score >= 5 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                        {result.score >= 5 ? 'Đạt' : 'Cần cố gắng'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button onClick={() => navigate(`/lecturer/ket-qua-chi-tiet/${result.id}`)} className="w-8 h-8 rounded-full bg-blue-50 text-[#3B66F5] flex items-center justify-center hover:bg-[#3B66F5] hover:text-white transition">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Banner */}
      <div className="bg-gradient-to-r from-[#3B66F5] to-indigo-600 rounded-3xl p-8 flex items-center justify-between relative overflow-hidden shadow-lg shadow-blue-200">
        <div className="absolute right-0 top-0 opacity-20 pointer-events-none w-1/2 h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl font-black text-white mb-3">Tạo báo cáo chi tiết cho hội đồng bộ môn?</h2>
          <p className="text-blue-100 mb-6 leading-relaxed">Chúng tôi có thể tự động tổng hợp kết quả của cả học kỳ thành một file PDF chuyên nghiệp chỉ với một cú nhấp chuột.</p>
          <button onClick={() => alert('Hệ thống đang tổng hợp dữ liệu...')} className="bg-white text-[#3B66F5] font-bold py-3 px-6 rounded-xl text-sm shadow flex items-center gap-2 hover:bg-gray-50 transition">
            <Star className="w-4 h-4" /> Tạo báo cáo ngay
          </button>
        </div>
        <div className="relative z-10 hidden md:block">
           <img src="https://ui-avatars.com/api/?name=Report&background=fff&color=3B66F5&size=128" alt="Report icon" className="w-32 h-32 rounded-2xl transform rotate-3 shadow-xl" />
        </div>
      </div>
    </div>
  );
};

export default LecturerStudentResultsPage;
