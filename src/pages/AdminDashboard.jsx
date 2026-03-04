import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import Header from '../components/Header';
import DevCredit from '../components/DevCredit';
import { parseAndUploadCSV } from '../utils/csvParser';
import { generatePDFReport } from '../utils/pdfReport';

export default function AdminDashboard() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [confirmModal, setConfirmModal] = useState(null);
    const [reportLoading, setReportLoading] = useState(null);
    const [refreshing, setRefreshing] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all'|'active'|'stopped'
    const fileRef = useRef();
    const navigate = useNavigate();

    const admin = JSON.parse(sessionStorage.getItem('admin') || '{}');

    useEffect(() => {
        fetchSessions();
    }, []);

    async function fetchSessions() {
        setLoading(true);
        const { data, error } = await supabase
            .from('feedback_sessions')
            .select('*')
            .eq('faculty_type', admin.faculty_type)
            .eq('deleted', false)
            .order('created_at', { ascending: false });

        if (!error) {
            // For each session, get counts
            const enriched = await Promise.all(data.map(async (s) => {
                const { data: allAssign } = await supabase
                    .from('feedback_assignments')
                    .select('roll_number, completed')
                    .eq('session_id', s.id);

                const uniqueStudents = [...new Set((allAssign || []).map(a => a.roll_number))];
                const completedStudents = uniqueStudents.filter(rn =>
                    (allAssign || []).filter(a => a.roll_number === rn).every(a => a.completed)
                );

                return {
                    ...s,
                    totalStudents: uniqueStudents.length,
                    completedStudents: completedStudents.length,
                    pendingStudents: uniqueStudents.length - completedStudents.length,
                };
            }));
            setSessions(enriched);
        }
        setLoading(false);
    }

    async function handleFileUpload(file) {
        if (!file || !file.name.endsWith('.csv')) {
            setUploadMsg('❌ Please upload a valid CSV file.');
            return;
        }
        setUploading(true);
        setUploadMsg('⏳ Uploading and processing CSV...');
        try {
            const result = await parseAndUploadCSV(file, admin.faculty_type);
            setUploadMsg(`✅ Session created! ${result.totalStudents} students, ${result.totalAssignments} assignments.`);
            fetchSessions();
        } catch (err) {
            setUploadMsg(`❌ Error: ${err.message}`);
        } finally {
            setUploading(false);
        }
    }

    async function handleStop(sessionId) {
        await supabase.from('feedback_sessions').update({ status: 'stopped' }).eq('id', sessionId);
        setConfirmModal(null);
        fetchSessions();
    }

    async function handleDelete(sessionId) {
        try {
            // Get the list of students and staff in this session BEFORE deleting
            const { data: sessionAssignments } = await supabase
                .from('feedback_assignments')
                .select('roll_number, staff_id')
                .eq('session_id', sessionId);

            const affectedRolls = [...new Set((sessionAssignments || []).map(a => a.roll_number))];
            const affectedStaff = [...new Set((sessionAssignments || []).map(a => a.staff_id))];

            // 1. Delete all responses for this session
            await supabase.from('feedback_responses').delete().eq('session_id', sessionId);
            // 2. Delete all assignments for this session
            await supabase.from('feedback_assignments').delete().eq('session_id', sessionId);
            // 3. Delete the session itself
            await supabase.from('feedback_sessions').delete().eq('id', sessionId);

            // 4. Delete students who have NO remaining assignments in any other session
            if (affectedRolls.length) {
                const { data: remainingStudentAssign } = await supabase
                    .from('feedback_assignments')
                    .select('roll_number')
                    .in('roll_number', affectedRolls);
                const stillUsedRolls = new Set((remainingStudentAssign || []).map(a => a.roll_number));
                const orphanRolls = affectedRolls.filter(r => !stillUsedRolls.has(r));
                if (orphanRolls.length) {
                    await supabase.from('students').delete().in('roll_number', orphanRolls);
                }
            }

            // 5. Delete staff who have NO remaining assignments in any other session
            if (affectedStaff.length) {
                const { data: remainingStaffAssign } = await supabase
                    .from('feedback_assignments')
                    .select('staff_id')
                    .in('staff_id', affectedStaff);
                const stillUsedStaff = new Set((remainingStaffAssign || []).map(a => a.staff_id));
                const orphanStaff = affectedStaff.filter(s => !stillUsedStaff.has(s));
                if (orphanStaff.length) {
                    await supabase.from('staff').delete().in('staff_id', orphanStaff);
                }
            }

        } catch (err) {
            alert('Delete failed: ' + err.message);
            return;
        }
        setConfirmModal(null);
        fetchSessions();
    }

    async function handleReport(session) {
        setReportLoading(session.id);
        try {
            const { data: assignments } = await supabase
                .from('feedback_assignments')
                .select('*')
                .eq('session_id', session.id);

            const { data: responses } = await supabase
                .from('feedback_responses')
                .select('*')
                .eq('session_id', session.id);

            await generatePDFReport(session, assignments || [], responses || []);
        } catch (err) {
            alert('Report generation failed: ' + err.message);
        } finally {
            setReportLoading(null);
        }
    }

    async function handleRefreshCard(sessionId) {
        setRefreshing(sessionId);
        const { data: allAssign } = await supabase
            .from('feedback_assignments')
            .select('roll_number, completed')
            .eq('session_id', sessionId);
        const uniqueStudents = [...new Set((allAssign || []).map(a => a.roll_number))];
        const completedStudents = uniqueStudents.filter(rn =>
            (allAssign || []).filter(a => a.roll_number === rn).every(a => a.completed)
        );
        setSessions(prev => prev.map(s => s.id === sessionId ? {
            ...s,
            totalStudents: uniqueStudents.length,
            completedStudents: completedStudents.length,
            pendingStudents: uniqueStudents.length - completedStudents.length,
        } : s));
        setRefreshing(null);
    }

    const FACULTY_FULL = {
        FOE: 'Faculty of Engineering', FOP: 'Faculty of Pharmacy',
        ARTS: 'Faculty of Arts & Science', ARCH: 'Faculty of Architecture',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header type="admin" />
            <div className="page">
                <div className="container">
                    {/* Page Title */}
                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ color: 'var(--primary)' }}>Admin Dashboard</h2>
                        <p style={{ fontSize: '0.875rem' }}>
                            {FACULTY_FULL[admin.faculty_type] || admin.faculty_type} · Manage feedback sessions
                        </p>
                    </div>

                    {/* Upload Zone */}
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <div className="card-header">
                            <h3>📤 Upload CSV File</h3>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', marginTop: '2px' }}>
                                Upload student-subject mapping to create a new feedback session
                            </p>
                        </div>
                        <div className="card-body">
                            <div
                                className={`upload-zone${dragOver ? ' drag-over' : ''}`}
                                onClick={() => fileRef.current.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files[0]); }}
                            >
                                <input type="file" accept=".csv" ref={fileRef} onChange={e => handleFileUpload(e.target.files[0])} />
                                <div className="upload-zone-icon">📄</div>
                                {uploading ? (
                                    <><div className="spinner" style={{ margin: '8px auto' }} /><p>Processing…</p></>
                                ) : (
                                    <><p><strong>Click to select</strong> or drag & drop your CSV file here</p><p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Accepted format: .csv with required columns</p></>
                                )}
                            </div>
                            {uploadMsg && (
                                <div className={`alert ${uploadMsg.startsWith('✅') ? 'alert-success' : uploadMsg.startsWith('⏳') ? 'alert-info' : 'alert-danger'}`} style={{ marginTop: '12px', marginBottom: 0 }}>
                                    {uploadMsg}
                                </div>
                            )}
                            <div style={{ marginTop: '14px', padding: '12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                <strong style={{ color: 'var(--text)' }}>Required CSV columns:</strong>{' '}
                                department, roll_number, student_name, staff_id, staff_name, subject_code, subject_name, section, year, batch, academic_year
                            </div>
                        </div>
                    </div>

                    {/* Sessions */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                            <h3 style={{ color: 'var(--primary)' }}>📊 Feedback Sessions</h3>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {['all', 'active', 'stopped'].map(f => (
                                    <button key={f} onClick={() => setStatusFilter(f)}
                                        className={`btn btn-sm ${statusFilter === f ? 'btn-primary' : 'btn-outline'}`}>
                                        {f === 'all' ? 'All' : f === 'active' ? '🟢 Active' : '🔴 Stopped'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="loading-state"><div className="spinner" /><p>Loading sessions…</p></div>
                        ) : sessions.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📭</div>
                                <h3>No sessions yet</h3>
                                <p>Upload a CSV file above to create your first feedback session.</p>
                            </div>
                        ) : (
                            <div className="dashboard-grid">
                                {sessions
                                    .filter(s => statusFilter === 'all' || s.status === statusFilter)
                                    .map(s => {
                                        return (
                                            <div key={s.id} className="session-card">
                                                <div className="session-card-head">
                                                    <div style={{ flex: 1 }}>
                                                        <h3>{s.session_label || s.faculty_type}</h3>
                                                        <p>Created: {new Date(s.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                        {s.totalStudents > 0 && (
                                                            <div style={{ marginTop: '8px' }}>
                                                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                                                                    <div style={{ height: '100%', width: `${(s.completedStudents / s.totalStudents) * 100}%`, background: 'rgba(255,255,255,0.9)', borderRadius: '2px', transition: 'width 0.4s' }} />
                                                                </div>
                                                                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.75)', marginTop: '3px' }}>
                                                                    {((s.completedStudents / s.totalStudents) * 100).toFixed(0)}% complete
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                                        {s.status === 'active' ? '🟢 Active' : '🔴 Stopped'}
                                                    </span>
                                                </div>

                                                <div className="session-stats">
                                                    <div className="stat-box">
                                                        <div className="stat-num">{s.totalStudents}</div>
                                                        <div className="stat-label">Total Students</div>
                                                    </div>
                                                    <div className="stat-box stat-done">
                                                        <div className="stat-num">{s.completedStudents}</div>
                                                        <div className="stat-label">Completed</div>
                                                    </div>
                                                    <div className="stat-box stat-pending">
                                                        <div className="stat-num">{s.pendingStudents}</div>
                                                        <div className="stat-label">Pending</div>
                                                    </div>
                                                </div>

                                                <div className="session-actions">
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => navigate(`/admin/session/${s.id}/responses`)}
                                                    >
                                                        📊 View Responses
                                                    </button>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handleReport(s)}
                                                        disabled={reportLoading === s.id}
                                                    >
                                                        {reportLoading === s.id ? '⏳ Generating…' : '📄 Report PDF'}
                                                    </button>
                                                    <button
                                                        className="btn btn-outline btn-sm"
                                                        onClick={() => handleRefreshCard(s.id)}
                                                        disabled={refreshing === s.id}
                                                        title="Refresh counts"
                                                    >
                                                        {refreshing === s.id ? '⏳' : '🔄'}
                                                    </button>
                                                    {s.status === 'active' && (
                                                        <button className="btn btn-warning btn-sm" onClick={() => setConfirmModal({ type: 'stop', session: s })}>
                                                            ⏹ Stop
                                                        </button>
                                                    )}
                                                    <button className="btn btn-danger btn-sm" onClick={() => setConfirmModal({ type: 'delete', session: s })}>
                                                        🗑 Delete
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            {confirmModal && (
                <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span style={{ fontSize: '1.4rem' }}>{confirmModal.type === 'stop' ? '⏹' : '🗑'}</span>
                            <h3>{confirmModal.type === 'stop' ? 'Stop Feedback Session' : 'Delete Session'}</h3>
                        </div>
                        <div className="modal-body">
                            <p>
                                {confirmModal.type === 'stop'
                                    ? 'This will prevent students from submitting any more feedback. Students will see "No feedback available". You can still generate the report.'
                                    : 'This will permanently remove this session from the dashboard. All associated assignment data will be marked deleted. This cannot be undone.'}
                            </p>
                            <div style={{ marginTop: '12px', padding: '10px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                Session: <strong>{confirmModal.session.session_label}</strong>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline btn-sm" onClick={() => setConfirmModal(null)}>Cancel</button>
                            {confirmModal.type === 'stop' && (
                                <button className="btn btn-warning btn-sm" onClick={() => handleStop(confirmModal.session.id)}>⏹ Confirm Stop</button>
                            )}
                            {confirmModal.type === 'delete' && (
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(confirmModal.session.id)}>🗑 Confirm Delete</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid var(--border)',
                marginTop: '40px',
                paddingBottom: '8px',
                background: 'var(--surface)',
            }}>
                <div style={{ width: '60px', height: '2px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 4px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textAlign: 'center', margin: '8px 0 0', padding: '0 16px' }}>
                    © 2026 Karpagam Academy of Higher Education – Feedback System
                </p>
                <DevCredit />
            </footer>
        </div>
    );
}
