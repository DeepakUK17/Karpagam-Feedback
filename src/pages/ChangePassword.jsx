import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import Header from '../components/Header';

export default function ChangePassword() {
    const [newPass, setNewPass] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const student = JSON.parse(sessionStorage.getItem('student') || '{}');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (newPass.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (newPass !== confirm) { setError('Passwords do not match.'); return; }
        if (newPass === 'karpagam') { setError('Please choose a different password from the default.'); return; }
        setLoading(true);
        try {
            const { error: updateErr } = await supabase
                .from('students')
                .update({ password: newPass, password_changed: true })
                .eq('roll_number', student.roll_number);
            if (updateErr) throw updateErr;
            const updated = { ...student, password: newPass, password_changed: true };
            sessionStorage.setItem('student', JSON.stringify(updated));
            navigate('/student/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header type="student" />
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '420px', padding: '0 16px' }}>
                    <div className="card">
                        <div className="card-header">
                            <h2>🔑 Set New Password</h2>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', marginTop: '4px' }}>
                                Welcome, {student.student_name}! Please set a personal password to continue.
                            </p>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <div className="alert alert-info" style={{ marginBottom: '16px' }}>
                                🔒 This is a one-time setup. Your new password replaces the default "karpagam" password.
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="Minimum 6 characters"
                                        value={newPass}
                                        onChange={e => setNewPass(e.target.value)}
                                        required autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="Repeat your new password"
                                        value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                                    {loading ? '⏳ Saving...' : '✅ Set Password & Continue'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
