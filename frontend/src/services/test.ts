import axios from 'axios';

export interface TestOut {
  id: number;
  title: string;
  type: string;
  created_at: string;
  questions_count: number;
  status: 'HOÀN THÀNH' | 'ĐANG LÀM' | 'MỚI';
}

export const testService = {
  getTests: async (): Promise<TestOut[]> => {
    const response = await axios.get(`/api/v1/tests/`);
    return response.data;
  }
};
