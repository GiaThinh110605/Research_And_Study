import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Question {
  id: number;
  document_id: number;
  content: string;
  answer: string | null;
  created_at: string;
  user_id?: number;
}

interface AIQAPanelProps {
  documentId: number;
  currentUserId: number | null;
  highlightText?: string;
}

const AIQAPanel: React.FC<AIQAPanelProps> = ({ documentId, currentUserId, highlightText = '' }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [questionInput, setQuestionInput] = useState(highlightText || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (documentId) {
      fetchQuestions();
    }
  }, [documentId]);

  useEffect(() => {
    if (highlightText && !isAskingQuestion) {
      setQuestionInput(highlightText);
    }
  }, [highlightText, isAskingQuestion]);

  const fetchQuestions = async () => {
    if (!currentUserId) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/api/v1/ai/qa/${documentId}`);
      setQuestions(res.data || []);
      setError('');
    } catch (err: any) {
      console.error('Lỗi tải Q&A:', err);
      setError('Không thể tải danh sách Q&A');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!questionInput.trim()) {
      setError('Vui lòng nhập câu hỏi');
      return;
    }

    if (!currentUserId) {
      setError('Vui lòng đăng nhập để hỏi AI');
      return;
    }

    setIsAskingQuestion(true);
    setError('');

    try {
      const res = await api.post(`/api/v1/ai/qa/${documentId}`, {
        content: questionInput.trim(),
        context: highlightText || undefined,
      });

      setQuestions([res.data, ...questions]);
      setQuestionInput('');
      setIsAskingQuestion(false);
    } catch (err: any) {
      console.error('Lỗi hỏi AI:', err);
      const errorMsg = err.response?.data?.detail || 'Lỗi xảy ra khi gọi AI. Vui lòng thử lại.';
      setError(errorMsg);
      setIsAskingQuestion(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">🤖 Hỏi AI</h3>
        <p className="text-xs text-gray-500 mt-1">Đặt câu hỏi về tài liệu và nhận câu trả lời từ AI</p>
      </div>

      {/* Input Section */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="space-y-2">
          <textarea
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="Nhập câu hỏi của bạn..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isAskingQuestion}
          />
          <button
            onClick={handleAskQuestion}
            disabled={isAskingQuestion || !questionInput.trim()}
            className="w-full px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isAskingQuestion ? '⏳ Đang xử lý...' : '✨ Hỏi AI'}
          </button>
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Questions History */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <span>⏳ Đang tải...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            <p>Chưa có câu hỏi nào.</p>
            <p className="mt-2">Hãy đặt câu hỏi đầu tiên của bạn!</p>
          </div>
        ) : (
          <div className="divide-y">
            {questions.map((q) => (
              <div key={q.id} className="p-3 hover:bg-gray-50">
                <div className="flex gap-2">
                  <div className="flex-shrink-0 text-lg">❓</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 break-words">{q.content}</p>
                    {q.answer ? (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-gray-700 border-l-2 border-blue-300">
                        <p className="font-semibold text-blue-900 mb-1">💡 Câu trả lời:</p>
                        <p className="text-gray-700 whitespace-pre-wrap break-words">{q.answer}</p>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-gray-500 italic">⏳ Đang chờ câu trả lời...</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(q.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIQAPanel;
