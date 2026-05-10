import api from './api';

export interface ITestQuestion {
  id: number;
  text: string;
  options: string[];
  answer?: number;
  explanation?: string;
}

export interface TestOut {
  id: number;
  title: string;
  subject?: string;
  created_at: string;
  creator_role?: string;
  questions_count: number;
  participants_count?: number;
  duration_minutes?: number;
  status: 'HOÀN THÀNH' | 'ĐANG LÀM' | 'MỚI';
  questions?: ITestQuestion[];
}

export interface TestResultOut {
  id: number;
  test_id: number;
  user_id: number;
  score: number;
  time_taken_seconds?: number;
  completed_at: string;
  answers: Record<string, any>;
  test_title?: string;
  full_name?: string;
  rank?: number;
  total_participants?: number;
  test_questions?: ITestQuestion[];
}

export interface TestStats {
  total_tests: number;
  completed_tests: number;
  average_score: number;
  progress_percent: number;
}

export interface TestQueryParams {
  subject?: string;
  document_id?: number;
  creator_id?: number;
  skip?: number;
  limit?: number;
}

export const testService = {
  getTests: async (params?: TestQueryParams): Promise<TestOut[]> => {
    const response = await api.get(`/api/v1/tests/`, { params });
    return response.data;
  },
  getTest: async (id: number): Promise<TestOut> => {
    const response = await api.get(`/api/v1/tests/${id}`);
    return response.data;
  },
  getResultDetail: async (id: number): Promise<TestResultOut> => {
    const response = await api.get(`/api/v1/tests/result/${id}`);
    return response.data;
  },
  getTestStats: async (): Promise<TestStats> => {
    const response = await api.get(`/api/v1/tests/stats`);
    return response.data;
  },
  submitTest: async (id: number, answers: Record<string, any>, timeTakenSeconds?: number): Promise<TestResultOut> => {
    const response = await api.post(`/api/v1/tests/${id}/submit`, { 
      answers, 
      time_taken_seconds: timeTakenSeconds 
    });
    return response.data;
  },
  createTest: async (data: any): Promise<TestOut> => {
    const response = await api.post(`/api/v1/tests/`, data);
    return response.data;
  },
  updateTest: async (id: number, data: any): Promise<TestOut> => {
    const response = await api.put(`/api/v1/tests/${id}`, data);
    return response.data;
  },
  deleteTest: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/tests/${id}`);
  },
  getTestResults: async (id: number): Promise<TestResultOut[]> => {
    const response = await api.get(`/api/v1/tests/${id}/results`);
    return response.data;
  },
  getMyResults: async (): Promise<TestResultOut[]> => {
    const response = await api.get(`/api/v1/tests/my-results`);
    return response.data;
  }
};
