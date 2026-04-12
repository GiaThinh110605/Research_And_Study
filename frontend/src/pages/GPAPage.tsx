import React, { useState, useEffect, useMemo } from 'react';

interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: number;
}

interface HistoryItem {
  id: string;
  title: string;
  gpa: number;
  classification: string;
  totalCredits: number;
  timestamp: string;
}

const GPAPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('gpa_subjects');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Triết học Mác - Lênin', credits: 3, grade: 0 },
      { id: '2', name: 'Kỹ thuật lập trình', credits: 4, grade: 0 },
      { id: '3', name: 'Toán cao cấp', credits: 3, grade: 0 }
    ];
  });

  const [scale, setScale] = useState<'hệ 10' | 'hệ 4.0'>('hệ 10');
  const [semester, setSemester] = useState<string>('1');
  const [academicYear, setAcademicYear] = useState<string>(() => {
    const year = new Date().getFullYear();
    return `${year}-${year + 1}`;
  });
  const [targetGpa, setTargetGpa] = useState<number>(3.2);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('gpa_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('gpa_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('gpa_history', JSON.stringify(history));
  }, [history]);

  const convertTo4Scale = (g10: number): number => {
    if (g10 >= 9.0) return 4.0; // A+
    if (g10 >= 8.5) return 3.8; // A
    if (g10 >= 8.0) return 3.5; // B+
    if (g10 >= 7.0) return 3.0; // B
    if (g10 >= 6.0) return 2.5; // C+
    if (g10 >= 5.5) return 2.0; // C
    if (g10 >= 5.0) return 1.5; // D+
    if (g10 >= 4.0) return 1.0; // D
    return 0; // F
  };

  const getClassification = (g4: number): string => {
    if (g4 >= 3.6) return 'XUẤT SẮC';
    if (g4 >= 3.2) return 'GIỎI';
    if (g4 >= 2.5) return 'KHÁ';
    if (g4 >= 2.0) return 'TRUNG BÌNH';
    return 'YẾU';
  };

  const { gpa10, gpa4, totalCredits } = useMemo(() => {
    let totalW10 = 0;
    let totalW4 = 0;
    let totalC = 0;

    subjects.forEach((s: Subject) => {
      const credits = Number(s.credits) || 0;
      const grade = Number(s.grade) || 0;
      
      if (credits > 0) {
        totalW10 += grade * credits;
        totalW4 += convertTo4Scale(grade) * credits;
        totalC += credits;
      }
    });

    const g10 = totalC > 0 ? (totalW10 / totalC) : 0;
    const g4 = totalC > 0 ? (totalW4 / totalC) : 0;

    return {
      gpa10: Math.round(g10 * 100) / 100,
      gpa4: Math.round(g4 * 100) / 100,
      totalCredits: totalC
    };
  }, [subjects]);

  const classification = getClassification(gpa4);

  const addSubject = () => {
    setSubjects([...subjects, { id: Date.now().toString(), name: '', credits: 3, grade: 0 }]);
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const updateSubject = (id: string, field: keyof Subject, value: any) => {
    let validatedValue = value;
    
    if (field === 'grade') {
      const num = parseFloat(value);
      if (isNaN(num)) validatedValue = 0;
      else validatedValue = Math.max(0, Math.min(10, num));
    } else if (field === 'credits') {
      const num = parseInt(value);
      if (isNaN(num)) validatedValue = 0;
      else validatedValue = Math.max(0, num);
    }

    setSubjects(prev => prev.map((s: Subject) => s.id === id ? { ...s, [field]: validatedValue } : s));
  };

  const clearAll = () => {
    if (window.confirm('Bạn có muốn xóa tất cả dữ liệu đang nhập?')) {
      setSubjects([
        { id: '1', name: '', credits: 3, grade: 0 },
        { id: '2', name: '', credits: 4, grade: 0 }
      ]);
    }
  };

  const saveResult = () => {
    const title = `Học kỳ ${semester} - Năm học ${academicYear}`;
    if (totalCredits === 0) {
      alert('Vui lòng nhập ít nhất một môn học có số tín chỉ lớn hơn 0.');
      return;
    }
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      title,
      gpa: scale === 'hệ 10' ? gpa10 : gpa4,
      classification,
      totalCredits,
      timestamp: new Date().toLocaleString('vi-VN')
    };
    setHistory((prev: HistoryItem[]) => [newItem, ...prev]);
    alert('Đã lưu kết quả vào lịch sử!');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <style>{`
        @media print {
          .no-print, button, .action-buttons {
            display: none !important;
          }
          
          .print-container {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .col-span-12, .lg:col-span-8, .lg:col-span-4 {
            width: 100% !important;
            display: block !important;
            margin-bottom: 30px !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            width: 100% !important;
          }
          
          th, td {
            border: 1px solid #ddd !important;
            padding: 12px 15px !important;
            font-size: 14px !important;
          }

          input {
            border: none !important;
            padding: 0 !important;
            font-size: 14px !important;
            background: transparent !important;
          }

          /* Đảm bảo màu sắc hiển thị khi in */
          .bg-blue-50 { background-color: #eff6ff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-[#EBF4FF] { background-color: #ebf4ff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .text-[#3B66F5] { color: #3b66f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          
          .print-summary {
            margin-top: 30px;
            padding: 20px;
            background: #f8fafc !important;
            border-radius: 20px;
            border: 1px solid #e2e8f0;
          }
        }
        
        .print-header { display: none; }
      `}</style>

      <div className="print-header">
        <h1 className="text-2xl font-bold text-gray-900">KẾT QUẢ TÍNH ĐIỂM GPA CÁ NHÂN</h1>
        <p className="text-gray-500">Trường Đại học Công nghiệp TP.HCM - IUH</p>
        <p className="text-sm text-gray-400 mt-2">Ngày xuất: {new Date().toLocaleDateString('vi-VN')}</p>
      </div>

      <div className="flex justify-between items-start no-print">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Tính GPA cá nhân</h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            Công cụ giúp sinh viên IUH theo dõi kết quả học tập, tính toán điểm trung bình tích lũy và dự đoán xếp loại tốt nghiệp.
          </p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button 
            onClick={() => setScale('hệ 10')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${scale === 'hệ 10' ? 'bg-[#3B66F5] text-white shadow-md shadow-blue-200' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Hệ 10
          </button>
          <button 
            onClick={() => setScale('hệ 4.0')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${scale === 'hệ 4.0' ? 'bg-[#3B66F5] text-white shadow-md shadow-blue-200' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Hệ 4.0
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 print-container">
        {/* Left Column - Input */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <svg className="w-5 h-5 text-[#3B66F5] no-print" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" /></svg>
                <span className="no-print">Nhập điểm học phần</span>
                <span className="hidden print:block">Học kỳ {semester} - Năm học {academicYear}</span>
              </h2>
              
              <div className="flex flex-wrap items-center gap-4 no-print">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Học kỳ</span>
                  <select 
                    value={semester}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSemester(e.target.value)}
                    className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-[#3B66F5] transition-all"
                  >
                    <option value="1">Học kỳ 1</option>
                    <option value="2">Học kỳ 2</option>
                    <option value="3">Học kỳ hè</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Năm học</span>
                  <input 
                    type="text"
                    value={academicYear}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAcademicYear(e.target.value)}
                    placeholder="2023-2024"
                    className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 w-32 outline-none focus:border-[#3B66F5] transition-all"
                  />
                </div>

                <button 
                  onClick={clearAll}
                  className="text-gray-400 hover:text-red-500 text-sm font-bold flex items-center gap-2 transition-colors ml-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Xóa
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[11px] font-black tracking-widest text-gray-400 uppercase border-b border-gray-100">
                    <th className="px-8 py-4">TÊN MÔN HỌC / MÃ HỌC PHẦN</th>
                    <th className="px-8 py-4 w-32">SỐ TÍN CHỈ</th>
                    <th className="px-8 py-4 w-32">ĐIỂM SỐ</th>
                    <th className="px-8 py-4 w-16 no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {subjects.map((s: Subject) => (
                    <tr key={s.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <input 
                          type="text" 
                          placeholder="Ví dụ: Triết học Mác - Lênin"
                          value={s.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSubject(s.id, 'name', e.target.value)}
                          className="w-full bg-gray-50/50 border border-transparent hover:border-gray-200 focus:border-[#3B66F5] focus:bg-white px-4 py-3 rounded-2xl outline-none text-gray-900 font-bold placeholder:text-gray-300 transition-all shadow-sm focus:shadow-blue-100/50 print:bg-transparent print:px-0"
                        />
                      </td>
                      <td className="px-8 py-5">
                        <input 
                          type="number" 
                          value={s.credits}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSubject(s.id, 'credits', parseInt(e.target.value) || 0)}
                          className="w-20 bg-gray-50 px-3 py-3 rounded-2xl text-center font-bold text-gray-900 border border-transparent hover:border-gray-200 focus:border-[#3B66F5] outline-none transition-all shadow-sm print:bg-transparent print:w-auto"
                        />
                      </td>
                      <td className="px-8 py-5">
                        <input 
                          type="number" 
                          step="0.1"
                          max="10"
                          min="0"
                          value={s.grade}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSubject(s.id, 'grade', parseFloat(e.target.value) || 0)}
                          className="w-20 bg-blue-50/50 px-3 py-3 rounded-2xl text-center font-bold text-[#3B66F5] border border-transparent hover:border-blue-200 focus:border-[#3B66F5] outline-none transition-all shadow-sm print:bg-transparent print:w-auto"
                        />
                      </td>
                      <td className="px-8 py-5 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                        <button 
                          onClick={() => removeSubject(s.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-8 bg-gray-50/30 no-print">
              <button 
                onClick={addSubject}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-3 text-gray-400 font-bold hover:border-[#3B66F5] hover:text-[#3B66F5] hover:bg-blue-50/50 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-[#3B66F5] group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                </div>
                + Thêm môn học
              </button>
            </div>
          </div>

          {/* History Section - Optional for print, usually we only want the current calc */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 no-print">
            <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Lịch sử tính điểm
            </h2>
            <div className="space-y-4">
              {history.length > 0 ? history.map(item => (
                <div key={item.id} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100/50 hover:border-blue-100 hover:bg-white transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-blue-50 text-[#3B66F5] flex items-center justify-center font-black text-sm">
                      {item.title.split(' ')[1] === 'kỳ' ? 'HK' + item.title.split(' ')[2] : 'ALL'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{item.title}</h4>
                      <p className="text-gray-400 text-sm font-medium">Cập nhật lúc: {item.timestamp}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-[#3B66F5] tracking-tight">{item.gpa}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{item.classification}</div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  </div>
                  <p className="text-gray-400 font-bold">Chưa có lịch sử tính điểm nào được lưu.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="col-span-12 lg:col-span-4 space-y-8 print-summary">
          <div className="bg-[#EBF4FF] rounded-[40px] p-10 relative overflow-hidden shadow-xl shadow-blue-100/50 border border-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16 blur-3xl no-print"></div>
            <div className="relative z-10">
              <div className="text-[11px] font-black tracking-[0.2em] text-[#3B66F5]/60 uppercase mb-4">GPA HIỆN TẠI</div>
              <div className="flex items-baseline gap-3 mb-12">
                <span className="text-8xl font-black text-gray-900 tracking-tighter leading-none">
                  {scale === 'hệ 10' ? gpa10 : gpa4}
                </span>
                <span className="text-2xl font-bold text-gray-400">/ {scale === 'hệ 10' ? '10' : '4.0'}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-white/50 backdrop-blur-md p-5 rounded-3xl border border-white/50 shadow-sm print:bg-white print:border-gray-200">
                  <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">TỔNG TÍN CHỈ</div>
                  <div className="text-2xl font-black text-gray-900 leading-none">{totalCredits}</div>
                </div>
                <div className="bg-white/50 backdrop-blur-md p-5 rounded-3xl border border-white/50 shadow-sm print:bg-white print:border-gray-200">
                  <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">XẾP LOẠI</div>
                  <div className="text-2xl font-black text-[#3B66F5] leading-none">{classification}</div>
                </div>
              </div>

              <div className="space-y-3 no-print">
                <button 
                  onClick={saveResult}
                  className="w-full bg-white text-gray-900 font-black py-5 rounded-3xl shadow-lg shadow-blue-200/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
                >
                  Lưu kết quả
                </button>
                <button 
                  onClick={() => window.print()}
                  className="w-full py-5 rounded-3xl flex items-center justify-center gap-3 font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider text-xs"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2h6a2 2 0 012 2v2" /></svg>
                  Xuất file PDF
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 no-print">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.894.448l6.82 10.33a1 1 0 010 1.046l-6.82 10.33a1 1 0 01-1.788 0l-6.82-10.33a1 1 0 010-1.046l6.82-10.33a1 1 0 01.894-.448zM12 4.14L6.812 12 12 19.86l5.188-7.86L12 4.14z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Mục tiêu tiếp theo</h3>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Bạn cần đạt trung bình <span className="text-gray-900 font-bold">{(gpa4 + 0.3).toFixed(1)}</span> ở 15 tín chỉ tiếp theo để nâng GPA lên <span className="text-[#3B66F5] font-black">{(gpa4 + 0.1).toFixed(2)}</span>.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tiến độ</span>
                <span className="text-sm font-black text-[#3B66F5]">{(gpa4 / 4 * 100).toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-blue-50 rounded-full overflow-hidden">
                <div className="h-full bg-[#3B66F5] rounded-full transition-all duration-1000 ease-out" style={{ width: `${(gpa4 / 4 * 100)}%` }}></div>
              </div>
              <div className="flex justify-between items-start mt-2">
                <span className="text-[10px] font-bold text-gray-300">KHỞI ĐẦU: 0.0</span>
                <span className="text-[10px] font-bold text-gray-900">MỤC TIÊU: 4.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPAPage;
