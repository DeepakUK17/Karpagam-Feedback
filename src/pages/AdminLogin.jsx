import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import DevCredit from '../components/DevCredit';

const FACULTY_TYPES = ['FOE', 'FOP', 'ARTS', 'ARCH'];
const FACULTY_LABELS = {
    FOE: 'Faculty of Engineering',
    FOP: 'Faculty of Pharmacy',
    ARTS: 'Faculty of Arts & Science',
    ARCH: 'Faculty of Architecture',
};

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
            if (authErr) throw authErr;

            // Check admin record
            const { data: admin, error: adminErr } = await supabase
                .from('faculty_admins')
                .select('*')
                .eq('email', email.toLowerCase().trim())
                .single();

            if (adminErr || !admin) throw new Error('No admin account found for this email. Please contact the system administrator.');

            sessionStorage.setItem('admin', JSON.stringify({
                id: data.user.id,
                email: admin.email,
                name: admin.name,
                faculty_type: admin.faculty_type,
            }));
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <div className="login-logo-wrap">
                    <img src="/logo.jpg" alt="KAHE Logo" className="login-logo" style={{ borderRadius: '12px', objectFit: 'contain', background: 'white' }} />
                    <div className="login-college-name">Karpagam Academy of Higher Education</div>
                    <div className="login-college-sub">(Deemed to be University)</div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>🎓 Admin Login</h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', marginTop: '4px' }}>
                            Faculty Admin Portal
                        </p>
                    </div>
                    <div className="card-body">
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="admin@karpagam.edu"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                                {loading ? '⏳ Signing In...' : '🔐 Sign In'}
                            </button>
                        </form>

                        <div className="divider" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>Faculty Portals:</p>
                            {FACULTY_TYPES.map(f => (
                                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    <span style={{ fontWeight: '700', color: 'var(--accent)' }}>{f}</span> – {FACULTY_LABELS[f]}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <a href="/" style={{ color: 'var(--accent)' }}>← Back to Home</a>
                </p>
                <DevCredit />
            </div>
        </div>
    );
}
