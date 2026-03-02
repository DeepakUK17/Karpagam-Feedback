import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminResponseView from './pages/AdminResponseView';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import FeedbackForm from './pages/FeedbackForm';
import ChangePassword from './pages/ChangePassword';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute type="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/session/:sessionId/responses" element={
          <ProtectedRoute type="admin">
            <AdminResponseView />
          </ProtectedRoute>
        } />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/change-password" element={
          <ProtectedRoute type="student">
            <ChangePassword />
          </ProtectedRoute>
        } />
        <Route path="/student/dashboard" element={
          <ProtectedRoute type="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/feedback/:assignmentId" element={
          <ProtectedRoute type="student">
            <FeedbackForm />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
