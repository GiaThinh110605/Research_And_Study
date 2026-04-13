import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { documentService, DocumentItem } from '../services/documents';
import { Loader2, BookOpen, BrainCircuit } from 'lucide-react';

const FlashcardListPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const res = await documentService.list({ page: 1, page_size: 100 });
        setDocuments(res.items);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Không thể tải danh sách tài liệu.');
      } finally {
        setLoading(false);
      }
    };
    loadDocuments();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#F4F7FE] min-h-full">
      <div>
        <p className="text-[10px] font-black tracking-widest text-[#3B66F5] uppercase mb-1">Học tập thông minh</p>
        <h2 className="text-3xl font-black text-gray-900">Thư viện Flashcard</h2>
        <p className="text-gray-500 font-medium mt-2">Chọn một tài liệu để bắt đầu ôn tập với bộ thẻ ghi nhớ 3D.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-transparent hover:border-blue-200 transition-all group">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-black text-gray-900 line-clamp-2 min-h-[3.5rem] mb-2">{doc.title}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">{doc.subject || 'Chủ đề chung'}</p>
            
            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
              <div className="flex items-center gap-2 text-slate-400">
                <BrainCircuit className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Học tập chủ động</span>
              </div>
              <Link 
                to={`/tai-lieu/${doc.id}?tab=flashcards`}
                className="inline-flex items-center justify-center bg-[#3B66F5] text-white px-5 py-2.5 rounded-xl font-black text-xs hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
              >
                HỌC NGAY
              </Link>
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && !error && (
        <div className="bg-white rounded-[32px] p-12 text-center border border-dashed border-gray-200">
          <p className="text-gray-500 font-bold">Chưa có tài liệu nào để học flashcard.</p>
        </div>
      )}
    </div>
  );
};

export default FlashcardListPage;
