import { Link } from 'react-router-dom';
import DevCredit from '../components/DevCredit';

export default function Landing() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'radial-gradient(ellipse at top left, #C8E6C9 0%, #F0F4F0 50%), radial-gradient(ellipse at bottom right, #A5D6A7 0%, transparent 50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '28px 16px',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(27,94,32,0.07)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-100px', left: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(67,160,71,0.05)', pointerEvents: 'none' }} />

            {/* Logo */}
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '10px',
                boxShadow: '0 8px 32px rgba(27,94,32,0.18)',
                marginBottom: '18px',
                width: 'clamp(90px, 22vw, 120px)',
                height: 'clamp(90px, 22vw, 120px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #A5D6A7',
                flexShrink: 0,
            }}>
                <img
                    src={import.meta.env.BASE_URL + 'logo.jpg'}
                    alt="KAHE Logo"
                    style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'contain' }}
                />
            </div>

            {/* College Name */}
            <p style={{
                color: '#1B5E20',
                fontSize: 'clamp(0.82rem, 2.5vw, 1.05rem)',
                textAlign: 'center',
                marginBottom: '4px',
                fontWeight: 800,
                letterSpacing: '0.3px',
                padding: '0 8px',
            }}>
                KARPAGAM ACADEMY OF HIGHER EDUCATION
            </p>
            <p style={{
                color: '#4A5568',
                fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
                textAlign: 'center',
                marginBottom: '10px',
                fontStyle: 'italic',
                padding: '0 12px',
                lineHeight: 1.6,
            }}>
                (Deemed to be University) ·<br />
                (Established Under Section 3 of UGC Act, 1956) ·<br />
                Accredited with A+ Grade by NAAC in the Second cycle.
            </p>

            {/* Main title */}
            <h1 style={{
                color: '#1B5E20',
                fontSize: 'clamp(1.3rem, 5vw, 2rem)',
                fontWeight: 800,
                textAlign: 'center',
                margin: '0 0 24px',
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
                padding: '0 8px',
            }}>
                Student Feedback System
            </h1>

            {/* Portal Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '16px',
                width: '100%',
                maxWidth: '520px',
            }}>
                <Link to="/admin/login" style={{ textDecoration: 'none', display: 'flex' }}>
                    <div style={{
                        flex: 1,
                        background: '#FFFFFF',
                        border: '1.5px solid #D1E7D4',
                        borderRadius: '16px',
                        padding: 'clamp(20px, 5vw, 28px) 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                        boxShadow: '0 4px 16px rgba(27,94,32,0.10)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(27,94,32,0.18)'; e.currentTarget.style.borderColor = '#66BB6A'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,94,32,0.10)'; e.currentTarget.style.borderColor = '#D1E7D4'; }}>
                        <div>
                            <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '12px' }}>🎓</div>
                            <h2 style={{ color: '#1B5E20', fontSize: 'clamp(0.95rem, 3vw, 1.15rem)', fontWeight: 700, margin: '0 0 8px' }}>Admin Portal</h2>
                            <p style={{ color: '#718096', fontSize: 'clamp(0.72rem, 2vw, 0.8rem)', margin: 0, lineHeight: 1.5 }}>
                                Upload CSV, manage sessions &amp; generate reports
                            </p>
                        </div>
                        <div style={{ marginTop: '16px', background: 'linear-gradient(135deg, #2E7D32, #43A047)', borderRadius: '30px', padding: '8px 22px', color: 'white', fontSize: '0.82rem', fontWeight: 600, boxShadow: '0 2px 8px rgba(46,125,50,0.3)' }}>
                            Login →
                        </div>
                    </div>
                </Link>

                <Link to="/student/login" style={{ textDecoration: 'none', display: 'flex' }}>
                    <div style={{
                        flex: 1,
                        background: '#FFFFFF',
                        border: '1.5px solid #D1E7D4',
                        borderRadius: '16px',
                        padding: 'clamp(20px, 5vw, 28px) 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                        boxShadow: '0 4px 16px rgba(27,94,32,0.10)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(27,94,32,0.18)'; e.currentTarget.style.borderColor = '#66BB6A'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,94,32,0.10)'; e.currentTarget.style.borderColor = '#D1E7D4'; }}>
                        <div>
                            <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '12px' }}>👤</div>
                            <h2 style={{ color: '#1B5E20', fontSize: 'clamp(0.95rem, 3vw, 1.15rem)', fontWeight: 700, margin: '0 0 8px' }}>Student Portal</h2>
                            <p style={{ color: '#718096', fontSize: 'clamp(0.72rem, 2vw, 0.8rem)', margin: 0, lineHeight: 1.5 }}>
                                Login with Roll Number to submit your feedback
                            </p>
                        </div>
                        <div style={{ marginTop: '16px', background: 'linear-gradient(135deg, #2E7D32, #43A047)', borderRadius: '30px', padding: '8px 22px', color: 'white', fontSize: '0.82rem', fontWeight: 600, boxShadow: '0 2px 8px rgba(46,125,50,0.3)' }}>
                            Login →
                        </div>
                    </div>
                </Link>
            </div>

            {/* Divider */}
            <div style={{ width: '60px', height: '2px', background: '#D1E7D4', borderRadius: '2px', margin: '32px auto 4px' }} />

            {/* Footer */}
            <p style={{ color: '#A0AEC0', fontSize: '0.7rem', textAlign: 'center', margin: '0 0 2px', padding: '0 16px' }}>
                © 2026 Karpagam Academy of Higher Education – Feedback System
            </p>
            <DevCredit />
        </div>
    );
}


