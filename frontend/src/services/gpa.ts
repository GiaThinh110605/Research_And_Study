import api from './api';

// New types for UC15
export interface SubjectCalculateRequest {
  credits: number;
  regular_scores: (number | null)[];
  practical_scores: (number | null)[];
  midterm_score: number;
  final_score: number;
}

export interface SubjectCalculateResponse {
  score_10: number;
  score_4: number;
  grade_letter: string;
  classification: string;
  is_passed: boolean;
}

export interface SemesterSubject {
  name: string;
  credits: number;
  score_10: number;
  score_4?: number;
}

export interface SemesterCalculateResponse {
  gpa_10: number;
  gpa_4: number;
  total_credits: number;
  classification: string;
}

export interface CumulativeSemester {
  name: string;
  total_credits: number;
  gpa_10: number;
  gpa_4?: number;
}

export interface CumulativeCalculateResponse {
  cgpa_10: number;
  cgpa_4: number;
  total_credits: number;
  classification: string;
}

// Legacy types for LecturerGPAPage
export interface CourseInput {
  course_name: string;
  credits: number;
  score_10: number;
}

export interface GPACalculateResponse {
  total_courses: number;
  total_credits: number;
  gpa_10: number;
  gpa_4: number;
  courses?: any[];
}

export interface GPAHistoryItem {
  id: number;
  created_at: string;
  result: GPACalculateResponse;
}

export const gpaService = {
  // New methods
  calculateSubject: async (data: SubjectCalculateRequest): Promise<SubjectCalculateResponse> => {
    const response = await api.post('/api/v1/gpa/calculate/subject', data);
    return response.data;
  },

  calculateSemester: async (subjects: SemesterSubject[]): Promise<SemesterCalculateResponse> => {
    const response = await api.post('/api/v1/gpa/calculate/semester', { subjects });
    return response.data;
  },

  calculateCumulative: async (semesters: CumulativeSemester[]): Promise<CumulativeCalculateResponse> => {
    const response = await api.post('/api/v1/gpa/calculate/cumulative', { semesters });
    return response.data;
  },

  // Legacy methods
  calculate: async (courses: CourseInput[]): Promise<GPACalculateResponse> => {
    const response = await api.post('/api/v1/gpa/calculate', { courses });
    return response.data;
  },

  history: async (): Promise<GPAHistoryItem[]> => {
    const response = await api.get('/api/v1/gpa/history');
    return response.data;
  },

  removeHistory: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/gpa/history/${id}`);
  }
};
