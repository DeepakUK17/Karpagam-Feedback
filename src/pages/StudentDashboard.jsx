import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import Header from '../components/Header';

export default function StudentDashboard() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sessionStatus, setSessionStatus] = useState('active');
    const navigate = useNavigate();

    const student = JSON.parse(sessionStorage.getItem('student') || '{}');

    useEffect(() => {
        fetchAssignments();
    }, []);

    async function fetchAssignments() {
        setLoading(true);
        try {
            // Get assignments for this student with active sessions only
            const { data: assignData, error } = await supabase
                .from('feedback_assignments')
                .select(`
          id, subject_code, subject_name, staff_id, staff_name, completed, session_id,
          feedback_sessions!inner(status, deleted)
        `)
                .eq('roll_number', student.roll_number)
                .eq('feedback_sessions.deleted', false);

            if (error) throw error;

            // Filter by active sessions
            const activeAssignments = (assignData || []).filter(a => a.feedback_sessions?.status === 'active');
            const stoppedAssignments = (assignData || []).filter(a => a.feedback_sessions?.status === 'stopped');

            if (activeAssignments.length === 0 && stoppedAssignments.length > 0) {
                setSessionStatus('stopped');
                setAssignments([]);
            } else {
                setSessionStatus('active');
                setAssignments(activeAssignments);
            }
        } catch (err) {
            console.error(err);
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    }

    const allCompleted = assignments.length > 0 && assignments.every(a => a.completed);
    const completedCount = assignments.filter(a => a.completed).length;
    const pendingAssignments = assignments.filter(a => !a.completed);

    const handleStartFeedback = () => {
        if (pendingAssignments.length > 0) {
            navigate(`/student/feedback/${pendingAssignments[0].id}`);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header type="student" />
                <div className="page"><div className="container"><div className="loading-state"><div className="spinner" /><p>Loading your subjects…</p></div></div></div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header type="student" />
            <div className="page">
                <div className="container">
                    {/* Student Info Card */}
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <div className="card-header">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h2>{student.student_name}</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', marginTop: '4px' }}>
                                        Roll No: {student.roll_number} · {student.department}
                                    </p>
                                </div>
                                {assignments.length > 0 && (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', marginBottom: '2px' }}>PROGRESS</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>{completedCount}/{assignments.length}</div>
                                    </div>
                                )}
                            </div>
                            {/* Progress bar */}
                            {assignments.length > 0 && (
                                <div style={{ marginTop: '12px' }}>
                                    <div className="progress-bar">
                                        <div className="progress-bar-fill" style={{ width: `${(completedCount / assignments.length) * 100}%` }} />
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                                        {completedCount} of {assignments.length} subjects completed
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* No session / stopped */}
                    {sessionStatus === 'stopped' && (
                        <div className="empty-state">
                            <div className="empty-state-icon">⏹️</div>
                            <h3>Feedback Session Closed</h3>
                            <p>The feedback session has been stopped by the admin. No further submissions are accepted.</p>
                        </div>
                    )}

                    {/* No assignments */}
                    {sessionStatus === 'active' && assignments.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <h3>No Feedback Assigned</h3>
                            <p>No active feedback session has been assigned to you yet. Please check back later or contact your department admin.</p>
                        </div>
                    )}

                    {/* All completed */}
                    {allCompleted && (
                        <div className="empty-state" style={{ background: 'var(--success-light)', borderRadius: 'var(--radius-lg)', padding: '36px 20px' }}>
                            <div className="empty-state-icon">🎉</div>
                            <h3 style={{ color: 'var(--success)' }}>All Feedback Submitted!</h3>
                            <p>Thank you, {student.student_name}! You have successfully submitted feedback for all {assignments.length} subjects.</p>
                        </div>
                    )}

                    {/* Subject list */}
                    {assignments.length > 0 && (
                        <>
                            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h3>📚 Your Subjects ({assignments.length})</h3>
                                {!allCompleted && (
                                    <button className="btn btn-primary btn-sm" onClick={handleStartFeedback}>
                                        ▶ {completedCount > 0 ? 'Continue' : 'Start'} Feedback
                                    </button>
                                )}
                            </div>
                            <div className="subject-list">
                                {assignments.map((a, idx) => (
                                    <div
                                        key={a.id}
                                        className={`subject-card ${a.completed ? 'subject-card--done' : ''}`}
                                        onClick={() => !a.completed && navigate(`/student/feedback/${a.id}`)}
                                        style={{ cursor: a.completed ? 'not-allowed' : 'pointer' }}
                                    >
                                        <div className="subject-card-num">
                                            {a.completed ? '✓' : idx + 1}
                                        </div>
                                        <div className="subject-card-info">
                                            <div className="subject-card-code">{a.subject_code}</div>
                                            <div className="subject-card-name">{a.subject_name}</div>
                                            <div className="subject-card-staff">👨‍🏫 {a.staff_name}</div>
                                        </div>
                                        <div>
                                            {a.completed ? (
                                                <span className="badge badge-success">✅ Done</span>
                                            ) : (
                                                <span className="badge badge-warning">⏳ Pending</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
