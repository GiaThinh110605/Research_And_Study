import api from './api';

export interface CourseInput {
  course_name: string;
  credits: number;
  score_10: number;
}

export interface CourseResult {
  course_name: string;
  credits: number;
  score_10: number;
  score_4: number;
  letter_grade: string;
}

export interface GPACalculateResponse {
  total_courses: number;
  total_credits: number;
  gpa_10: number;
  gpa_4: number;
  courses: CourseResult[];
}

export interface GPAHistoryItem {
  id: number;
  created_at: string;
  expression: { courses: CourseInput[] };
  result: GPACalculateResponse;
}

export const gpaService = {
  async calculate(courses: CourseInput[]): Promise<GPACalculateResponse> {
    const response = await api.post('/api/v1/gpa/calculate', { courses });
    return response.data;
  },

  async history(): Promise<GPAHistoryItem[]> {
    const response = await api.get('/api/v1/gpa/history');
    return response.data;
  },

  async removeHistory(logId: number): Promise<{ message: string }> {
    const response = await api.delete(`/api/v1/gpa/history/${logId}`);
    return response.data;
  },
};
