import { TestOut, TestStats } from '../services/test';

export const mockTestStats: TestStats = {
  total_tests: 10,
  completed_tests: 8,
  average_score: 8.5,
  progress_percent: 80
};

export const mockTests: TestOut[] = [
  {
    id: 1,
    title: 'Kiểm tra giữa kỳ - Logic học',
    subject: 'TRẮC NGHIỆM',
    created_at: '2023-10-15T08:00:00Z',
    questions_count: 20,
    duration_minutes: 45,
    status: 'HOÀN THÀNH'
  },
  {
    id: 2,
    title: 'Quiz ôn tập: Lập trình Java',
    subject: 'TRẮC NGHIỆM',
    created_at: '2023-10-12T10:30:00Z',
    questions_count: 10,
    duration_minutes: 15,
    status: 'HOÀN THÀNH'
  },
  {
    id: 3,
    title: 'Final Mock Test: Tiếng Anh 3',
    subject: 'TOÀN DIỆN',
    created_at: '2023-11-20T09:00:00Z',
    questions_count: 50,
    duration_minutes: 60,
    status: 'MỚI'
  },
  {
    id: 4,
    title: 'Đề thi thử Cơ sở dữ liệu',
    subject: 'TRẮC NGHIỆM',
    created_at: '2023-11-25T14:00:00Z',
    questions_count: 40,
    duration_minutes: 50,
    status: 'ĐANG LÀM'
  }
];
