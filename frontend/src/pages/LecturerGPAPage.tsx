import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, Plus, Trash2, History } from 'lucide-react';
import { gpaService, CourseInput, GPACalculateResponse, GPAHistoryItem } from '../services/gpa';

const LecturerGPAPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseInput[]>([
    { course_name: 'Cơ sở dữ liệu', credits: 3, score_10: 8 },
    { course_name: 'Kỹ thuật lập trình', credits: 4, score_10: 7.5 },
  ]);
  const [result, setResult] = useState<GPACalculateResponse | null>(null);
  const [history, setHistory] = useState<GPAHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const totalCreditsInput = useMemo(
    () => courses.reduce((total, item) => total + (Number(item.credits) || 0), 0),
    [courses],
  );

  const loadHistory = async () => {
    try {
      const data = await gpaService.history();
      setHistory(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể tải lịch sử tính GPA.');
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const addCourse = () => {
    setCourses((prev) => [...prev, { course_name: '', credits: 3, score_10: 0 }]);
  };

  const removeCourse = (index: number) => {
    setCourses((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateCourse = (index: number, field: keyof CourseInput, value: string) => {
    setCourses((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;

        if (field === 'course_name') {
          return { ...item, course_name: value };
        }

        const numeric = Number(value);
        return {
          ...item,
          [field]: Number.isNaN(numeric) ? 0 : numeric,
        } as CourseInput;
      }),
    );
  };

  const handleCalculate = async () => {
    setError('');
    const normalized = courses.filter((item) => item.course_name.trim() && item.credits > 0);

    if (normalized.length === 0) {
      setError('Vui lòng nhập ít nhất 1 học phần hợp lệ.');
      return;
    }

    setIsLoading(true);
    try {
      const calculated = await gpaService.calculate(normalized);
      setResult(calculated);
      await loadHistory();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Tính GPA thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = async (id: number) => {
    try {
      await gpaService.removeHistory(id);
      await loadHistory();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể xóa lịch sử.');
    }
  };

  return (
    <div className="p-8 bg-[#F4F7FE] min-h-full space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Giảng viên GPA</h2>
          <p className="text-gray-500">Công cụ tính GPA nhanh để tư vấn học tập và kiểm tra kịch bản điểm cho sinh viên.</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-2 text-sm font-semibold text-gray-700">
          Tổng tín chỉ đang nhập: {totalCreditsInput}
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900">Nhập học phần</h3>
            <button
              onClick={addCourse}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-bold text-[#3B66F5] hover:bg-blue-50"
            >
              <Plus className="w-4 h-4" />
              Thêm học phần
            </button>
          </div>

          <div className="space-y-3">
            {courses.map((course, idx) => (
              <div key={`${course.course_name}-${idx}`} className="grid grid-cols-12 gap-3 items-center rounded-xl bg-gray-50 p-3">
                <input
                  value={course.course_name}
                  onChange={(event) => updateCourse(idx, 'course_name', event.target.value)}
                  placeholder="Tên học phần"
                  className="col-span-12 md:col-span-6 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  value={course.credits}
                  min={1}
                  onChange={(event) => updateCourse(idx, 'credits', event.target.value)}
                  placeholder="Tín chỉ"
                  className="col-span-6 md:col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  value={course.score_10}
                  min={0}
                  max={10}
                  step={0.1}
                  onChange={(event) => updateCourse(idx, 'score_10', event.target.value)}
                  placeholder="Điểm hệ 10"
                  className="col-span-6 md:col-span-3 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <button
                  onClick={() => removeCourse(idx)}
                  className="col-span-12 md:col-span-1 rounded-lg border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50"
                  title="Xóa học phần"
                >
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleCalculate}
            disabled={isLoading}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#3B66F5] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-60"
          >
            <Calculator className="w-4 h-4" />
            {isLoading ? 'Đang tính...' : 'Tính GPA'}
          </button>

          {result && (
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-bold text-gray-700">Kết quả mới nhất</p>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl bg-white p-3 border border-blue-100">
                  <p className="text-xs font-bold text-gray-400 uppercase">GPA hệ 10</p>
                  <p className="text-2xl font-black text-gray-900">{result.gpa_10}</p>
                </div>
                <div className="rounded-xl bg-white p-3 border border-blue-100">
                  <p className="text-xs font-bold text-gray-400 uppercase">GPA hệ 4.0</p>
                  <p className="text-2xl font-black text-gray-900">{result.gpa_4}</p>
                </div>
                <div className="rounded-xl bg-white p-3 border border-blue-100">
                  <p className="text-xs font-bold text-gray-400 uppercase">Tổng tín chỉ</p>
                  <p className="text-2xl font-black text-gray-900">{result.total_credits}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="xl:col-span-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-[#3B66F5]" />
            <h3 className="text-lg font-black text-gray-900">Lịch sử GPA</h3>
          </div>

          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
              Chưa có lịch sử tính GPA.
            </div>
          ) : (
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {history.map((item) => (
                <div key={item.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString('vi-VN')}</p>
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    GPA 10: {item.result.gpa_10} • GPA 4.0: {item.result.gpa_4}
                  </p>
                  <p className="text-xs text-gray-600">{item.result.total_credits} tín chỉ • {item.result.total_courses} học phần</p>
                  <button
                    onClick={() => handleDeleteHistory(item.id)}
                    className="mt-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Xóa lịch sử
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LecturerGPAPage;
