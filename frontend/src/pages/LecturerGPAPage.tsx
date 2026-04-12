import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, Loader2, Trash2 } from 'lucide-react';
import {
  CourseInput,
  GPACalculateResponse,
  GPAHistoryItem,
  gpaService,
} from '../services/gpa';

interface EditableCourse extends CourseInput {
  id: string;
}

const LecturerGPAPage: React.FC = () => {
  const [courses, setCourses] = useState<EditableCourse[]>([
    { id: '1', course_name: 'Mon hoc 1', credits: 3, score_10: 8 },
    { id: '2', course_name: 'Mon hoc 2', credits: 2, score_10: 7.5 },
  ]);
  const [result, setResult] = useState<GPACalculateResponse | null>(null);
  const [history, setHistory] = useState<GPAHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCalculate = useMemo(() => {
    return courses.length > 0 && courses.every((course) => {
      return (
        course.course_name.trim().length > 0
        && Number.isFinite(course.credits)
        && course.credits > 0
        && Number.isFinite(course.score_10)
        && course.score_10 >= 0
        && course.score_10 <= 10
      );
    });
  }, [courses]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await gpaService.history();
      setHistory(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Khong the tai lich su GPA.');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const updateCourse = (id: string, field: keyof CourseInput, value: string) => {
    setCourses((prev) => prev.map((course) => {
      if (course.id !== id) return course;
      if (field === 'credits') {
        return { ...course, credits: Math.max(0, Number(value) || 0) };
      }
      if (field === 'score_10') {
        return { ...course, score_10: Math.max(0, Math.min(10, Number(value) || 0)) };
      }
      return { ...course, course_name: value };
    }));
  };

  const addCourse = () => {
    setCourses((prev) => [
      ...prev,
      { id: Date.now().toString(), course_name: '', credits: 3, score_10: 0 },
    ]);
  };

  const removeCourse = (id: string) => {
    setCourses((prev) => prev.filter((course) => course.id !== id));
  };

  const handleCalculate = async () => {
    setError(null);
    if (!canCalculate) {
      setError('Vui long nhap day du thong tin mon hoc hop le truoc khi tinh GPA.');
      return;
    }

    setCalculating(true);
    try {
      const payload: CourseInput[] = courses.map(({ course_name, credits, score_10 }) => ({
        course_name: course_name.trim(),
        credits,
        score_10,
      }));
      const calculated = await gpaService.calculate(payload);
      setResult(calculated);
      await loadHistory();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Tinh GPA that bai.');
    } finally {
      setCalculating(false);
    }
  };

  const deleteHistory = async (id: number) => {
    try {
      await gpaService.removeHistory(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Xoa lich su that bai.');
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#F4F7FE] min-h-full">
      <div>
        <p className="text-[10px] font-black tracking-widest text-[#3B66F5] uppercase mb-1">Giang vien</p>
        <h2 className="text-3xl font-black text-gray-900">Tinh GPA</h2>
        <p className="text-gray-500 font-medium mt-2">Nhap diem theo tung mon hoc de tinh GPA he 10 va he 4.0, dong thoi luu lich su tinh toan.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900">Danh sach mon hoc</h3>
            <button
              onClick={addCourse}
              className="text-sm font-black text-[#3B66F5] hover:text-blue-700"
            >
              Them mon
            </button>
          </div>

          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="grid grid-cols-12 gap-3 rounded-xl border border-gray-100 p-3">
                <input
                  value={course.course_name}
                  onChange={(e) => updateCourse(course.id, 'course_name', e.target.value)}
                  placeholder="Ten mon"
                  className="col-span-12 md:col-span-6 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  min={1}
                  value={course.credits}
                  onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                  className="col-span-5 md:col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={course.score_10}
                  onChange={(e) => updateCourse(course.id, 'score_10', e.target.value)}
                  className="col-span-5 md:col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => removeCourse(course.id)}
                  className="col-span-2 md:col-span-2 inline-flex items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#3B66F5] px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {calculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
            Tinh GPA
          </button>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 mb-3">Ket qua moi nhat</h3>
            {!result ? (
              <p className="text-sm font-semibold text-gray-500">Chua co ket qua. Nhap diem va bam Tinh GPA.</p>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-xs font-black tracking-widest text-blue-500 uppercase">GPA he 10</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{result.gpa_10}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs font-black tracking-widest text-emerald-500 uppercase">GPA he 4.0</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{result.gpa_4}</p>
                </div>
                <p className="text-sm font-semibold text-gray-600">
                  Tong tin chi: <span className="font-black text-gray-900">{result.total_credits}</span>
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 mb-3">Lich su</h3>
            {loadingHistory ? (
              <div className="text-sm text-gray-500 font-semibold inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Dang tai lich su...
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm font-semibold text-gray-500">Chua co lich su tinh GPA.</p>
            ) : (
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div key={item.id} className="rounded-xl border border-gray-100 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-gray-900">GPA 4.0: {item.result.gpa_4}</p>
                        <p className="text-xs font-semibold text-gray-500 mt-1">
                          {new Date(item.created_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteHistory(item.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-black text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xoa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerGPAPage;
