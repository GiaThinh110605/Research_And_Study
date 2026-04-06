import React from 'react';
import { DocumentItem } from '../../services/documents';

interface DocumentCardProps {
  document: DocumentItem;
  currentUserId: number | null;
  onOpenDetail: (documentId: number) => void;
  onOpenShare: (document: DocumentItem) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  currentUserId,
  onOpenDetail,
  onOpenShare,
}) => {
  return (
    <div className="flex flex-col overflow-hidden transition-all bg-white border border-slate-100 rounded-2xl hover:shadow-lg hover:-translate-y-1">
      <div className="relative h-40 bg-slate-100">
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <span className="text-lg font-black tracking-wide text-indigo-600">{document.file_type}</span>
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-white/90 backdrop-blur-sm rounded shadow-sm">
          <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
          {document.file_type}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded uppercase tracking-wider">
            {document.subject || 'Chua phan loai'}
          </span>
          <span className="text-xs font-medium text-slate-400">• {new Date(document.created_at).toLocaleDateString('vi-VN')}</span>
        </div>

        <h4 className="mb-2 font-bold leading-snug line-clamp-2 text-slate-900">{document.title}</h4>
        <p className="mb-4 text-sm text-slate-500 line-clamp-2">{document.description || 'Khong co mo ta'}</p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">{document.uploader_name || 'Nguoi dung UniStudy'}</span>
          </div>
          <button
            onClick={() => onOpenDetail(document.id)}
            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Chi tiet
          </button>
        </div>

        {currentUserId && document.uploader_id === currentUserId && (
          <button
            onClick={() => onOpenShare(document)}
            className="mt-3 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
          >
            Chia se tai lieu
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
