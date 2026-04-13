import React, { useState, useEffect } from 'react';
import { documentService, DocumentItem } from '../services/documents';
import { flashcardService } from '../services/flashcards';

interface FlashcardCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const FlashcardCreateModal: React.FC<FlashcardCreateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [classification, setClassification] = useState("Lý thuyết");
  const [difficulty, setDifficulty] = useState("VỪA");
  
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New state for bulk creation
  const [pendingCards, setPendingCards] = useState<{front: string; back: string}[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen]);

  const fetchDocuments = async () => {
    try {
      const response = await documentService.list({ page_size: 100 });
      setDocuments(response.items);
      if (response.items.length > 0) {
        setSelectedDocId(response.items[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  const handleAddCard = () => {
    if (!frontText || !backText) {
      setError("Vui lòng nhập đầy đủ mặt trước và mặt sau.");
      return;
    }
    setPendingCards([...pendingCards, { front: frontText, back: backText }]);
    setFrontText("");
    setBackText("");
    setError(null);
  };

  const handleSubmit = async () => {
    const cardsToSave = [...pendingCards];
    
    // Also include currently typed content if not empty
    if (frontText && backText) {
      cardsToSave.push({ front: frontText, back: backText });
    }

    if (cardsToSave.length === 0) {
      setError("Hãy nhập ít nhất một flashcard.");
      return;
    }

    if (!selectedDocId) {
      setError("Vui lòng chọn tài liệu.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await flashcardService.bulkCreate(
        cardsToSave.map(c => ({
          document_id: Number(selectedDocId),
          front: c.front,
          back: c.back
        }))
      );
      
      // Reset form
      setFrontText("");
      setBackText("");
      setPendingCards([]);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError("Không thể tạo flashcard. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-blue-900">Tạo Flashcard Mới</h2>
            <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">THÊM VÀO BỘ THẺ CỦA BẠN</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-10 space-y-6">
          
          {/* Document Selection */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-blue-800 uppercase tracking-wider">CHỌN TÀI LIỆU / MÔN HỌC</label>
            <div className="relative">
              <select 
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm appearance-none outline-none focus:border-blue-500 transition-all font-bold text-blue-900"
              >
                {documents.length === 0 && <option value="">Đang tải tài liệu...</option>}
                {documents.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.subject ? `[${doc.subject}] ` : ""}{doc.title}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Front Side */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-[11px] font-black text-blue-800 uppercase tracking-wider">MẶT TRƯỚC (CÂU HỎI)</label>
              <span className="text-[10px] font-bold text-gray-400 italic">Tối đa 250 ký tự</span>
            </div>
            <div className="relative">
              <textarea 
                value={frontText}
                onChange={(e) => setFrontText(e.target.value)}
                placeholder="Nhập câu hỏi hoặc thuật ngữ cần nhớ..."
                className="w-full h-28 bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all resize-none placeholder:text-gray-300"
              />
              <div className="absolute bottom-4 right-5 flex gap-4 text-gray-400">
                <button className="hover:text-blue-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
                <button className="hover:text-blue-500 font-serif font-black italic">B</button>
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div className="space-y-3">
             <div className="flex justify-between items-end">
              <label className="text-[11px] font-black text-blue-800 uppercase tracking-wider">MẶT SAU (CÂU TRẢ LỜI)</label>
              <span className="text-[10px] font-bold text-gray-400 italic">Chi tiết & ví dụ</span>
            </div>
            <div className="relative">
              <textarea 
                value={backText}
                onChange={(e) => setBackText(e.target.value)}
                placeholder="Nhập định nghĩa, lời giải hoặc ghi chú chi tiết..."
                className="w-full h-28 bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all resize-none placeholder:text-gray-300"
              />
              <div className="absolute bottom-4 right-5 flex gap-4 text-gray-400 items-center">
                <button className="hover:text-blue-500 transition-colors text-lg font-serif">Σ</button>
                <button className="hover:text-blue-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Classification & Difficulty */}
          <div className="grid grid-cols-2 gap-8 pt-2">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PHÂN LOẠI</label>
              <div className="relative">
                <select 
                   value={classification}
                   onChange={(e) => setClassification(e.target.value)}
                   className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm appearance-none outline-none focus:border-blue-500 transition-all font-bold text-blue-900"
                >
                  <option>Lý thuyết</option>
                  <option>Bài tập</option>
                  <option>Công thức</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center block">ĐỘ KHÓ DỰ KIẾN</label>
              <div className="flex bg-gray-50 p-1 rounded-xl gap-1">
                {["DỄ", "VỪA", "KHÓ"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${
                      difficulty === level 
                        ? "bg-white text-blue-600 shadow-sm border-blue-50" 
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center mt-2">{error}</p>}
        </div>

        {/* Footer Actions */}
        <div className="px-10 pt-8 pb-10 flex flex-col gap-4">
          {pendingCards.length > 0 && (
            <div className="flex items-center gap-2 mb-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">
                {pendingCards.length}
              </div>
              <span className="text-[11px] font-bold text-blue-800">Thẻ đang chờ lưu</span>
              <button 
                type="button"
                onClick={() => setPendingCards([])}
                className="ml-auto text-[10px] font-black text-gray-400 hover:text-red-500 uppercase"
              >
                Xóa hết
              </button>
            </div>
          )}
          
          <div className="flex gap-4">
            <button 
              type="button"
              disabled={isSubmitting}
              onClick={handleAddCard}
              className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-blue-600 rounded-2xl text-blue-600 font-black text-sm hover:bg-blue-50 transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tiếp tục thêm thẻ
            </button>
            <button 
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex-[1.5] flex items-center justify-center gap-2 py-4 bg-[#3B66F5] rounded-2xl text-white font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {isSubmitting ? "Đang lưu..." : "Lưu bộ flashcard"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FlashcardCreateModal;

