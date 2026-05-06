import api from './api';

export interface QuestionItem {
  id: number;
  document_id: number;
  user_id: number;
  content: string;
  answer: string | null;
  created_at: string;
}

export interface QuestionPayload {
  document_id: number;
  content: string;
  context?: string;
  answer?: string;
}

export const questionService = {
  async list(documentId: number): Promise<QuestionItem[]> {
    const response = await api.get(`/api/v1/questions/?document_id=${documentId}`);
    return response.data;
  },

  async create(payload: QuestionPayload): Promise<QuestionItem> {
    const response = await api.post('/api/v1/questions/', payload);
    return response.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/v1/questions/${id}`);
  }
};
