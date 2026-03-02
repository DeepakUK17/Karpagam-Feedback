import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import Header from '../components/Header';

const QUESTIONS = [
    'Punctual to Class & Full Duration',
    'Presentation, Clarity & Voice Modulation',
    'Completion of Syllabus in Time',
    'Clarity of Writing on Board',
    'Review of Previous Class Content',
    'Control of Students in Class',
    'Clearing Doubts In & Outside Class',
    'Motivating Students for Library/Ref.Books',
    'Treating Every Student Equally',
    'Overall Satisfaction',
];

const q = (n) => `q${n}`;

export default function AdminResponseView() {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    const [session, setSession] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('subject'); // 'subject' | 'student' | 'detail'
    const [expandedSubject, setExpandedSubject] = useState(null);

    const admin = JSON.parse(sessionStorage.getItem('admin') || '{}');

    useEffect(() => {
        fetchData();
    }, [sessionId]);

    async function fetchData() {
        setLoading(true);
        const [{ data: sess }, { data: assigns }, { data: resps }] = await Promise.all([
            supabase.from('feedback_sessions').select('*').eq('id', sessionId).single(),
            supabase.from('feedback_assignments').select('*').eq('session_id', sessionId),
            supabase.from('feedback_responses').select('*').eq('session_id', sessionId),
        ]);
        setSession(sess);
        setAssignments(assigns || []);
        setResponses(resps || []);
        setLoading(false);
    }

    // ---- Aggregation helpers ----
    function getSubjectAvg(subjectCode) {
        const subResps = responses.filter(r => r.subject_code === subjectCode);
        if (!subResps.length) return null;
        const totals = subResps.map(r =>
            ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce((s, n) => s + (r[q(n)] || 0), 0)) / 10
        );
        return totals.reduce((s, v) => s + v, 0) / totals.length;
    }

    function getQuestionAvgForSubject(subjectCode, qNum) {
        const subResps = responses.filter(r => r.subject_code === subjectCode);
        if (!subResps.length) return null;
        const vals = subResps.map(r => r[q(qNum)] || 0);
        return vals.reduce((s, v) => s + v, 0) / vals.length;
    }

    function getStudentTotal(rollNumber) {
        const stuResps = responses.filter(r => r.roll_number === rollNumber);
        if (!stuResps.length) return null;
        const total = stuResps.reduce((s, r) =>
            s + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce((ss, n) => ss + (r[q(n)] || 0), 0) / 10, 0
        );
        return total / stuResps.length;
    }

    function exportCSV() {
        if (!responses.length) return;
        const headers = ['Roll Number', 'Student Name', 'Subject Code', 'Subject Name', 'Staff Name',
            ...QUESTIONS.map((_, i) => `Q${i + 1}`), 'Average'];
        const rows = responses.map(r => {
            const assign = assignments.find(a => a.id === r.assignment_id) || {};
            const avg = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce((s, n) => s + (r[q(n)] || 0), 0) / 10;
            return [
                r.roll_number, assign.student_name || '', r.subject_code, assign.subject_name || '', assign.staff_name || '',
                ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => r[q(n)] || ''),
                avg.toFixed(2),
            ];
        });
        const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `responses_${session?.faculty_type}_${session?.academic_year || 'NA'}.csv`;
        a.click(); URL.revokeObjectURL(url);
    }

    // ---- Derived data ----
    const uniqueSubjects = [...new Map(assignments.map(a => [a.subject_code, a])).values()];
    const uniqueStudents = [...new Map(assignments.map(a => [a.roll_number, { roll: a.roll_number, name: a.student_name, completed: a.completed }])).values()];

    function scoreColor(avg) {
        if (avg === null) return '#999';
        if (avg >= 4.5) return '#1B5E20';
        if (avg >= 3.5) return '#2E7D32';
        if (avg >= 2.5) return '#F57C00';
        return '#C62828';
    }

    function scoreBg(avg) {
        if (avg === null) return '#F5F5F5';
        if (avg >= 4.5) return '#E8F5E9';
        if (avg >= 3.5) return '#F1F8E9';
        if (avg >= 2.5) return '#FFF3E0';
        return '#FFEBEE';
    }

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header type="admin" />
            <div className="page"><div className="container"><div className="loading-state"><div className="spinner" /><p>Loading response data…</p></div></div></div>
        </div>
    );

    const overallAvg = responses.length
        ? responses.reduce((s, r) => s + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce((ss, n) => ss + (r[q(n)] || 0), 0) / 10, 0) / responses.length
        : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header type="admin" />
            <div className="page">
                <div className="container">

                    {/* Back + Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/dashboard')}>← Back</button>
                        <div style={{ flex: 1 }}>
                            <h2>📊 Response Viewer</h2>
                            <p style={{ fontSize: '0.82rem' }}>{session?.session_label}</p>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={exportCSV} disabled={!responses.length}>
                            📥 Export CSV
                        </button>
                    </div>

                    {/* Summary Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '12px', marginBottom: '20px' }}>
                        {[
                            { label: 'Total Students', val: uniqueStudents.length, icon: '👥' },
                            { label: 'Completed', val: uniqueStudents.filter(s => assignments.filter(a => a.roll_number === s.roll).every(a => a.completed)).length, icon: '✅' },
                            { label: 'Responses', val: responses.length, icon: '📝' },
                            { label: 'Subjects', val: uniqueSubjects.length, icon: '📚' },
                            { label: 'Overall Avg', val: overallAvg ? overallAvg.toFixed(2) + ' / 5' : 'N/A', icon: '⭐' },
                        ].map(({ label, val, icon }) => (
                            <div key={label} className="card" style={{ padding: '14px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.4rem' }}>{icon}</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1, marginTop: '4px' }}>{val}</div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', borderBottom: '2px solid var(--border)', paddingBottom: '0' }}>
                        {[['subject', '📚 By Subject'], ['student', '👥 By Student'], ['detail', '📋 Detail View']].map(([tab, label]) => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
                                    fontWeight: activeTab === tab ? 700 : 500,
                                    color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                    borderBottom: activeTab === tab ? '3px solid var(--accent)' : '3px solid transparent',
                                    marginBottom: '-2px', fontSize: '0.85rem', fontFamily: 'inherit',
                                    transition: 'all 0.15s',
                                }}
                            >{label}</button>
                        ))}
                    </div>

                    {/* ===== TAB: BY SUBJECT ===== */}
                    {activeTab === 'subject' && (
                        <div>
                            {uniqueSubjects.length === 0 ? (
                                <div className="empty-state"><div className="empty-state-icon">📭</div><h3>No responses yet</h3><p>Students haven't submitted feedback for this session.</p></div>
                            ) : uniqueSubjects.map(subj => {
                                const avg = getSubjectAvg(subj.subject_code);
                                const subResps = responses.filter(r => r.subject_code === subj.subject_code);
                                const isExpanded = expandedSubject === subj.subject_code;
                                return (
                                    <div key={subj.subject_code} className="session-card" style={{ marginBottom: '14px' }}>
                                        <div
                                            className="session-card-head"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setExpandedSubject(isExpanded ? null : subj.subject_code)}
                                        >
                                            <div>
                                                <h3>{subj.subject_name}</h3>
                                                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                                                    {subj.subject_code} · 👨‍🏫 {subj.staff_name} · {subResps.length} response{subResps.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                {avg !== null ? (
                                                    <div style={{ background: scoreBg(avg), color: scoreColor(avg), borderRadius: '10px', padding: '6px 14px', fontWeight: 800, fontSize: '1.2rem' }}>
                                                        {avg.toFixed(2)}<span style={{ fontSize: '0.7rem', fontWeight: 500 }}>/5</span>
                                                    </div>
                                                ) : <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>No data</span>}
                                                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.68rem', marginTop: '4px' }}>{isExpanded ? '▲ Collapse' : '▼ Expand'}</div>
                                            </div>
                                        </div>

                                        {isExpanded && subResps.length > 0 && (
                                            <div style={{ padding: '16px' }}>
                                                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>Question-wise Average</p>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {QUESTIONS.map((qText, idx) => {
                                                        const qAvg = getQuestionAvgForSubject(subj.subject_code, idx + 1);
                                                        const pct = qAvg ? (qAvg / 5) * 100 : 0;
                                                        return (
                                                            <div key={idx}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                                                                    <span style={{ color: 'var(--text-secondary)' }}><strong>Q{idx + 1}</strong> · {qText}</span>
                                                                    <span style={{ fontWeight: 700, color: scoreColor(qAvg), minWidth: '50px', textAlign: 'right' }}>
                                                                        {qAvg ? qAvg.toFixed(2) : 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="progress-bar">
                                                                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: scoreColor(qAvg) }} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {isExpanded && subResps.length === 0 && (
                                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                No responses submitted for this subject yet.
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ===== TAB: BY STUDENT ===== */}
                    {activeTab === 'student' && (
                        <div>
                            {uniqueStudents.length === 0 ? (
                                <div className="empty-state"><div className="empty-state-icon">📭</div><h3>No students assigned</h3></div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                                        <thead>
                                            <tr style={{ background: 'linear-gradient(135deg,var(--primary),var(--primary-light))', color: 'white' }}>
                                                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700 }}>Roll No</th>
                                                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700 }}>Student Name</th>
                                                <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700 }}>Subjects Done</th>
                                                <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700 }}>Avg Score</th>
                                                <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700 }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {uniqueStudents.map((stu, i) => {
                                                const stuAssigns = assignments.filter(a => a.roll_number === stu.roll);
                                                const stuResps = responses.filter(r => r.roll_number === stu.roll);
                                                const avg = getStudentTotal(stu.roll);
                                                const allDone = stuAssigns.every(a => a.completed);
                                                return (
                                                    <tr key={stu.roll} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                                                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--primary)' }}>{stu.roll}</td>
                                                        <td style={{ padding: '10px 14px' }}>{stu.name}</td>
                                                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                                            <span style={{ fontWeight: 700 }}>{stuResps.length}</span>
                                                            <span style={{ color: 'var(--text-muted)' }}> / {stuAssigns.length}</span>
                                                        </td>
                                                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                                            {avg !== null ? (
                                                                <span style={{ fontWeight: 700, color: scoreColor(avg) }}>{avg.toFixed(2)}</span>
                                                            ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                                        </td>
                                                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                                            <span className={`badge ${allDone ? 'badge-success' : stuResps.length > 0 ? 'badge-warning' : 'badge-neutral'}`}>
                                                                {allDone ? '✅ Done' : stuResps.length > 0 ? '⏳ Partial' : '○ Pending'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== TAB: DETAIL VIEW ===== */}
                    {activeTab === 'detail' && (
                        <div>
                            {responses.length === 0 ? (
                                <div className="empty-state"><div className="empty-state-icon">📭</div><h3>No responses yet</h3><p>Students haven't submitted feedback for this session.</p></div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', minWidth: '760px' }}>
                                        <thead>
                                            <tr style={{ background: 'linear-gradient(135deg,var(--primary),var(--primary-light))', color: 'white' }}>
                                                <th style={{ padding: '9px 10px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>Roll No</th>
                                                <th style={{ padding: '9px 10px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>Subject</th>
                                                <th style={{ padding: '9px 10px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>Staff</th>
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                                    <th key={n} style={{ padding: '9px 6px', textAlign: 'center', fontWeight: 700 }}>Q{n}</th>
                                                ))}
                                                <th style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 700 }}>Avg</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {responses.map((r, i) => {
                                                const assign = assignments.find(a => a.id === r.assignment_id) || {};
                                                const avg = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce((s, n) => s + (r[q(n)] || 0), 0) / 10;
                                                return (
                                                    <tr key={r.id} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                                                        <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{r.roll_number}</td>
                                                        <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{r.subject_code}</td>
                                                        <td style={{ padding: '8px 10px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{assign.staff_name || r.staff_id}</td>
                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                                            <td key={n} style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: scoreColor(r[q(n)]) }}>
                                                                {r[q(n)] ?? '—'}
                                                            </td>
                                                        ))}
                                                        <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 800, color: scoreColor(avg) }}>
                                                            {avg.toFixed(1)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
