import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import {
  Home,
  FileText,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  TrendingUp,
  Clock,
  Calendar,
  ChevronRight,
  Plus,
  Download,
  Upload,
  Star,
  Award,
  Target,
  BarChart3
} from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng trở lại! 👋</h1>
          <p className="text-gray-600">Đây là dashboard học tập của bạn. Hãy bắt đầu khám phá các tính năng.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">24</h3>
            <p className="text-sm text-gray-600">Tài liệu đã tải</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+8%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">156</h3>
            <p className="text-sm text-gray-600">Flashcards đã học</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-red-600 font-medium">-3%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">8.5</h3>
            <p className="text-sm text-gray-600">GPA trung bình</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+15%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">12</h3>
            <p className="text-sm text-gray-600">Bài kiểm tra hoàn thành</p>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Documents */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Tài liệu gần đây</h2>
                <Link to="/documents" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Xem tất cả
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Tài liệu học tập {item}</h3>
                      <p className="text-sm text-gray-500">Cập nhật 2 giờ trước</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                <Upload className="w-5 h-5" />
                Tải lên tài liệu
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium">
                <Plus className="w-5 h-5" />
                Tạo flashcard
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium">
                <Target className="w-5 h-5" />
                Bắt đầu bài kiểm tra
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Tests */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Bài kiểm tra sắp tới</h2>
              <Link to="/tests" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Xem tất cả
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div key={item} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Kiểm tra cuối kỳ {item}</h3>
                    <p className="text-sm text-gray-500">Vào lúc 14:00, ngày mai</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    Bắt đầu
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
