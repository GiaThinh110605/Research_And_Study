import api from './api';

export interface DashboardStats {
  total_documents: number;
  completed_tests: number;
  gpa: number;
  progress_percent: number;
}

export interface DashboardDoc {
  id: number;
  title: string;
  info: string;
}

export interface DashboardTest {
  id: number;
  title: string;
  subject: string;
  created_at: string;
}

export interface StudentDashboardData {
  stats: DashboardStats;
  recent_documents: DashboardDoc[];
  upcoming_tests: DashboardTest[];
}

export const dashboardService = {
  getStudentDashboard: async (): Promise<StudentDashboardData> => {
    const response = await api.get('/api/v1/dashboard/student');
    return response.data;
  },
  getAdminDashboard: async (): Promise<any> => {
    const response = await api.get('/api/v1/dashboard/admin');
    return response.data;
  }
};
