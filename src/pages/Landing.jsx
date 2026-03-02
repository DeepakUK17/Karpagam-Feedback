import { Link } from 'react-router-dom';
import DevCredit from '../components/DevCredit';

export default function Landing() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(160deg, #0f2027 0%, #203a43 45%, #2c5364 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 16px',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-100px', left: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

            {/* Logo — rounded square, no clipping */}
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '10px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                marginBottom: '24px',
                width: '120px',
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <img src="/logo.jpg" alt="KAHE Logo" style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'contain' }} />
            </div>

            {/* Title */}
            <h1 style={{
                color: 'white',
                fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
                fontWeight: 800,
                textAlign: 'center',
                margin: '0 0 8px',
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
            }}>
                Student Feedback System
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '6px', fontWeight: 400 }}>
                Karpagam Academy of Higher Education
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textAlign: 'center', marginBottom: '44px', fontStyle: 'italic' }}>
                (Deemed to be University)
            </p>

            {/* Portal Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                width: '100%',
                maxWidth: '560px',
            }}>
                <Link to="/admin/login" style={{ textDecoration: 'none' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.07)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        borderRadius: '20px',
                        padding: '32px 24px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, background 0.2s, box-shadow 0.2s',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)'; }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎓</div>
                        <h2 style={{ color: 'white', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px' }}>Admin Portal</h2>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                            Upload CSV, manage sessions & generate reports
                        </p>
                        <div style={{ marginTop: '20px', display: 'inline-block', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', padding: '7px 20px', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>
                            Login →
                        </div>
                    </div>
                </Link>

                <Link to="/student/login" style={{ textDecoration: 'none' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.07)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        borderRadius: '20px',
                        padding: '32px 24px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, background 0.2s, box-shadow 0.2s',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)'; }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👤</div>
                        <h2 style={{ color: 'white', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px' }}>Student Portal</h2>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                            Login with Roll Number to submit your feedback
                        </p>
                        <div style={{ marginTop: '20px', display: 'inline-block', background: 'rgba(44,178,255,0.15)', border: '1px solid rgba(44,178,255,0.35)', borderRadius: '30px', padding: '7px 20px', color: '#7dd3fc', fontSize: '0.8rem', fontWeight: 600 }}>
                            Login →
                        </div>
                    </div>
                </Link>
            </div>

            {/* Divider */}
            <div style={{ width: '60px', height: '2px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px', margin: '40px auto 4px' }} />

            {/* Footer */}
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', textAlign: 'center', margin: '0 0 2px' }}>
                © 2026 Karpagam Academy of Higher Education – Feedback System
            </p>
            <DevCredit light />
        </div>
    );
}
