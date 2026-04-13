import api from './api';

export interface Flashcard {
  id: number;
  document_id: number;
  user_id: number;
  front: string;
  back: string;
  created_at: string;
}

export interface FlashcardCreate {
  document_id: number;
  front: string;
  back: string;
}

export const flashcardService = {
  list: async (documentId?: number) => {
    const params = documentId ? { document_id: documentId } : {};
    const response = await api.get<Flashcard[]>('/api/v1/flashcards', { params });
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get<Flashcard>(`/api/v1/flashcards/${id}`);
    return response.data;
  },

  create: async (data: FlashcardCreate) => {
    const response = await api.post<Flashcard>('/api/v1/flashcards', data);
    return response.data;
  },

  bulkCreate: async (data: FlashcardCreate[]) => {
    const response = await api.post<Flashcard[]>('/api/v1/flashcards/bulk', data);
    return response.data;
  },

  update: async (id: number, data: Partial<FlashcardCreate>) => {
    const response = await api.put<Flashcard>(`/api/v1/flashcards/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/v1/flashcards/${id}`);
    return response.data;
  }
};
