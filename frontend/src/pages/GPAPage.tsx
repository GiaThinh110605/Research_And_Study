import React, { useState } from 'react';
import { 
  Calculator, 
  Trash2, 
  Plus, 
  Target, 
  BookOpen, 
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  History,
  Info
} from 'lucide-react';
import { gpaService, SubjectCalculateResponse, SemesterCalculateResponse, CumulativeCalculateResponse } from '../services/gpa';

type TabType = 'subject' | 'semester' | 'cumulative';

const GPAPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('subject');

  // UC-01 State - Using strings to allow empty inputs
  const [subjectData, setSubjectData] = useState({
    credits: '3',
    midterm: '0',
    final: '0',
    regular: Array(9).fill(''),
    practical: Array(5).fill('')
  });
  const [subjectResult, setSubjectResult] = useState<SubjectCalculateResponse | null>(null);

  // UC-02 State
  const [semesterSubjects, setSemesterSubjects] = useState([
    { id: '1', name: 'Môn học 1', credits: '3', score10: '', score4: '' }
  ]);
  const [semesterResult, setSemesterResult] = useState<SemesterCalculateResponse | null>(null);

  // UC-03 State
  const [cumulativeSemesters, setCumulativeSemesters] = useState([
    { id: '1', name: 'Học kỳ 1', credits: '20', gpa10: '', gpa4: '' }
  ]);
  const [cumulativeResult, setCumulativeResult] = useState<CumulativeCalculateResponse | null>(null);

  // --- Helpers ---
  const clampValue = (val: string, min: number, max: number): string => {
    if (val === '') return '';
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    if (num < min) return min.toString();
    if (num > max) return max.toString();
    return val;
  };

  // --- UC-01 Handlers ---
  const handleCalculateSubject = async () => {
    try {
      const regScores = subjectData.regular.filter(s => s !== '').map(Number);
      const pracScores = subjectData.practical.filter(s => s !== '').map(Number);
      
      const res = await gpaService.calculateSubject({
        credits: parseInt(subjectData.credits) || 0,
        regular_scores: regScores,
        practical_scores: pracScores,
        midterm_score: parseFloat(subjectData.midterm) || 0,
        final_score: parseFloat(subjectData.final) || 0
      });
      setSubjectResult(res);
    } catch (err: any) {
      const msg = err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || err.message || 'Vui lòng kiểm tra lại dữ liệu nhập!';
      alert(msg);
    }
  };

  const handleClearSubject = () => {
    setSubjectData({
      credits: '3',
      midterm: '0',
      final: '0',
      regular: Array(9).fill(''),
      practical: Array(5).fill('')
    });
    setSubjectResult(null);
  };

  // --- UC-02 Handlers ---
  const addSemesterSubject = () => {
    setSemesterSubjects([...semesterSubjects, { id: Date.now().toString(), name: `Môn học ${semesterSubjects.length + 1}`, credits: '3', score10: '', score4: '' }]);
  };

  const removeSemesterSubject = (id: string) => {
    setSemesterSubjects(semesterSubjects.filter(s => s.id !== id));
  };

  const handleCalculateSemester = async () => {
    try {
      const subjects = semesterSubjects.map(s => ({
        name: s.name,
        credits: Number(s.credits) || 0,
        score_10: Number(s.score10) || 0,
        score_4: s.score4 ? Number(s.score4) : undefined
      }));
      const res = await gpaService.calculateSemester(subjects);
      setSemesterResult(res);
    } catch (err: any) {
      const msg = err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || err.message || 'Vui lòng kiểm tra lại dữ liệu nhập!';
      alert(msg);
    }
  };

  // --- UC-03 Handlers ---
  const addCumulativeSemester = () => {
    setCumulativeSemesters([...cumulativeSemesters, { id: Date.now().toString(), name: `Học kỳ ${cumulativeSemesters.length + 1}`, credits: '20', gpa10: '', gpa4: '' }]);
  };

  const removeCumulativeSemester = (id: string) => {
    setCumulativeSemesters(cumulativeSemesters.filter(s => s.id !== id));
  };

  const handleCalculateCumulative = async () => {
    try {
      const semesters = cumulativeSemesters.map(s => ({
        name: s.name,
        total_credits: Number(s.credits) || 0,
        gpa_10: Number(s.gpa10) || 0,
        gpa_4: s.gpa4 ? Number(s.gpa4) : undefined
      }));
      const res = await gpaService.calculateCumulative(semesters);
      setCumulativeResult(res);
    } catch (err: any) {
      const msg = err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || err.message || 'Vui lòng kiểm tra lại dữ liệu nhập!';
      alert(msg);
    }
  };

  const convert10to4 = (s10: number) => {
    if (s10 >= 9.0) return 4.0;
    if (s10 >= 8.5) return 3.8;
    if (s10 >= 8.0) return 3.5;
    if (s10 >= 7.0) return 3.0;
    if (s10 >= 6.0) return 2.5;
    if (s10 >= 5.5) return 2.0;
    if (s10 >= 5.0) return 1.5;
    if (s10 >= 4.0) return 1.0;
    return 0.0;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-1 flex items-center gap-1 mb-6">
        <button 
          onClick={() => setActiveTab('subject')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${activeTab === 'subject' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <FileText size={18} />
          Điểm môn học
        </button>
        <button 
          onClick={() => setActiveTab('semester')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${activeTab === 'semester' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <History size={18} />
          Điểm học kỳ
        </button>
        <button 
          onClick={() => setActiveTab('cumulative')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${activeTab === 'cumulative' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Award size={18} />
          Điểm tích lũy
        </button>
      </div>

      {/* Main Card Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-100 mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <Calculator className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              {activeTab === 'subject' && 'Nhập điểm các thành phần'}
              {activeTab === 'semester' && 'Nhập điểm các môn học trong học kỳ'}
              {activeTab === 'cumulative' && 'Nhập điểm tích lũy các học kỳ'}
            </h1>
          </div>
          <p className="text-indigo-100 font-medium max-w-xl text-lg">
            {activeTab === 'subject' && 'Điền đầy đủ thông tin các loại điểm để tính điểm tổng kết học phần theo đúng quy định của IUH.'}
            {activeTab === 'semester' && 'Thêm từng môn học đã hoàn thành để tính điểm trung bình chung học kỳ (GPA).'}
            {activeTab === 'cumulative' && 'Thêm điểm trung bình của từng học kỳ để tính điểm tích lũy toàn khóa (CGPA).'}
          </p>
        </div>
      </div>

      {/* --- TAB 1: SUBJECT --- */}
      {activeTab === 'subject' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Top 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 group hover:border-indigo-200 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <BookOpen size={18} />
                </div>
                <h3 className="font-black text-slate-400 uppercase tracking-widest text-[11px]">Số tín chỉ *</h3>
              </div>
              <input 
                type="number"
                min="1"
                value={subjectData.credits}
                onChange={(e) => setSubjectData({...subjectData, credits: e.target.value})}
                onBlur={(e) => setSubjectData({...subjectData, credits: clampValue(e.target.value, 1, 50)})}
                placeholder="3"
                className="w-full text-2xl font-black text-slate-900 focus:outline-none placeholder:text-slate-200"
              />
              <p className="text-[11px] text-slate-400 font-bold mt-2">Ví dụ: 3, 4, 5...</p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 group hover:border-blue-200 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <CheckCircle2 size={18} />
                </div>
                <h3 className="font-black text-slate-400 uppercase tracking-widest text-[11px]">Điểm giữa kỳ *</h3>
              </div>
              <input 
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={subjectData.midterm}
                onChange={(e) => setSubjectData({...subjectData, midterm: e.target.value})}
                onBlur={(e) => setSubjectData({...subjectData, midterm: clampValue(e.target.value, 0, 10)})}
                placeholder="8.5"
                className="w-full text-2xl font-black text-slate-900 focus:outline-none placeholder:text-slate-200"
              />
              <p className="text-[11px] text-blue-400 font-bold mt-2 italic">Thang điểm 10</p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 group hover:border-emerald-200 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Target size={18} />
                </div>
                <h3 className="font-black text-slate-400 uppercase tracking-widest text-[11px]">Điểm cuối kỳ *</h3>
              </div>
              <input 
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={subjectData.final}
                onChange={(e) => setSubjectData({...subjectData, final: e.target.value})}
                onBlur={(e) => setSubjectData({...subjectData, final: clampValue(e.target.value, 0, 10)})}
                placeholder="9.0"
                className="w-full text-2xl font-black text-slate-900 focus:outline-none placeholder:text-slate-200"
              />
              <p className="text-[11px] text-emerald-400 font-bold mt-2 italic">Thang điểm 10</p>
            </div>
          </div>

          {/* Regular Scores Grid */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                <div className="w-2 h-8 bg-orange-400 rounded-full"></div>
                Điểm thường xuyên*
              </h3>
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full">(Tối đa 9 cột)</span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-9 gap-4">
              {subjectData.regular.map((score, idx) => (
                <div key={idx} className="space-y-2">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter text-center">ĐIỂM {idx + 1}</p>
                  <input 
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={score}
                    onChange={(e) => {
                      const newReg = [...subjectData.regular];
                      newReg[idx] = e.target.value;
                      setSubjectData({...subjectData, regular: newReg});
                    }}
                    onBlur={(e) => {
                        const newReg = [...subjectData.regular];
                        newReg[idx] = clampValue(e.target.value, 0, 10);
                        setSubjectData({...subjectData, regular: newReg});
                    }}
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl text-center font-black text-slate-900 focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 focus:bg-white outline-none transition-all"
                  />
                </div>
              ))}
            </div>
            <p className="mt-6 text-[11px] text-slate-400 font-medium italic">* Nhập các điểm kiểm tra thường xuyên (để trống nếu không có)</p>
          </div>

          {/* Practical Scores Grid */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                <div className="w-2 h-8 bg-cyan-400 rounded-full"></div>
                Điểm thực hành*
              </h3>
              <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest bg-cyan-50 px-3 py-1.5 rounded-full">(Tối đa 5 cột)</span>
            </div>
            <div className="grid grid-cols-5 gap-6 max-w-4xl">
              {subjectData.practical.map((score, idx) => (
                <div key={idx} className="space-y-2">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter text-center">BÀI TH {idx + 1}</p>
                  <input 
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={score}
                    onChange={(e) => {
                      const newPrac = [...subjectData.practical];
                      newPrac[idx] = e.target.value;
                      setSubjectData({...subjectData, practical: newPrac});
                    }}
                    onBlur={(e) => {
                        const newPrac = [...subjectData.practical];
                        newPrac[idx] = clampValue(e.target.value, 0, 10);
                        setSubjectData({...subjectData, practical: newPrac});
                    }}
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl text-center font-black text-slate-900 focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400 focus:bg-white outline-none transition-all"
                  />
                </div>
              ))}
            </div>
            <p className="mt-6 text-[11px] text-slate-400 font-medium italic">* Nhập các điểm thực hành (để trống nếu không có)</p>
          </div>

          {/* Subject Result */}
          {subjectResult && (
            <div className="bg-indigo-50 border-2 border-indigo-100 rounded-3xl p-8 animate-in zoom-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">ĐIỂM TỔNG KẾT (10)</p>
                  <p className="text-5xl font-black text-indigo-700 tracking-tight">{subjectResult.score_10}</p>
                </div>
                <div className="text-center border-x border-indigo-200 px-8">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">ĐIỂM HỆ 4</p>
                  <p className="text-5xl font-black text-indigo-700 tracking-tight">{subjectResult.score_4}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">XẾP LOẠI</p>
                  <div className={`text-xl font-black uppercase tracking-widest py-2 px-4 rounded-xl inline-block mt-1 ${subjectResult.is_passed ? 'bg-indigo-600 text-white' : 'bg-rose-500 text-white'}`}>
                    {subjectResult.grade_letter} ({subjectResult.classification})
                  </div>
                </div>
                <div className="text-center flex flex-col items-center justify-center">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">TRẠNG THÁI</p>
                  <div className={`flex items-center gap-2 font-black uppercase text-sm ${subjectResult.is_passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {subjectResult.is_passed ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    {subjectResult.is_passed ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-8">
            <button 
              onClick={handleCalculateSubject}
              className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Calculator size={20} />
              Tính điểm
            </button>
            <button 
              onClick={handleClearSubject}
              className="flex items-center gap-3 bg-slate-800 text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-900 active:scale-95 transition-all"
            >
              <Trash2 size={20} />
              Xóa trắng
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 2: SEMESTER --- */}
      {activeTab === 'semester' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                  <BookOpen size={20} />
                </div>
                Danh sách môn học
              </h3>
            </div>
            
            <div className="p-8 space-y-4">
              {semesterSubjects.map((sub, idx) => (
                <div key={sub.id} className="flex flex-wrap md:flex-nowrap items-end gap-6 p-6 rounded-3xl border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-[200px] space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên môn học *</p>
                    <input 
                      type="text"
                      value={sub.name}
                      onChange={(e) => {
                        const newSubs = [...semesterSubjects];
                        newSubs[idx].name = e.target.value;
                        setSemesterSubjects(newSubs);
                      }}
                      className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                      placeholder="Nhập tên môn"
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số tín chỉ *</p>
                    <input 
                      type="number"
                      min="1"
                      value={sub.credits}
                      onChange={(e) => {
                        const newSubs = [...semesterSubjects];
                        newSubs[idx].credits = e.target.value;
                        setSemesterSubjects(newSubs);
                      }}
                      onBlur={(e) => {
                        const newSubs = [...semesterSubjects];
                        newSubs[idx].credits = clampValue(e.target.value, 1, 50);
                        setSemesterSubjects(newSubs);
                      }}
                      className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 font-black text-slate-900 focus:border-indigo-500 outline-none transition-all text-center"
                    />
                  </div>
                  <div className="w-40 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Điểm (Hệ 10) *</p>
                    <input 
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={sub.score10}
                      onChange={(e) => {
                        const newSubs = [...semesterSubjects];
                        newSubs[idx].score10 = e.target.value;
                        setSemesterSubjects(newSubs);
                      }}
                      onBlur={(e) => {
                        const newSubs = [...semesterSubjects];
                        newSubs[idx].score10 = clampValue(e.target.value, 0, 10);
                        setSemesterSubjects(newSubs);
                      }}
                      className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 font-black text-indigo-600 focus:border-indigo-500 outline-none transition-all text-center"
                      placeholder="0.0"
                    />
                  </div>
                  <div className="w-40 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hệ 4</p>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={sub.score4}
                      onChange={(e) => {
                        const newSubs = [...semesterSubjects];
                        newSubs[idx].score4 = e.target.value;
                        setSemesterSubjects(newSubs);
                      }}
                      onBlur={(e) => {
                        const newSubs = [...semesterSubjects];
                        newSubs[idx].score4 = clampValue(e.target.value, 0, 4);
                        setSemesterSubjects(newSubs);
                      }}
                      className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 font-black text-emerald-600 focus:border-emerald-500 outline-none transition-all text-center"
                      placeholder={sub.score10 ? convert10to4(Number(sub.score10)).toString() : 'Tự động'}
                    />
                  </div>
                  <button 
                    onClick={() => removeSemesterSubject(sub.id)}
                    className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              
              <button 
                onClick={addSemesterSubject}
                className="w-full py-5 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center gap-3 text-slate-400 font-black hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Plus size={20} />
                </div>
                Thêm môn học mới
              </button>
            </div>
          </div>

          {/* Semester Result Card */}
          {semesterResult && (
            <div className="bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-100 rounded-3xl p-10 shadow-xl shadow-indigo-50/50 flex flex-col md:flex-row items-center justify-between gap-10 animate-in zoom-in duration-300">
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-white rounded-[32px] shadow-lg shadow-indigo-100 flex items-center justify-center">
                  <Award className="text-indigo-600" size={48} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">GPA HỌC KỲ</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-7xl font-black text-indigo-700 tracking-tighter">{semesterResult.gpa_4}</h2>
                    <span className="text-2xl font-bold text-slate-300">/ 4.0</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 min-w-[140px] text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GPA HỆ 10</p>
                  <p className="text-3xl font-black text-slate-900">{semesterResult.gpa_10}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 min-w-[140px] text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TỔNG TÍN CHỈ</p>
                  <p className="text-3xl font-black text-slate-900">{semesterResult.total_credits}</p>
                </div>
                <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-200 min-w-[140px] text-center">
                  <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1">XẾP LOẠI</p>
                  <p className="text-2xl font-black text-white">{semesterResult.classification}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 pt-8">
            <button 
              onClick={handleCalculateSemester}
              className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Calculator size={20} />
              Tính GPA học kỳ
            </button>
            <button 
              onClick={() => {
                setSemesterSubjects([{ id: '1', name: 'Môn học 1', credits: '3', score10: '', score4: '' }]);
                setSemesterResult(null);
              }}
              className="flex items-center gap-3 bg-slate-800 text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-900 active:scale-95 transition-all"
            >
              <Trash2 size={20} />
              Xóa trắng
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 3: CUMULATIVE --- */}
      {activeTab === 'cumulative' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-violet-600">
                  <Target size={20} />
                </div>
                Kết quả học kỳ đã học
              </h3>
            </div>
            
            <div className="p-8 space-y-4">
              {cumulativeSemesters.map((sem, idx) => (
                <div key={sem.id} className="flex flex-wrap md:flex-nowrap items-end gap-6 p-6 rounded-3xl border border-slate-50 hover:border-violet-100 hover:bg-violet-50/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-[200px] space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên học kỳ *</p>
                    <input 
                      type="text"
                      value={sem.name}
                      onChange={(e) => {
                        const newSems = [...cumulativeSemesters];
                        newSems[idx].name = e.target.value;
                        setCumulativeSemesters(newSems);
                      }}
                      className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 outline-none transition-all"
                      placeholder="Học kỳ 1"
                    />
                  </div>
                  <div className="w-40 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng tín chỉ *</p>
                    <input 
                      type="number"
                      min="1"
                      value={sem.credits}
                      onChange={(e) => {
                        const newSems = [...cumulativeSemesters];
                        newSems[idx].credits = e.target.value;
                        setCumulativeSemesters(newSems);
                      }}
                      onBlur={(e) => {
                        const newSems = [...cumulativeSemesters];
                        newSems[idx].credits = clampValue(e.target.value, 1, 500);
                        setCumulativeSemesters(newSems);
                      }}
                      className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 font-black text-slate-900 focus:border-violet-500 outline-none transition-all text-center"
                    />
                  </div>
                  <div className="w-40 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GPA Hệ 10 *</p>
                    <input 
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={sem.gpa10}
                      onChange={(e) => {
                        const newSems = [...cumulativeSemesters];
                        newSems[idx].gpa10 = e.target.value;
                        setCumulativeSemesters(newSems);
                      }}
                      onBlur={(e) => {
                        const newSems = [...cumulativeSemesters];
                        newSems[idx].gpa10 = clampValue(e.target.value, 0, 10);
                        setCumulativeSemesters(newSems);
                      }}
                      className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 font-black text-violet-600 focus:border-violet-500 outline-none transition-all text-center"
                      placeholder="0.0"
                    />
                  </div>
                  <div className="w-40 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GPA Hệ 4</p>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={sem.gpa4}
                      onChange={(e) => {
                        const newSems = [...cumulativeSemesters];
                        newSems[idx].gpa4 = e.target.value;
                        setCumulativeSemesters(newSems);
                      }}
                      onBlur={(e) => {
                        const newSems = [...cumulativeSemesters];
                        newSems[idx].gpa4 = clampValue(e.target.value, 0, 4);
                        setCumulativeSemesters(newSems);
                      }}
                      className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 font-black text-emerald-600 focus:border-emerald-500 outline-none transition-all text-center"
                      placeholder={sem.gpa10 ? convert10to4(Number(sem.gpa10)).toString() : 'Tự động'}
                    />
                  </div>
                  <button 
                    onClick={() => removeCumulativeSemester(sem.id)}
                    className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              
              <button 
                onClick={addCumulativeSemester}
                className="w-full py-5 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center gap-3 text-slate-400 font-black hover:border-violet-500 hover:text-violet-600 hover:bg-violet-50/50 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-violet-500 group-hover:text-white transition-all">
                  <Plus size={20} />
                </div>
                Thêm học kỳ mới
              </button>
            </div>
          </div>

          {/* Cumulative Result Card */}
          {cumulativeResult && (
            <div className="bg-gradient-to-br from-violet-50 to-white border-2 border-violet-100 rounded-3xl p-10 shadow-xl shadow-violet-50/50 flex flex-col md:flex-row items-center justify-between gap-10 animate-in zoom-in duration-300">
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-white rounded-[32px] shadow-lg shadow-violet-100 flex items-center justify-center">
                  <Target className="text-violet-600" size={48} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-violet-400 uppercase tracking-[0.2em] mb-2">GPA TÍCH LŨY (CGPA)</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-7xl font-black text-violet-700 tracking-tighter">{cumulativeResult.cgpa_4}</h2>
                    <span className="text-2xl font-bold text-slate-300">/ 4.0</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 min-w-[140px] text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CGPA HỆ 10</p>
                  <p className="text-3xl font-black text-slate-900">{cumulativeResult.cgpa_10}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 min-w-[140px] text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TỔNG TÍN CHỈ</p>
                  <p className="text-3xl font-black text-slate-900">{cumulativeResult.total_credits}</p>
                </div>
                <div className="bg-violet-600 p-6 rounded-3xl shadow-lg shadow-violet-200 min-w-[140px] text-center">
                  <p className="text-[10px] font-black text-violet-100 uppercase tracking-widest mb-1">XẾP LOẠI</p>
                  <p className="text-2xl font-black text-white">{cumulativeResult.classification}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 pt-8">
            <button 
              onClick={handleCalculateCumulative}
              className="flex items-center gap-3 bg-violet-600 text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-violet-200 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Calculator size={20} />
              Tính GPA tích lũy
            </button>
            <button 
              onClick={() => {
                setCumulativeSemesters([{ id: '1', name: 'Học kỳ 1', credits: '20', gpa10: '', gpa4: '' }]);
                setCumulativeResult(null);
              }}
              className="flex items-center gap-3 bg-slate-800 text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-900 active:scale-95 transition-all"
            >
              <Trash2 size={20} />
              Xóa trắng
            </button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-12 text-center space-y-4">
        <h4 className="text-xl font-black text-slate-800">Giới thiệu công cụ tính GPA cho sinh viên IUH</h4>
        <p className="text-slate-500 text-sm max-w-3xl mx-auto leading-relaxed">
          Công cụ hỗ trợ sinh viên tính điểm trung bình học phần, điểm trung bình học kỳ và điểm tích lũy theo quy chế đào tạo tín chỉ của IUH. Hệ thống tự động chuyển đổi từ thang điểm 10 sang thang điểm 4 và xếp loại học lực tương ứng.
        </p>
        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full w-fit mx-auto">
          <Info size={14} />
          Lưu ý: Kết quả tính toán chỉ mang tính chất tham khảo dựa trên dữ liệu bạn nhập vào.
        </div>
      </div>
    </div>
  );
};

export default GPAPage;
