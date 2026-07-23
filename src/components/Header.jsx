import { useNavigate } from 'react-router-dom';

const PORTFOLIO = 'https://deepakuk17.github.io/portfolio/';

export default function Header({ type = 'default' }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (type === 'admin') {
            sessionStorage.removeItem('admin');
            navigate('/admin/login');
        } else if (type === 'student') {
            sessionStorage.removeItem('student');
            navigate('/student/login');
        }
    };

    const admin = type === 'admin' ? JSON.parse(sessionStorage.getItem('admin') || '{}') : null;
    const student = type === 'student' ? JSON.parse(sessionStorage.getItem('student') || '{}') : null;

    const badgeText = type === 'admin'
        ? (admin?.faculty_type ? `${admin.faculty_type} Admin` : 'Admin')
        : 'Student Portal';

    return (
        <header className="app-header" style={{ paddingBottom: 0 }}>
            <div className="header-inner">
                <img src={import.meta.env.BASE_URL + 'logo.jpg'} alt="ABC Logo" className="header-logo" style={{ borderRadius: '10px', objectFit: 'contain', background: 'white' }} />
                <div className="header-titles">
                    <h1>ABC COLLEGE</h1>
                    <p>(Deemed to be University) <br />
                        (Established Under Section 3 of UGC Act, 1956) <br />
                        Accredited with A+ Grade by NAAC in the Second cycle.</p>
                </div>
                <span className="header-badge">{badgeText}</span>
                {(type === 'admin' || type === 'student') && (
                    <div className="header-user">
                        {student && <span>Welcome, {student.student_name?.split(' ')[0]}</span>}
                        {admin && <span>{admin.name}</span>}
                        <button className="btn-logout" onClick={handleLogout}>🚪 Logout</button>
                    </div>
                )}
            </div>
        </header>
    );
}
