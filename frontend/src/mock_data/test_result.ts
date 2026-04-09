import { TestResultOut } from '../services/test';
import { mockTestDetail } from './test_detail';

export const mockTestResult: TestResultOut = {
  id: 999,
  test_id: 1,
  user_id: 1,
  score: 8.0,
  time_taken_seconds: 600,
  completed_at: new Date().toISOString(),
  answers: {
    '101': 0, // Đúng
    '102': 2, // Đúng
    '103': 1, // Đúng
    '104': 0, // Đúng
    '105': 1, // Sai (user chọn 1, đáp án là 3)
  },
  test_title: 'Kiểm tra giữa kỳ - Logic học',
  full_name: 'Nguyễn Văn Sinh Viên',
  rank: 5,
  total_participants: 120,
  test_questions: mockTestDetail.questions,
};
