import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Info, Plus, Copy, Trash2, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { testService } from '../services/test';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  content: string;
  options: Option[];
}

const LecturerCreateTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('id');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!testId);
  const [error, setError] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState<string | null>(null);

  React.useEffect(() => {
    if (testId) {
      const fetchTestData = async () => {
        try {
          const test = await testService.getTest(parseInt(testId));
          setTitle(test.title);
          setDuration(test.duration_minutes || 60);
          setAccessCode(test.access_code || null);
          
          if (test.questions && test.questions.length > 0) {
            const formattedQuestions = test.questions.map((q: any) => ({
              id: q.id || Date.now() + Math.random(),
              content: q.text,
              options: q.options.map((optText: string, optIdx: number) => ({
                id: (q.id || '') + '-' + optIdx,
                text: optText,
                isCorrect: q.answer === optIdx
              }))
            }));
            setQuestions(formattedQuestions);
          }
        } catch (err) {
          console.error("Lỗi khi tải dữ liệu đề thi:", err);
          setError("Không thể tải dữ liệu đề thi để chỉnh sửa.");
        } finally {
          setIsFetching(false);
        }
      };
      fetchTestData();
    }
  }, [testId]);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: Date.now(),
      content: "",
      options: [
        { id: '1', text: '', isCorrect: true },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false }
      ]
    }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now(),
      content: "",
      options: [
        { id: Date.now() + '1', text: '', isCorrect: true },
        { id: Date.now() + '2', text: '', isCorrect: false },
        { id: Date.now() + '3', text: '', isCorrect: false },
        { id: Date.now() + '4', text: '', isCorrect: false }
      ]
    }]);
  };

  const removeQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const cloneQuestion = (question: Question) => {
    const newQuestion = JSON.parse(JSON.stringify(question));
    newQuestion.id = Date.now();
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestionContent = (id: number, content: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, content } : q));
  };

  const updateOptionText = (qId: number, oId: string, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;
      return {
        ...q,
        options: q.options.map(opt => opt.id === oId ? { ...opt, text } : opt)
      };
    }));
  };

  const setCorrectOption = (qId: number, oId: string) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;
      return {
        ...q,
        options: q.options.map(opt => ({
          ...opt,
          isCorrect: opt.id === oId
        }))
      };
    }));
  };

  const addOption = (qId: number) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;
      return {
        ...q,
        options: [...q.options, { id: Date.now().toString(), text: '', isCorrect: false }]
      };
    }));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề bài kiểm tra');
      return;
    }
    
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.content.trim()) {
        setError(`Vui lòng nhập nội dung cho câu hỏi ${i + 1}`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          setError(`Vui lòng nhập nội dung đáp án cho câu hỏi ${i + 1}`);
          return;
        }
      }
      if (!q.options.some(o => o.isCorrect)) {
        setError(`Vui lòng chọn 1 đáp án đúng cho câu hỏi ${i + 1}`);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        title: title,
        subject: "TRẮC NGHIỆM",
        duration_minutes: duration,
        access_code: accessCode,
        questions: questions.map((q, idx) => {
          const optionsText = q.options.map(o => o.text);
          const correctIndex = q.options.findIndex(o => o.isCorrect);
          return {
            id: idx + 1,
            text: q.content,
            options: optionsText,
            answer: correctIndex
          };
        })
      };

      if (testId) {
        await testService.updateTest(parseInt(testId), payload);
      } else {
        await testService.createTest(payload);
      }
      navigate('/lecturer/bai-kiem-tra');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Đã có lỗi xảy ra khi tạo bài kiểm tra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div>
        <Link to="/lecturer/bai-kiem-tra" className="flex items-center text-sm font-semibold text-[#3B66F5] hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại trang quản lý
        </Link>
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          {testId ? 'Chỉnh sửa đề thi' : 'Tạo đề thi mới'}
        </h1>
        <p className="text-gray-500">
          {testId ? 'Cập nhật lại nội dung và câu hỏi cho bài kiểm tra.' : 'Thiết lập thông tin và câu hỏi cho bài kiểm tra học thuật.'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* General Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6 text-blue-800 font-bold">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-[#3B66F5] flex items-center justify-center text-sm">
            <Info className="w-4 h-4" />
          </div>
          Thông tin chung
        </div>
        
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Tiêu đề đề thi <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề ví dụ: Kiểm tra giữa kỳ Kinh tế vĩ mô" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3B66F5] focus:ring-1 focus:ring-[#3B66F5] outline-none transition" 
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">Thời lượng (Phút) <span className="text-red-500">*</span></label>
            <div className="relative">
              <input 
                type="number" 
                value={duration}
                onChange={e => setDuration(parseInt(e.target.value) || 0)}
                placeholder="60" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3B66F5] focus:ring-1 focus:ring-[#3B66F5] outline-none transition" 
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">phút</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả bài thi (Không bắt buộc)</label>
          <textarea 
            rows={3} 
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ghi chú cho sinh viên về phạm vi kiến thức..." 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3B66F5] focus:ring-1 focus:ring-[#3B66F5] outline-none transition resize-none"
          ></textarea>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-50">
          <label className="block text-sm font-bold text-gray-700 mb-2">Mã truy cập (Để trống để hệ thống tự tạo)</label>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Shield className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={accessCode || ''}
                onChange={e => setAccessCode(e.target.value.toUpperCase())}
                placeholder="Ví dụ: MYCODE123" 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#3B66F5] focus:ring-1 focus:ring-[#3B66F5] outline-none transition font-mono tracking-wider" 
              />
            </div>
            {accessCode && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(accessCode);
                  alert("Đã sao chép mã truy cập!");
                }}
                className="px-4 py-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition flex items-center gap-2 font-bold text-sm"
              >
                <Copy className="w-4 h-4" /> Sao chép
              </button>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-2 italic">* Nếu không nhập, hệ thống sẽ tự động tạo một mã ngẫu nhiên khi bạn lưu đề thi.</p>
        </div>
      </div>

      {/* Questions Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-blue-800 font-bold">
            <div className="w-6 h-6 rounded-md bg-blue-100 text-[#3B66F5] flex items-center justify-center text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
            </div>
            Danh sách câu hỏi
          </div>
          <button onClick={addQuestion} className="bg-[#3B66F5] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Thêm câu hỏi mới
          </button>
        </div>

        {/* Question Cards */}
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-2xl border-2 border-[#3B66F5] shadow-sm overflow-hidden flex">
              <div className="w-2 bg-[#3B66F5] shrink-0"></div>
              <div className="p-6 w-full relative">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-[#3B66F5] flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                    <span className="text-gray-400 font-semibold text-sm">Câu hỏi trắc nghiệm</span>
                  </div>
                  <div className="flex gap-2 text-gray-400">
                    <button onClick={() => cloneQuestion(q)} className="hover:text-gray-600" title="Nhân bản"><Copy className="w-4 h-4" /></button>
                    {questions.length > 1 && (
                      <button onClick={() => removeQuestion(q.id)} className="hover:text-red-500" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nội dung câu hỏi <span className="text-red-500">*</span></label>
                  <textarea 
                    rows={2} 
                    value={q.content}
                    onChange={e => updateQuestionContent(q.id, e.target.value)}
                    placeholder="Nhập nội dung câu hỏi..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3B66F5] outline-none resize-none font-medium"
                  ></textarea>
                </div>

                <div className="space-y-3">
                  {q.options.map((opt) => (
                    <div key={opt.id} className={`flex items-center gap-4 px-4 py-3 rounded-xl border-2 transition ${opt.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <button 
                        onClick={() => setCorrectOption(q.id, opt.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${opt.isCorrect ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'}`}
                      >
                        {opt.isCorrect && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </button>
                      <input 
                        type="text" 
                        value={opt.text}
                        onChange={e => updateOptionText(q.id, opt.id, e.target.value)}
                        placeholder="Nhập đáp án..."
                        className="flex-1 bg-transparent outline-none font-medium text-gray-700" 
                      />
                      {opt.isCorrect && <span className="text-xs font-bold text-green-600 tracking-wider uppercase shrink-0">ĐÁP ÁN ĐÚNG</span>}
                    </div>
                  ))}
                </div>

                {/* Floating Add Option Button */}
                <button 
                  onClick={() => addOption(q.id)}
                  className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#3B66F5] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 hover:scale-110 transition"
                  title="Thêm đáp án"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add Next Question Area */}
          <button onClick={addQuestion} className="w-full py-12 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#3B66F5] hover:bg-blue-50 transition flex flex-col items-center justify-center group">
            <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#3B66F5] text-gray-400 group-hover:text-white flex items-center justify-center mb-3 transition">
              <Plus className="w-5 h-5" />
            </div>
            <p className="font-bold text-gray-600 group-hover:text-[#3B66F5]">Nhấp để thêm câu hỏi tiếp theo</p>
            <p className="text-xs text-gray-400 mt-1">Hệ thống hỗ trợ Trắc nghiệm, Tự luận và Kéo thả</p>
          </button>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <Link to="/lecturer/bai-kiem-tra" className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-center">
          Hủy
        </Link>
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="px-8 py-3 rounded-xl font-bold text-white bg-[#3B66F5] shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Đang xử lý...
            </>
          ) : (
            'Hoàn tất & Xuất bản'
          )}
        </button>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <h4 className="flex items-center text-[#3B66F5] font-bold text-sm uppercase tracking-wide mb-2"><AlertCircle className="w-4 h-4 mr-2" /> Mẹo nhỏ</h4>
          <p className="text-sm text-gray-600 leading-relaxed">Đảm bảo mỗi câu hỏi có ít nhất một đáp án đúng được chọn. Bạn có thể sử dụng biểu tượng sao chép để nhân bản câu hỏi nếu cấu trúc giống nhau.</p>
        </div>
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
          <h4 className="flex items-center text-orange-600 font-bold text-sm uppercase tracking-wide mb-2"><Shield className="w-4 h-4 mr-2" /> Bảo mật bài thi</h4>
          <p className="text-sm text-gray-600 leading-relaxed">Kích hoạt tính năng xáo trộn câu hỏi và đáp án trong phần Cài đặt nâng cao để tăng tính công bằng cho bài thi.</p>
        </div>
      </div>
    </div>
  );
};

export default LecturerCreateTestPage;
