import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import DevCredit from '../components/DevCredit';

export default function StudentLogin() {
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data: student, error: fetchErr } = await supabase
                .from('students')
                .select('*')
                .ilike('roll_number', rollNumber.trim())
                .single();

            if (fetchErr || !student) {
                throw new Error('Roll number not found. Please check and try again.');
            }
            if (student.password !== password) {
                throw new Error('Incorrect password. The default password is "student123".');
            }

            sessionStorage.setItem('student', JSON.stringify(student));
            navigate('/student/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <div className="login-logo-wrap">
                    <img src={import.meta.env.BASE_URL + 'logo.jpg'} alt="ABC Logo" className="login-logo" style={{ borderRadius: '12px', objectFit: 'contain', background: 'white' }} />
                    <div className="login-college-name">ABC COLLEGE</div>
                    <div className="login-college-sub">(Deemed to be University) <br />
                        (Established Under Section 3 of UGC Act, 1956) <br />
                        Accredited with A+ Grade by NAAC in the Second cycle.</div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>👤 Student Login</h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', marginTop: '4px' }}>
                            Enter your Roll Number to access your feedback
                        </p>
                    </div>
                    <div className="card-body">
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label className="form-label">Roll Number</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. 24BTAD013"
                                    value={rollNumber}
                                    onChange={e => setRollNumber(e.target.value)}
                                    required
                                    autoFocus
                                    autoCapitalize="characters"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="student123"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                                {loading ? '⏳ Logging In...' : '🔐 Login'}
                            </button>
                        </form>
                    </div>
                </div>
                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Link to="/" style={{ color: 'var(--accent)' }}>← Back to Home</Link>
                </p>
                <DevCredit />
            </div>
        </div>
    );
}
