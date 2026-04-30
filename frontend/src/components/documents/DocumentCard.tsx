import React from 'react';
import { DocumentItem } from '../../services/documents';
import { FileText, MoreHorizontal, Download, Share2, Eye } from 'lucide-react';

interface DocumentCardProps {
  document: DocumentItem;
  currentUserId: number | null;
  viewMode: 'grid' | 'list';
  onOpenDetail: (documentId: number) => void;
  onOpenShare: (document: DocumentItem) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  currentUserId,
  viewMode,
  onOpenDetail,
  onOpenShare,
}) => {
  const isGrid = viewMode === 'grid';

  if (!isGrid) {
    return (
      <div 
        onClick={() => onOpenDetail(document.id)}
        className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer"
      >
        <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors shrink-0">
          <FileText className="text-slate-400 group-hover:text-indigo-600" size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-indigo-50 text-[10px] font-black text-indigo-600 rounded-lg uppercase tracking-wider border border-indigo-100">
              {document.subject || 'Chung'}
            </span>
            <span className="text-[10px] font-bold text-slate-400">• {new Date(document.created_at).toLocaleDateString('vi-VN')}</span>
          </div>
          <h4 className="font-bold text-slate-900 truncate group-hover:text-indigo-900 transition-colors">{document.title}</h4>
          <p className="text-xs text-slate-500 font-medium truncate">{document.description || 'Không có mô tả'}</p>
        </div>
        <div className="flex items-center gap-2 px-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đăng bởi</p>
            <p className="text-xs font-bold text-slate-700">{document.uploader_name || 'Anonymous'}</p>
          </div>
          <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onOpenDetail(document.id)}
      className="group flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-sm shadow-slate-200/50 hover:shadow-xl hover:shadow-indigo-200/30 hover:border-indigo-100 transition-all duration-300 cursor-pointer overflow-hidden h-full"
    >
      {/* Card Preview Area */}
      <div className="relative h-48 bg-slate-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 group-hover:from-indigo-500/10 group-hover:to-violet-500/10 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center p-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <div className="w-full h-full bg-white rounded-t-xl shadow-2xl shadow-indigo-200/20 border-x border-t border-slate-100 flex flex-col p-4 space-y-2">
            <div className="w-full h-2 bg-slate-50 rounded-full" />
            <div className="w-2/3 h-2 bg-slate-50 rounded-full" />
            <div className="w-full h-2 bg-slate-50 rounded-full" />
            <div className="w-1/2 h-2 bg-slate-50 rounded-full" />
            <div className="flex-1 flex items-center justify-center">
              <FileText className="text-indigo-100 group-hover:text-indigo-200 transition-colors" size={48} />
            </div>
          </div>
        </div>
        
        {/* Type Badge */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md border border-white rounded-xl shadow-sm">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{document.file_type || 'DOC'}</span>
        </div>
        
        {/* Quick Actions Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
          <button 
            onClick={(e) => { e.stopPropagation(); onOpenShare(document); }}
            className="p-2 bg-white rounded-xl shadow-lg text-slate-400 hover:text-indigo-600 hover:scale-110 transition-all"
          >
            <Share2 size={18} />
          </button>
          <button className="p-2 bg-white rounded-xl shadow-lg text-slate-400 hover:text-emerald-600 hover:scale-110 transition-all">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Card Info Area */}
      <div className="p-6 flex flex-col flex-1 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-50 text-[10px] font-black text-indigo-600 rounded-lg uppercase tracking-widest border border-indigo-100">
              {document.subject || 'Chung'}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {new Date(document.created_at).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <h4 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight tracking-tight">
            {document.title}
          </h4>
        </div>

        <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed flex-1">
          {document.description || 'Chưa có mô tả cho tài liệu này.'}
        </p>

        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-[10px] font-black text-indigo-600">
              {document.uploader_name?.charAt(0) || 'U'}
            </div>
            <span className="text-[11px] font-bold text-slate-600 truncate max-w-[100px]">
              {document.uploader_name || 'Anonymous'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px]">
            <Eye size={14} />
            {Math.floor(Math.random() * 500) + 100}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
