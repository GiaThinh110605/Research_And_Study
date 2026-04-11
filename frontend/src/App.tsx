import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeaturesPage from './pages/FeaturesPage';
import DocumentsPage from './pages/DocumentsPage';
import DocumentsUploadPage from './pages/DocumentsUploadPage';
import DocumentDetailPage from './pages/DocumentDetailPage';
import CommunityPage from './pages/CommunityPage';
import DiscussionPage from './pages/DiscussionPage';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminDashboard from './pages/AdminDashboard';
import AdminDocumentManagement from './pages/AdminDocumentManagement';
import AdminModeration from './pages/AdminModeration';
import AdminLogs from './pages/AdminLogs';
import AdminSettings from './pages/AdminSettings';

import StudentDashboard from './pages/StudentDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import LecturerDocumentsPage from './pages/LecturerDocumentsPage';
import LecturerTestsPage from './pages/LecturerTestsPage';
import TestListPage from './pages/TestListPage';
import TakeTestPage from './pages/TakeTestPage';
import TestResultPage from './pages/TestResultPage';
import ProfilePage from './pages/ProfilePage';

import DashboardLayout from './components/layout/DashboardLayout';
import LecturerLayout from './components/layout/LecturerLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tinh-nang" element={<FeaturesPage />} />
        
        {/* Student Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/tai-lieu" element={<DocumentsPage />} />
          <Route path="/tai-lieu/tai-len" element={<DocumentsUploadPage />} />
          <Route path="/tai-lieu/:documentId" element={<DocumentDetailPage />} />
          <Route path="/cong-dong" element={<CommunityPage />} />
          <Route path="/test-list" element={<TestListPage />} />
          <Route path="/take-test/:id" element={<TakeTestPage />} />
          <Route path="/test-result/:id" element={<TestResultPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Lecturer Routes */}
        <Route element={<LecturerLayout />}>
          <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
          <Route path="/lecturer/tai-lieu" element={<LecturerDocumentsPage />} />
          <Route path="/lecturer/bai-kiem-tra" element={<LecturerTestsPage />} />
        </Route>
        
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/docs" element={<AdminDocumentManagement />} />
        <Route path="/admin/moderation" element={<AdminModeration />} />
        <Route path="/admin/logs" element={<AdminLogs />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
