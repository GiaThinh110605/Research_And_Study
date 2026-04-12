import api from './api';

export interface FlashcardItem {
  id: number;
  document_id: number;
  user_id: number;
  front: string;
  back: string;
  created_at: string;
}

export interface CreateFlashcardPayload {
  document_id: number;
  front: string;
  back: string;
}

export interface UpdateFlashcardPayload {
  front?: string;
  back?: string;
}

export const flashcardService = {
  async list(documentId?: number): Promise<FlashcardItem[]> {
    const response = await api.get('/api/v1/flashcards/', {
      params: documentId ? { document_id: documentId } : undefined,
    });
    return response.data;
  },

  async create(payload: CreateFlashcardPayload): Promise<FlashcardItem> {
    const response = await api.post('/api/v1/flashcards/', payload);
    return response.data;
  },

  async update(flashcardId: number, payload: UpdateFlashcardPayload): Promise<FlashcardItem> {
    const response = await api.put(`/api/v1/flashcards/${flashcardId}`, payload);
    return response.data;
  },

  async remove(flashcardId: number): Promise<{ message: string }> {
    const response = await api.delete(`/api/v1/flashcards/${flashcardId}`);
    return response.data;
  },
};
