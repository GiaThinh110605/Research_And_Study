import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface Flashcard {
  id: number;
  set_id: number;
  document_id?: number;
  front: string;
  back: string;
  status: string;
  mastery_level: number;
  last_reviewed?: string;
  created_at: string;
  updated_at?: string;
}

export type FlashcardItem = Flashcard;

export interface FlashcardSet {
  id: number;
  title: string;
  description?: string;
  subject?: string;
  document_id?: number;
  owner_id: number;
  is_ai_generated: boolean;
  created_at: string;
  updated_at?: string;
  flashcards: Flashcard[];
}

export interface FlashcardSetCreate {
  title: string;
  description?: string;
  subject?: string;
  document_id?: number;
}

export interface FlashcardCreate {
  set_id: number;
  front: string;
  back: string;
}

export const flashcardService = {
  // Sets
  listSets: async (documentId?: number) => {
    const token = localStorage.getItem('token');
    const params = documentId ? { document_id: documentId } : {};
    const res = await axios.get<FlashcardSet[]>(`${API_URL}/api/v1/flashcards/sets/`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  getSet: async (setId: number) => {
    const token = localStorage.getItem('token');
    const res = await axios.get<FlashcardSet>(`${API_URL}/api/v1/flashcards/sets/${setId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  createSet: async (data: FlashcardSetCreate) => {
    const token = localStorage.getItem('token');
    const res = await axios.post<FlashcardSet>(`${API_URL}/api/v1/flashcards/sets/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  updateSet: async (setId: number, data: Partial<FlashcardSetCreate>) => {
    const token = localStorage.getItem('token');
    const res = await axios.put<FlashcardSet>(`${API_URL}/api/v1/flashcards/sets/${setId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  deleteSet: async (setId: number) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/api/v1/flashcards/sets/${setId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Flashcards
  listFlashcards: async (params: { set_id?: number; document_id?: number; skip?: number; limit?: number } = {}) => {
    const token = localStorage.getItem('token');
    const res = await axios.get<Flashcard[]>(`${API_URL}/api/v1/flashcards/`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  createFlashcard: async (data: FlashcardCreate) => {
    const token = localStorage.getItem('token');
    const res = await axios.post<Flashcard>(`${API_URL}/api/v1/flashcards/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  bulkCreate: async (setId: number, flashcards: { front: string; back: string }[], clearExisting: boolean = false) => {
    const token = localStorage.getItem('token');
    const res = await axios.post<Flashcard[]>(`${API_URL}/api/v1/flashcards/bulk`, {
      set_id: setId,
      flashcards,
      clear_existing: clearExisting
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  updateFlashcard: async (id: number, data: Partial<FlashcardCreate>) => {
    const token = localStorage.getItem('token');
    const res = await axios.put<Flashcard>(`${API_URL}/api/v1/flashcards/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  deleteFlashcard: async (id: number) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/api/v1/flashcards/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  generateFlashcards: async (documentId: number, count: number = 5) => {
    const token = localStorage.getItem('token');
    const res = await axios.post<{message: string, data: {front: string, back: string}[]}>(
      `${API_URL}/api/v1/flashcards/generate`, 
      { count },
      { 
        params: { document_id: documentId },
        headers: { Authorization: `Bearer ${token}` } 
      }
    );
    return res.data;
  },

  // Aliases for backward compatibility
  list: async (params: any = {}) => flashcardService.listFlashcards(params),
  create: async (data: any) => flashcardService.createFlashcard(data),
  remove: async (id: number) => flashcardService.deleteFlashcard(id),
  
  resetSetProgress: async (setId: number) => {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/api/v1/flashcards/sets/${setId}/reset`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
};
