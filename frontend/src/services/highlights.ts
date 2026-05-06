import api from './api';

export interface HighlightItem {
  id: number;
  document_id: number;
  user_id: number;
  text_content: string;
  color: string;
  note: string | null;
  created_at: string;
}

export interface HighlightPayload {
  document_id: number;
  text_content: string;
  color?: string;
  note?: string;
}

export const highlightService = {
  async list(documentId: number): Promise<HighlightItem[]> {
    const response = await api.get(`/api/v1/highlights/?document_id=${documentId}`);
    return response.data;
  },

  async create(payload: HighlightPayload): Promise<HighlightItem> {
    const response = await api.post('/api/v1/highlights/', payload);
    return response.data;
  },

  async update(id: number, payload: { color?: string; note?: string }): Promise<HighlightItem> {
    const response = await api.put(`/api/v1/highlights/${id}`, payload);
    return response.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/v1/highlights/${id}`);
  }
};
