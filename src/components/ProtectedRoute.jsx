import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, type }) {
    if (type === 'admin') {
        const admin = sessionStorage.getItem('admin');
        if (!admin) return <Navigate to="/admin/login" replace />;
    }
    if (type === 'student') {
        const student = sessionStorage.getItem('student');
        if (!student) return <Navigate to="/student/login" replace />;
    }
    return children;
}
