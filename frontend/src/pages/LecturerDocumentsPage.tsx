import React from 'react';
import { FileText, Download, Filter, ListFilter, MoreVertical, ExternalLink, ChevronDown } from 'lucide-react';

const LecturerDocumentsPage: React.FC = () => {
    const stats = [
        { label: 'Tổng tài liệu', value: '1,284', sub: '+12 TUẦN NÀY', icon: <FileText className="w-5 h-5 text-blue-500" />, subColor: 'text-green-500' },
        { label: 'Lượt tải về', value: '45.2k', sub: 'XU HƯỚNG TĂNG', icon: <Download className="w-5 h-5 text-blue-500" />, subColor: 'text-blue-500' },
    ];

    const documents = [
        { id: 1, title: 'Giáo trình Giải tích 1 - Hệ thống bài tập nâng cao', type: 'PDF', typeColor: 'bg-red-50 text-red-600', updatedAt: '12 Th08, 2023', tags: ['TOÁN HỌC', 'KỲ 1'], downloads: '2.4k' },
        { id: 2, title: 'Đề cương chi tiết: Quản trị dự án CNTT', type: 'DOCX', typeColor: 'bg-blue-50 text-blue-600', updatedAt: '05 Th09, 2023', tags: ['QUẢN TRỊ', 'CNTT'], downloads: '856' },
        { id: 3, title: 'Bài giảng: Kiến trúc máy tính hiện đại', type: 'PPTX', typeColor: 'bg-orange-50 text-orange-600', updatedAt: '28 Th08, 2023', tags: ['LECTURE', 'KIẾN TRÚC'], downloads: '1.2k' },
        { id: 4, title: 'Tài liệu tham khảo: Big Data & AI', type: 'PDF', typeColor: 'bg-red-50 text-red-600', updatedAt: '15 Th09, 2023', tags: ['DỮ LIỆU', 'AI'], downloads: '3.1k' },
        { id: 5, title: 'Báo cáo thực tập tốt nghiệp: Mẫu chuẩn...', type: 'DOCX', typeColor: 'bg-blue-50 text-blue-600', updatedAt: '20 Th09, 2023', tags: ['SINH VIÊN', 'MẪU BÁO CÁO'], downloads: '5.4k' },
        { id: 6, title: 'Giáo trình Logic học đại cương - Tái bản', type: 'PDF', typeColor: 'bg-red-50 text-red-600', updatedAt: '01 Th10, 2023', tags: ['TRIẾT HỌC', 'CƠ BẢN'], downloads: '942' }
    ];

    return (
        <div className="p-8 space-y-10 bg-[#F4F7FE] min-h-full">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black tracking-widest text-[#3B66F5] uppercase mb-1">Thư viện số</p>
                <h2 className="text-3xl font-black text-gray-900">Thư viện tài liệu học thuật</h2>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 border border-gray-100 hover:bg-gray-50 transition">
                  <Filter className="w-4 h-4" />
                  Bộ lọc
                </button>
                <button className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 border border-gray-100 hover:bg-gray-50 transition">
                  <ListFilter className="w-4 h-4" />
                  Sắp xếp
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-12 gap-6">
              {stats.map((s, idx) => (
                <div key={idx} className="col-span-3 bg-white p-7 rounded-[2rem] border border-gray-50 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-blue-50 transition-all duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      {s.icon}
                    </div>
                  </div>
                  <div className="text-4xl font-black text-gray-900 mb-1 leading-none">{s.value}</div>
                  <p className={`text-[10px] font-black tracking-widest uppercase ${s.subColor}`}>{s.sub}</p>
                </div>
              ))}

              {/* Storage Card */}
              <div className="col-span-6 bg-gradient-to-br from-[#3B66F5] to-blue-700 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <h3 className="font-black text-xl mb-1">Dung lượng lưu trữ</h3>
                    <p className="text-xs text-blue-100 font-medium">Gói Academic Premium đang được sử dụng</p>
                  </div>
                  <div className="mt-8 space-y-3">
                    <div className="flex justify-between items-end text-xs font-black tracking-widest">
                      <p className="uppercase">78% đã dùng</p>
                      <p>15.6 GB / 20 GB</p>
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full w-[78%] relative">
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-2xl hover:shadow-blue-50 transition-all duration-500 overflow-hidden flex flex-col group">
                  <div className="p-8 pb-4">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest ${doc.typeColor}`}>
                        {doc.type}
                      </div>
                      <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    <h4 className="text-lg font-black text-gray-900 leading-tight mb-2 group-hover:text-[#3B66F5] transition-colors line-clamp-2 h-14">
                      {doc.title}
                    </h4>
                    <p className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">Cập nhật: {doc.updatedAt}</p>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {doc.tags.map(tag => (
                        <span key={tag} className="px-3 py-1.5 bg-gray-50 rounded-lg text-[9px] font-black text-gray-400 tracking-widest">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-auto p-8 pt-0 flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" />
                      {doc.downloads} lượt tải
                    </p>
                    <button className="flex items-center gap-2 text-[#3B66F5] text-sm font-black tracking-widest uppercase hover:gap-3 transition-all">
                      Xem ngay
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="flex justify-center pt-8">
              <button className="flex items-center gap-3 bg-white px-8 py-4 rounded-[1.5rem] border border-gray-50 shadow-sm text-sm font-black text-gray-600 hover:bg-gray-50 transition-all group">
                Xem thêm tài liệu
                <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </button>
            </div>
            <div className="h-4"></div>
        </div>
    );
};

export default LecturerDocumentsPage;
