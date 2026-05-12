import api from './api';

export interface SummaryOut {
  id: number;
  document_id: number;
  content: string;
  created_at: string;
}

export interface MindmapOut {
  id: number;
  document_id: number;
  content: any;
  created_at: string;
}

export interface FlashcardOut {
  id: number;
  document_id: number;
  user_id: number;
  front: string;
  back: string;
  difficulty: string;
  created_at: string;
}

export const aiService = {
  async generateSummary(documentId: number): Promise<SummaryOut> {
    const response = await api.post(`/api/v1/ai/summary/${documentId}`);
    return response.data;
  },

  async generateMindmap(documentId: number): Promise<MindmapOut> {
    const response = await api.post(`/api/v1/ai/mindmap/${documentId}`);
    return response.data;
  },

  async generateFlashcards(documentId: number, count: number = 5): Promise<FlashcardOut[]> {
    const response = await api.post(`/api/v1/ai/flashcards/generate/${documentId}`, { count });
    return response.data;
  }
};
