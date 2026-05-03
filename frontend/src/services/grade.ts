import api from './api';

export interface GradeOut {
  id: number;
  student_id: number;
  subject_name: string;
  score: number;
  credits: number;
  semester?: string;
  source_type: 'test' | 'manual';
  test_id?: number;
  created_at: string;
}

export interface GradeCreate {
  subject_name: string;
  score: number;
  credits: number;
  semester?: string;
  source_type: string;
}

export interface GradeUpdate {
  subject_name?: string;
  score?: number;
  credits?: number;
  semester?: string;
}

export const gradeService = {
  getGrades: async (): Promise<GradeOut[]> => {
    const response = await api.get('/api/v1/grades/');
    return response.data;
  },
  syncGrades: async (): Promise<GradeOut[]> => {
    const response = await api.post('/api/v1/grades/sync');
    return response.data;
  },
  createGrade: async (data: GradeCreate): Promise<GradeOut> => {
    const response = await api.post('/api/v1/grades/', data);
    return response.data;
  },
  updateGrade: async (id: number, data: GradeUpdate): Promise<GradeOut> => {
    const response = await api.put(`/api/v1/grades/${id}`, data);
    return response.data;
  },
  deleteGrade: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/grades/${id}`);
  }
};
