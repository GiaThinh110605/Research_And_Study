import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { flashcardService, FlashcardItem } from '../services/flashcards';
import { documentService, DocumentItem } from '../services/documents';

const LecturerFlashcardsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | ''>('');

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [docRes, flashRes] = await Promise.all([
        documentService.list({ page: 1, page_size: 100 }),
        flashcardService.list(),
      ]);
      setDocuments(docRes.items);
      setFlashcards(flashRes);
      if (docRes.items.length > 0 && selectedDocumentId === '') {
        setSelectedDocumentId(docRes.items[0].id);
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Khong the tai du lieu flashcard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredFlashcards = useMemo(() => {
    if (selectedDocumentId === '') return flashcards;
    return flashcards.filter((item) => item.document_id === selectedDocumentId);
  }, [flashcards, selectedDocumentId]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedDocumentId === '') {
      setError('Vui long chon tai lieu truoc khi tao flashcard.');
      return;
    }
    if (!front.trim() || !back.trim()) {
      setError('Mat truoc va mat sau flashcard khong duoc de trong.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const created = await flashcardService.create({
        document_id: selectedDocumentId,
        front: front.trim(),
        back: back.trim(),
      });
      setFlashcards((prev) => [created, ...prev]);
      setFront('');
      setBack('');
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Tao flashcard that bai.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Ban co chac chan muon xoa flashcard nay?');
    if (!confirmed) return;

    try {
      await flashcardService.remove(id);
      setFlashcards((prev) => prev.filter((item) => item.id !== id));
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Xoa flashcard that bai.');
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#F4F7FE] min-h-full">
      <div>
        <p className="text-[10px] font-black tracking-widest text-[#3B66F5] uppercase mb-1">Giang vien</p>
        <h2 className="text-3xl font-black text-gray-900">Quan ly Flashcard</h2>
        <p className="text-gray-500 font-medium mt-2">Tao bo the ghi nho theo tung tai lieu de ho tro sinh vien on tap nhanh.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-black text-gray-900 mb-4">Tao flashcard moi</h3>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div>
              <label className="block text-xs font-black tracking-widest text-gray-400 uppercase mb-2">Tai lieu</label>
              <select
                value={selectedDocumentId}
                onChange={(e) => setSelectedDocumentId(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
              >
                {documents.length === 0 ? (
                  <option value="">Chua co tai lieu</option>
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
              <label className="block text-xs font-black tracking-widest text-gray-400 uppercase mb-2">Mat truoc</label>
              <textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
                placeholder="Nhap cau hoi/goi y"
              />
            </div>

            <div>
              <label className="block text-xs font-black tracking-widest text-gray-400 uppercase mb-2">Mat sau</label>
              <textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
                placeholder="Nhap dap an/noi dung giai thich"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || documents.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3B66F5] px-4 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Them flashcard
            </button>
          </form>
        </div>

        <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-gray-900">Danh sach flashcard</h3>
            <button
              onClick={loadData}
              className="text-sm font-black text-[#3B66F5] hover:text-blue-700"
            >
              Tai lai
            </button>
          </div>

          {loading ? (
            <div className="py-10 flex items-center justify-center text-gray-500 font-semibold">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Dang tai du lieu...
            </div>
          ) : filteredFlashcards.length === 0 ? (
            <div className="py-10 text-center text-gray-500 font-semibold">
              Chua co flashcard nao cho tai lieu dang chon.
            </div>
          ) : (
            <div className="space-y-4 max-h-[540px] overflow-y-auto pr-1">
              {filteredFlashcards.map((item) => (
                <div key={item.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black tracking-widest text-blue-500 uppercase">Mat truoc</p>
                      <p className="text-sm font-semibold text-gray-800">{item.front}</p>
                      <p className="text-[10px] font-black tracking-widest text-emerald-500 uppercase mt-3">Mat sau</p>
                      <p className="text-sm font-semibold text-gray-700">{item.back}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
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
  );
};

export default LecturerFlashcardsPage;
