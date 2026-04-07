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
  onSubmit: (event: React.FormEvent) => void;
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Chia sẻ tài liệu</h3>
            <p className="mt-1 text-sm text-slate-500">{document?.title || 'Tài liệu'}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input
            type="email"
            value={shareTargetEmail}
            onChange={(event) => onChangeShareTargetEmail(event.target.value)}
            placeholder="Email người nhận"
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            required
          />

          <select
            value={sharePermission}
            onChange={(event) => onChangeSharePermission(event.target.value as 'view' | 'edit' | 'comment')}
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
          >
            <option value="view">Chỉ xem</option>
            <option value="comment">Bình luận</option>
            <option value="edit">Chỉnh sửa</option>
          </select>

          {shareError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{shareError}</div>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
              Hủy
            </button>
            <button type="submit" disabled={isSharing} className="rounded-lg bg-[#3B66F5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {isSharing ? 'Đang chia sẻ...' : 'Chia sẻ'}
            </button>
          </div>
        </form>

        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-slate-700">Đã chia sẻ với</p>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
            {shareItems.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có người nhận nào.</p>
            ) : (
              shareItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                  <span className="font-medium text-slate-700">{item.shared_with_email}</span>
                  <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{item.permission}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
