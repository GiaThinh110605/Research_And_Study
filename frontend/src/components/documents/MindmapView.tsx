import React, { useState } from 'react';

interface MindmapNodeData {
  text: string;
  children?: MindmapNodeData[];
}

interface MindmapNodeProps {
  node: MindmapNodeData;
  level: number;
}

const MindmapNode: React.FC<MindmapNodeProps> = ({ node, level }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`ml-${level > 0 ? '6' : '0'} mt-3`}>
      <div 
        className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
          level === 0 
            ? 'bg-gradient-to-r from-[#3B66F5] to-[#5E6AD2] text-white border-transparent shadow-lg shadow-blue-100' 
            : 'bg-white border-slate-100 text-slate-700 hover:border-blue-300 hover:shadow-md'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${level === 0 ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
          {hasChildren ? (
            <svg 
              className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <div className="h-1.5 w-1.5 rounded-full bg-current" />
          )}
        </div>
        <span className={`text-sm font-bold ${level === 0 ? 'text-white' : 'text-slate-800'}`}>
          {node.text}
        </span>
      </div>

      {hasChildren && isOpen && (
        <div className="relative mt-2">
          {/* Vertical line connector */}
          <div className="absolute left-[11px] top-0 bottom-4 w-px bg-slate-200" />
          
          <div className="space-y-1">
            {node.children?.map((child, idx) => (
              <div key={idx} className="relative">
                {/* Horizontal line connector */}
                <div className="absolute left-[11px] top-7 w-4 h-px bg-slate-200" />
                <MindmapNode node={child} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface MindmapViewProps {
  data: any;
  isLoading?: boolean;
}

const MindmapView: React.FC<MindmapViewProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        <p className="mt-4 text-sm font-bold text-slate-500">AI đang vẽ sơ đồ tư duy...</p>
      </div>
    );
  }

  if (!data || (!data.root && !data.text)) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50">
        <p className="text-sm text-slate-500">Chưa có sơ đồ tư duy. Hãy nhấn "Tạo Mindmap" để AI phân tích tài liệu.</p>
      </div>
    );
  }

  // Handle different potential JSON structures from AI
  const rootNode = data.root || data;

  return (
    <div className="mindmap-container animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Sơ đồ cấu trúc</h4>
        <button 
          onClick={() => window.print()} 
          className="text-[10px] font-bold text-blue-600 hover:underline"
        >
          Xuất PDF
        </button>
      </div>
      <div className="overflow-x-auto pb-4">
        <MindmapNode node={rootNode} level={0} />
      </div>
    </div>
  );
};

export default MindmapView;
