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
                <img src={import.meta.env.BASE_URL + 'logo.jpg'} alt="KAHE Logo" className="header-logo" style={{ borderRadius: '10px', objectFit: 'contain', background: 'white' }} />
                <div className="header-titles">
                    <h1>KARPAGAM ACADEMY OF HIGHER EDUCATION</h1>
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
            {/* Developer credit strip */}
            <div style={{
                textAlign: 'center',
                fontSize: '0.65rem',
                padding: '3px 12px 5px',
                background: 'rgba(0,0,0,0.15)',
                color: 'rgba(255,255,255,0.55)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
            }}>
                <span>Developed by</span>
                <a href={PORTFOLIO} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#7dd3fc', fontWeight: 700, textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                    Deepak U K
                </a>
                <span style={{ opacity: 0.5 }}>·</span>
                <a href={PORTFOLIO} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#7dd3fc', fontWeight: 600, textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                    24BTAD013
                </a>
                <span style={{ opacity: 0.5 }}>·</span>
                <a href={PORTFOLIO} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#93c5fd', fontStyle: 'italic', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                    Portfolio ↗
                </a>
            </div>
        </header>
    );
}
