import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    'Fulfilment of expectation of the course (over all satisfaction)',
];

export async function generatePDFReport(session, assignments, responses) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();

    // ---- Header ----
    // Try to add logo
    try {
        const img = new Image();
        img.src = '/logo.jpg';
        await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
        doc.addImage(img, 'JPEG', pageW / 2 - 12, 8, 24, 24);
    } catch (_) { /* skip logo if fails */ }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 94, 32);
    doc.text('KARPAGAM ACADEMY OF HIGHER EDUCATION', pageW / 2, 38, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('(Deemed to be University) · Enable | Enlighten | Enrich', pageW / 2, 44, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 94, 32);
    doc.text('STUDENT FEEDBACK REPORT', pageW / 2, 52, { align: 'center' });

    // Divider
    doc.setDrawColor(46, 125, 50);
    doc.setLineWidth(0.8);
    doc.line(14, 55, pageW - 14, 55);

    // Session info
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    const info = [
        ['Faculty / Dept', session.faculty_type + (session.department ? ' – ' + session.department : '')],
        ['Batch', session.batch || '-'],
        ['Academic Year', session.academic_year || '-'],
        ['Year / Section', `${session.year || '-'} / ${session.section || '-'}`],
        ['Generated On', new Date().toLocaleString('en-IN')],
    ];
    let y = 60;
    info.forEach(([label, val]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label + ':', 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(val, 55, y);
        y += 5.5;
    });

    // ---- Aggregate by subject ----
    const subjectMap = {};
    assignments.forEach(a => {
        if (!subjectMap[a.subject_code]) {
            subjectMap[a.subject_code] = {
                subject_code: a.subject_code,
                subject_name: a.subject_name,
                staff_id: a.staff_id,
                staff_name: a.staff_name,
                responses: [],
            };
        }
    });

    responses.forEach(r => {
        if (subjectMap[r.subject_code]) {
            const total = (r.q1 + r.q2 + r.q3 + r.q4 + r.q5 + r.q6 + r.q7 + r.q8 + r.q9 + r.q10) / 10;
            subjectMap[r.subject_code].responses.push({ r, total });
        }
    });

    const subjectAvgRows = [];
    let grandTotalSum = 0, grandCount = 0;

    Object.values(subjectMap).forEach(sub => {
        const respCount = sub.responses.length;
        const avg = respCount > 0
            ? sub.responses.reduce((s, x) => s + x.total, 0) / respCount
            : 0;
        grandTotalSum += avg * respCount;
        grandCount += respCount;
        subjectAvgRows.push([
            sub.subject_code,
            sub.subject_name || '-',
            sub.staff_name || '-',
            respCount,
            avg > 0 ? avg.toFixed(2) : 'N/A',
            avg > 0 ? ((avg / 5) * 100).toFixed(1) + '%' : 'N/A',
        ]);
    });

    const overallAvg = grandCount > 0 ? grandTotalSum / grandCount : 0;

    // ---- Summary Stats Table ----
    y += 4;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 94, 32);
    doc.text('SUMMARY', 14, y);
    y += 3;

    const totalAssigned = [...new Set(assignments.map(a => a.roll_number))].length;
    const totalCompleted = [...new Set(assignments.filter(a => a.completed).map(a => a.roll_number))].length;

    autoTable(doc, {
        startY: y,
        head: [['Total Students', 'Completed', 'Pending', 'Completion %', 'Overall Avg (out of 5)']],
        body: [[
            totalAssigned,
            totalCompleted,
            totalAssigned - totalCompleted,
            totalAssigned > 0 ? ((totalCompleted / totalAssigned) * 100).toFixed(1) + '%' : '0%',
            overallAvg > 0 ? overallAvg.toFixed(2) : 'N/A',
        ]],
        theme: 'grid',
        headStyles: { fillColor: [27, 94, 32], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 9, halign: 'center' },
        margin: { left: 14, right: 14 },
    });

    // ---- Subject-wise Table ----
    const afterSummary = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 94, 32);
    doc.text('SUBJECT-WISE FEEDBACK ANALYSIS', 14, afterSummary);

    autoTable(doc, {
        startY: afterSummary + 3,
        head: [['Code', 'Subject Name', 'Staff Name', 'Responses', 'Avg Score', 'Percentage']],
        body: subjectAvgRows,
        theme: 'striped',
        headStyles: { fillColor: [27, 94, 32], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [232, 245, 233] },
        columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 55 },
            2: { cellWidth: 45 },
            3: { cellWidth: 22, halign: 'center' },
            4: { cellWidth: 18, halign: 'center' },
            5: { cellWidth: 22, halign: 'center' },
        },
        margin: { left: 14, right: 14 },
    });

    // ---- Question-wise breakdown ----
    const qStartY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 94, 32);
    doc.text('QUESTION-WISE AVERAGE (ALL SUBJECTS)', 14, qStartY);

    const qAvgs = QUESTIONS.map((q, i) => {
        const qKey = `q${i + 1}`;
        const vals = responses.filter(r => r[qKey] != null).map(r => r[qKey]);
        const avg = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
        return [`Q${i + 1}`, q.length > 70 ? q.substring(0, 67) + '...' : q, vals.length, avg > 0 ? avg.toFixed(2) : 'N/A'];
    });

    autoTable(doc, {
        startY: qStartY + 3,
        head: [['Q#', 'Question', 'Responses', 'Avg (1-5)']],
        body: qAvgs,
        theme: 'striped',
        headStyles: { fillColor: [46, 125, 50], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
        alternateRowStyles: { fillColor: [232, 245, 233] },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 115 },
            2: { cellWidth: 22, halign: 'center' },
            3: { cellWidth: 20, halign: 'center' },
        },
        margin: { left: 14, right: 14 },
    });

    // ---- Footer ----
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount} · Karpagam Academy of Higher Education · Feedback Report · Generated: ${new Date().toLocaleString('en-IN')}`,
            pageW / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' }
        );
    }

    doc.save(`Feedback_Report_${session.faculty_type}_${session.academic_year || 'NA'}_${Date.now()}.pdf`);
}
