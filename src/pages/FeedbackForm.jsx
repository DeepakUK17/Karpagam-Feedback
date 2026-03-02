import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import Header from '../components/Header';

const QUESTIONS = [
    'Punctual to the Class and Handling the class for entire Duration',
    'Presentation, Clarity of expression and Voice Modulation',
    'Completion of syllabus in time',
    'Clarity of Writing in the Board',
    'Review of previous class subjects content',
    'Control of students in the class',
    'Clearing doubts in the class and outside',
    'Motivating and Encouraging students to use Library for Journals / Ref.Books',
    'Treating every student equally without favouritism',
    'Fulfilment of expectation of the course (overall satisfaction)',
];

const RATINGS = [
    { value: 5, label: 'Excellent' },
    { value: 4, label: 'V.Good' },
    { value: 3, label: 'Good' },
    { value: 2, label: 'Satisfactory' },
    { value: 1, label: 'Poor' },
];

export default function FeedbackForm() {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const student = JSON.parse(sessionStorage.getItem('student') || '{}');

    useEffect(() => {
        setAnswers({});
        setError('');
        fetchAssignment();
    }, [assignmentId]);

    async function fetchAssignment() {
        setLoading(true);
        const { data, error } = await supabase
            .from('feedback_assignments')
            .select(`*, feedback_sessions(status, deleted)`)
            .eq('id', assignmentId)
            .single();
        if (!error && data) {
            if (data.completed) { navigate('/student/dashboard'); return; }
            if (data.feedback_sessions?.status === 'stopped' || data.feedback_sessions?.deleted) {
                navigate('/student/dashboard'); return;
            }
            setAssignment(data);
        }
        setLoading(false);
    }

    const handleRate = (qIdx, value) => {
        setAnswers(prev => ({ ...prev, [qIdx]: value }));
    };

    const answeredCount = Object.keys(answers).length;
    const allAnswered = answeredCount === QUESTIONS.length;

    const handleSubmit = async () => {
        if (!allAnswered) { setError('Please answer all 10 questions before submitting.'); return; }
        setSubmitting(true); setError('');
        try {
            const responseData = {
                assignment_id: assignmentId,
                session_id: assignment.session_id,
                roll_number: student.roll_number,
                staff_id: assignment.staff_id,
                subject_code: assignment.subject_code,
                q1: answers[0], q2: answers[1], q3: answers[2], q4: answers[3], q5: answers[4],
                q6: answers[5], q7: answers[6], q8: answers[7], q9: answers[8], q10: answers[9],
            };
            const { error: respErr } = await supabase.from('feedback_responses').insert(responseData);
            if (respErr) throw respErr;

            const { error: updateErr } = await supabase
                .from('feedback_assignments').update({ completed: true }).eq('id', assignmentId);
            if (updateErr) throw updateErr;

            const { data: allAssign } = await supabase
                .from('feedback_assignments')
                .select('id, completed, feedback_sessions!inner(status, deleted)')
                .eq('roll_number', student.roll_number)
                .eq('completed', false)
                .eq('feedback_sessions.status', 'active')
                .eq('feedback_sessions.deleted', false)
                .neq('id', assignmentId);

            if (allAssign && allAssign.length > 0) {
                navigate(`/student/feedback/${allAssign[0].id}`);
            } else {
                navigate('/student/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header type="student" />
            <div className="page"><div className="container"><div className="loading-state"><div className="spinner" /><p>Loading feedback form…</p></div></div></div>
        </div>
    );

    if (!assignment) return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header type="student" />
            <div className="page"><div className="container">
                <div className="empty-state"><div className="empty-state-icon">❌</div><h3>Assignment not found</h3><button className="btn btn-primary" onClick={() => navigate('/student/dashboard')}>← Go Back</button></div>
            </div></div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f4f6f8' }}>
            <Header type="student" />
            <div style={{ padding: '16px', maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

                {/* Subject Info Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    marginBottom: '16px',
                    boxShadow: '0 4px 20px rgba(27,94,32,0.3)',
                    color: 'white',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <button
                            onClick={() => navigate('/student/dashboard')}
                            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}
                        >← Back</button>
                        <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>📋 Feedback Form</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: '0.82rem' }}>
                        <div><span style={{ opacity: 0.7 }}>Subject Code: </span><strong>{assignment.subject_code}</strong></div>
                        <div><span style={{ opacity: 0.7 }}>Staff Name: </span><strong>{assignment.staff_name}</strong></div>
                        <div style={{ gridColumn: '1/-1' }}><span style={{ opacity: 0.7 }}>Subject: </span><strong>{assignment.subject_name}</strong></div>
                        <div><span style={{ opacity: 0.7 }}>Roll No: </span><strong>{student.roll_number}</strong></div>
                        <div><span style={{ opacity: 0.7 }}>Student: </span><strong>{student.student_name}</strong></div>
                    </div>
                    {/* Progress */}
                    <div style={{ marginTop: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', opacity: 0.8, marginBottom: '4px' }}>
                            <span>Progress</span>
                            <span>{answeredCount} / {QUESTIONS.length} answered</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(answeredCount / QUESTIONS.length) * 100}%`, background: 'rgba(255,255,255,0.9)', borderRadius: '3px', transition: 'width 0.3s' }} />
                        </div>
                    </div>
                </div>

                {/* Feedback Table */}
                <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '16px' }}>
                    {/* Table Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '40px 1fr repeat(5, 80px)',
                        background: '#1B5E20',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textAlign: 'center',
                        borderBottom: '2px solid #154a1a',
                    }}>
                        <div style={{ padding: '12px 8px' }}>S.No</div>
                        <div style={{ padding: '12px 12px', textAlign: 'left' }}>Questions</div>
                        {RATINGS.map(r => (
                            <div key={r.value} style={{ padding: '12px 4px', lineHeight: 1.2 }}>
                                <div>{r.label}</div>
                                <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>({r.value})</div>
                            </div>
                        ))}
                    </div>

                    {/* Table Rows */}
                    {QUESTIONS.map((q, idx) => {
                        const isAnswered = answers[idx] != null;
                        const isEven = idx % 2 === 0;
                        return (
                            <div
                                key={idx}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '40px 1fr repeat(5, 80px)',
                                    background: isAnswered
                                        ? '#E8F5E9'
                                        : isEven ? '#fafafa' : 'white',
                                    borderBottom: '1px solid #e8ecef',
                                    alignItems: 'center',
                                    transition: 'background 0.2s',
                                    minHeight: '52px',
                                }}
                            >
                                {/* S.No */}
                                <div style={{
                                    textAlign: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    color: isAnswered ? '#1B5E20' : '#888',
                                    padding: '8px 4px',
                                }}>
                                    {isAnswered ? '✓' : idx + 1}
                                </div>

                                {/* Question */}
                                <div style={{
                                    padding: '10px 12px',
                                    fontSize: '0.8rem',
                                    color: '#2d3748',
                                    lineHeight: 1.45,
                                    fontWeight: isAnswered ? 500 : 400,
                                }}>
                                    {q}
                                </div>

                                {/* Rating Buttons */}
                                {RATINGS.map(r => (
                                    <div key={r.value} style={{ textAlign: 'center', padding: '6px 4px' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleRate(idx, r.value)}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                border: answers[idx] === r.value
                                                    ? '2px solid #1B5E20'
                                                    : '2px solid #d0d7de',
                                                background: answers[idx] === r.value
                                                    ? '#1B5E20'
                                                    : 'white',
                                                color: answers[idx] === r.value ? 'white' : '#555',
                                                fontWeight: 700,
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s',
                                                boxShadow: answers[idx] === r.value ? '0 2px 8px rgba(27,94,32,0.4)' : 'none',
                                                transform: answers[idx] === r.value ? 'scale(1.12)' : 'scale(1)',
                                                fontFamily: 'inherit',
                                            }}
                                            title={r.label}
                                        >
                                            {r.value}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* Error */}
                {error && <div className="alert alert-danger" style={{ marginBottom: '12px' }}>{error}</div>}

                {/* Submit */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '0.82rem', color: '#666' }}>
                        {allAnswered
                            ? <span style={{ color: '#1B5E20', fontWeight: 600 }}>✅ All {QUESTIONS.length} questions answered! Ready to submit.</span>
                            : <span>⏳ {QUESTIONS.length - answeredCount} question{QUESTIONS.length - answeredCount !== 1 ? 's' : ''} remaining</span>
                        }
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={!allAnswered || submitting}
                        style={{ minWidth: '180px' }}
                    >
                        {submitting ? '⏳ Submitting…' : '✅ Submit Feedback'}
                    </button>
                </div>

            </div>
        </div>
    );
}
