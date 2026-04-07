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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tinh-nang" element={<FeaturesPage />} />
        <Route path="/tai-lieu/tai-len" element={<DocumentsUploadPage />} />
        <Route path="/tai-lieu/:documentId" element={<DocumentDetailPage />} />
        <Route path="/tai-lieu" element={<DocumentsPage />} />
        <Route path="/cong-dong" element={<CommunityPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
        <Route path="/test-list" element={<TestListPage />} />
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
