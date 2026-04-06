import React from 'react';
import { DocumentItem, ShareItem } from '../../services/documents';

interface ShareModalProps {
  isOpen: boolean;
  document: DocumentItem | null;
  shareTargetEmail: string;
  sharePermission: 'view' | 'edit' | 'comment';
  shareItems: ShareItem[];
  shareError: string;
  isSharing: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChangeShareTargetEmail: (value: string) => void;
  onChangeSharePermission: (value: 'view' | 'edit' | 'comment') => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  document,
  shareTargetEmail,
  sharePermission,
  shareItems,
  shareError,
  isSharing,
  onClose,
  onSubmit,
  onChangeShareTargetEmail,
  onChangeSharePermission,
}) => {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-xl font-bold text-slate-900">Chia se: {document.title}</h3>
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1 text-sm">
            Dong
          </button>
        </div>

        <form onSubmit={onSubmit} className="mb-6 grid gap-3 sm:grid-cols-3">
          <input
            type="email"
            required
            value={shareTargetEmail}
            onChange={(e) => onChangeShareTargetEmail(e.target.value)}
            placeholder="Email nguoi nhan"
            className="sm:col-span-2 rounded-lg border border-slate-300 px-4 py-2"
          />
          <select
            value={sharePermission}
            onChange={(e) => onChangeSharePermission(e.target.value as 'view' | 'edit' | 'comment')}
            className="rounded-lg border border-slate-300 px-4 py-2"
          >
            <option value="view">Xem</option>
            <option value="comment">Binh luan</option>
            <option value="edit">Chinh sua</option>
          </select>
          <button
            type="submit"
            disabled={isSharing}
            className="sm:col-span-3 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isSharing ? 'Dang chia se...' : 'Gui loi moi chia se'}
          </button>
        </form>

        {shareError && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{shareError}</div>}

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Danh sach da chia se</h4>
          {shareItems.length === 0 ? (
            <p className="text-sm text-slate-500">Chua co chia se nao.</p>
          ) : (
            <div className="space-y-2">
              {shareItems.map((share) => (
                <div key={share.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2 text-sm">
                  <span>{share.shared_with_email || `User ${share.shared_with_user_id}`}</span>
                  <span className="font-semibold text-blue-700">{share.permission}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
