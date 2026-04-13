import React from 'react';

const LecturerFlashcardsPage: React.FC = () => {
  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <p className="text-[10px] font-black tracking-widest text-[#3B66F5] uppercase mb-2">Giang vien</p>
        <h1 className="text-3xl font-black text-gray-900 mb-3">Trang Flashcard</h1>
        <p className="text-gray-600 font-medium">
          Da vao duoc trang Flashcard. Ban co the tiep tuc mo rong chuc nang tao, sua, xoa flashcard tai day.
        </p>
      </div>
    </div>
  );
};

export default LecturerFlashcardsPage;
