import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Layers, BookOpenText } from 'lucide-react';
import { documentService, DocumentItem } from '../services/documents';
import { flashcardService, FlashcardItem } from '../services/flashcards';

const LecturerFlashcardsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const selectedDocument = useMemo(
    () => documents.find((doc) => doc.id === selectedDocumentId) || null,
    [documents, selectedDocumentId],
  );

  const loadDocuments = async () => {
    try {
      const response = await documentService.list({ page: 1, page_size: 100, sort: 'newest' });
      setDocuments(response.items);
      if (response.items.length > 0) {
        setSelectedDocumentId((prev) => prev ?? response.items[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể tải danh sách tài liệu.');
    }
  };

  const loadFlashcards = async (documentId: number | null) => {
    if (!documentId) {
      setFlashcards([]);
      return;
    }

    try {
      const response = await flashcardService.list(documentId);
      setFlashcards(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể tải flashcard.');
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      setError('');
      await loadDocuments();
      setIsLoading(false);
    };

    bootstrap();
  }, []);

  useEffect(() => {
    loadFlashcards(selectedDocumentId);
  }, [selectedDocumentId]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedDocumentId) {
      setError('Vui lòng chọn tài liệu trước khi tạo flashcard.');
      return;
    }

    if (!front.trim() || !back.trim()) {
      setError('Mặt trước và mặt sau không được để trống.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await flashcardService.create({
        document_id: selectedDocumentId,
        front: front.trim(),
        back: back.trim(),
      });
      setFront('');
      setBack('');
      await loadFlashcards(selectedDocumentId);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Tạo flashcard thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (flashcardId: number) => {
    try {
      await flashcardService.remove(flashcardId);
      await loadFlashcards(selectedDocumentId);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Xóa flashcard thất bại.');
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#F4F7FE] min-h-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Giảng viên Flashcard</h2>
          <p className="text-gray-500">Tạo thẻ ghi nhớ nhanh từ tài liệu đang giảng dạy để hỗ trợ ôn tập cho sinh viên.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 border border-gray-100">
          <Layers className="w-4 h-4 text-[#3B66F5]" />
          <span className="text-sm font-semibold text-gray-700">Tổng thẻ: {flashcards.length}</span>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-4">Tạo flashcard mới</h3>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Tài liệu</label>
              <select
                value={selectedDocumentId || ''}
                onChange={(event) => setSelectedDocumentId(Number(event.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm"
                disabled={isLoading || documents.length === 0}
              >
                {documents.length === 0 ? (
                  <option value="">Chưa có tài liệu để tạo flashcard</option>
                ) : (
                  documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Mặt trước</label>
              <textarea
                rows={4}
                value={front}
                onChange={(event) => setFront(event.target.value)}
                placeholder="Ví dụ: Định nghĩa chuẩn hóa CSDL là gì?"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Mặt sau</label>
              <textarea
                rows={5}
                value={back}
                onChange={(event) => setBack(event.target.value)}
                placeholder="Chuẩn hóa là quá trình tổ chức dữ liệu để giảm dư thừa và phụ thuộc..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving || !selectedDocumentId}
              className="inline-flex items-center gap-2 rounded-xl bg-[#3B66F5] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              {isSaving ? 'Đang lưu...' : 'Thêm flashcard'}
            </button>
          </form>
        </section>

        <section className="xl:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900">Danh sách flashcard</h3>
            <span className="text-sm font-semibold text-gray-500">
              {selectedDocument ? `Tài liệu: ${selectedDocument.title}` : 'Chưa chọn tài liệu'}
            </span>
          </div>

          {isLoading ? (
            <div className="text-sm text-gray-500">Đang tải dữ liệu...</div>
          ) : flashcards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
              <BookOpenText className="w-10 h-10 mx-auto text-gray-400 mb-3" />
              <p className="font-bold text-gray-700">Chưa có flashcard cho tài liệu này</p>
              <p className="text-sm text-gray-500 mt-1">Hãy tạo thẻ đầu tiên để bắt đầu bộ ôn tập.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
              {flashcards.map((card, index) => (
                <div key={card.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-black tracking-wider text-[#3B66F5] uppercase">Thẻ #{index + 1}</p>
                      <p className="mt-2 text-sm font-bold text-gray-900">Q: {card.front}</p>
                      <p className="mt-2 text-sm text-gray-700">A: {card.back}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="rounded-lg border border-red-200 bg-white px-3 py-2 text-red-600 hover:bg-red-50"
                      title="Xóa flashcard"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LecturerFlashcardsPage;
