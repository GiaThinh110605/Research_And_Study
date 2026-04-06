import React from 'react';

interface UploadModalProps {
  isOpen: boolean;
  uploadTitle: string;
  uploadDescription: string;
  uploadSubject: string;
  isPublic: boolean;
  uploadError: string;
  isUploading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChangeUploadTitle: (value: string) => void;
  onChangeUploadDescription: (value: string) => void;
  onChangeUploadSubject: (value: string) => void;
  onChangeIsPublic: (value: boolean) => void;
  onFileChange: (file: File | null) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  uploadTitle,
  uploadDescription,
  uploadSubject,
  isPublic,
  uploadError,
  isUploading,
  onClose,
  onSubmit,
  onChangeUploadTitle,
  onChangeUploadDescription,
  onChangeUploadSubject,
  onChangeIsPublic,
  onFileChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="mb-2 text-xl font-bold text-slate-900">Tai tai lieu moi</h3>
        <p className="mb-4 text-sm text-slate-500">Ho tro dinh dang: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT. Kich thuoc toi da 10MB.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            value={uploadTitle}
            onChange={(e) => onChangeUploadTitle(e.target.value)}
            placeholder="Tieu de tai lieu"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
          />
          <textarea
            value={uploadDescription}
            onChange={(e) => onChangeUploadDescription(e.target.value)}
            placeholder="Mo ta ngan"
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
          />
          <input
            value={uploadSubject}
            onChange={(e) => onChangeUploadSubject(e.target.value)}
            placeholder="Mon hoc / Chuyen nganh"
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={isPublic} onChange={(e) => onChangeIsPublic(e.target.checked)} />
            Cho phep cong khai tai lieu
          </label>
          <input
            type="file"
            required
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
          />

          {uploadError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{uploadError}</div>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2">
              Huy
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isUploading ? 'Dang tai...' : 'Xac nhan tai len'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
