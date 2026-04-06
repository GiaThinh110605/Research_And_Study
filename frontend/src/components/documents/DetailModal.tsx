import React, { useEffect, useState } from 'react';
import { DocumentItem } from '../../services/documents';

interface DetailModalProps {
  document: DocumentItem | null;
  apiBaseUrl: string;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ document, apiBaseUrl, onClose }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'preview'>('info');

  useEffect(() => {
    setActiveTab('info');
  }, [document?.id]);

  if (!document) return null;

  const resolveFileUrl = (fileUrl: string) => {
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    return `${apiBaseUrl}${fileUrl}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{document.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{document.subject || 'Chua phan loai'}</p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1 text-sm">
            Dong
          </button>
        </div>

        <div className="mb-4 flex gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'info' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Thong tin
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'preview' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PDF Viewer
          </button>
        </div>

        {activeTab === 'info' ? (
          <div className="space-y-5 rounded-xl border border-slate-200 p-5">
            <p className="text-slate-700">{document.description || 'Khong co mo ta.'}</p>

            <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Tac gia</p>
                <p className="font-medium text-slate-900">{document.uploader_name || 'Nguoi dung UniStudy'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Dinh dang</p>
                <p className="font-medium text-slate-900">{document.file_type}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Muc do chia se</p>
                <p className="font-medium text-slate-900">{document.is_public ? 'Cong khai' : 'Rieng tu'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Ngay dang</p>
                <p className="font-medium text-slate-900">{new Date(document.created_at).toLocaleString('vi-VN')}</p>
              </div>
            </div>

            <a
              href={resolveFileUrl(document.file_url)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Mo tai lieu goc
            </a>
          </div>
        ) : document.file_type.toUpperCase() === 'PDF' ? (
          <iframe
            src={resolveFileUrl(document.file_url)}
            title="PDF Viewer"
            className="h-[420px] w-full rounded-xl border border-slate-200"
          />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="mb-4 text-slate-600">Tai lieu nay khong phai PDF. Bam nut ben duoi de mo tep.</p>
            <a
              href={resolveFileUrl(document.file_url)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Mo tai lieu
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailModal;
