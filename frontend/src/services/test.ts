import api from './api';

export interface TestOut {
  id: number;
  title: string;
  type: string;
  created_at: string;
  questions_count: number;
  status: 'HOÀN THÀNH' | 'ĐANG LÀM' | 'MỚI';
}

export interface TestStats {
  total_tests: number;
  completed_tests: number;
  average_score: number;
  progress_percent: number;
}

export const testService = {
  getTests: async (): Promise<TestOut[]> => {
    const response = await api.get(`/api/v1/tests/`);
    return response.data;
  },
  getTestStats: async (): Promise<TestStats> => {
    const response = await api.get(`/api/v1/tests/stats`);
    return response.data;
  }
};
