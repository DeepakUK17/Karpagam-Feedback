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

function getDeanLabel(facultyType) {
    if (!facultyType) return 'Dean';
    const ft = facultyType.toUpperCase();
    if (ft.includes('ENGINEERING') || ft.includes('FOE')) return 'Dean / FOE';
    if (ft.includes('PHARMACY') || ft.includes('FOP')) return 'Dean / FOP';
    if (ft.includes('ARTS') || ft.includes('SCIENCE') || ft.includes('FAS')) return 'Dean / FASam';
    return 'Dean';
}

export async function generatePDFReport(session, assignments, responses) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();   // 297
    const pageH = doc.internal.pageSize.getHeight();  // 210
    const marginL = 14;
    const marginR = 14;


    // ── LOGO (top left) ───────────────────────────────────────────
    try {
        const img = new Image();
        const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL)
            ? import.meta.env.BASE_URL : '/';
        img.src = base + 'logo.jpg';
        await new Promise((res) => { img.onload = res; img.onerror = res; });
        if (img.naturalWidth > 0) doc.addImage(img, 'JPEG', marginL, 6, 24, 24);
    } catch (_) { /* skip */ }


    // ── COLLEGE NAME & SUBTITLE ───────────────────────────────────
    let y = 12;
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 94, 32);
    doc.text('ABC COLLEGE', pageW / 2, y, { align: 'center' });

    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(46, 125, 50);
    doc.text('(Deemed to be University)', pageW / 2, y, { align: 'center' });

    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    doc.text('(Established Under Section 3 of UGC Act, 1956)', pageW / 2, y, { align: 'center' });

    y += 4.5;
    doc.text('Accredited with A+ Grade by NAAC in the Second cycle.', pageW / 2, y, { align: 'center' });

    // ── REPORT TITLE ─────────────────────────────────────────────
    y += 6;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 94, 32);
    doc.text('STUDENT FEEDBACK REPORT', pageW / 2, y, { align: 'center' });

    // ── DIVIDER ───────────────────────────────────────────────────
    y += 4;
    doc.setDrawColor(27, 94, 32);
    doc.setLineWidth(1);
    doc.line(marginL, y, pageW - marginR, y);

    // ── SESSION INFO  (4 stacked rows) ────────────────────────────
    y += 7;
    const info = [
        ['Faculty / Dept', session.faculty_type + (session.department ? ' – ' + session.department : '')],
        ['Batch', session.batch || '-'],
        ['Academic Year', session.academic_year || '-'],
        ['Year / Section', `${session.year || '-'} / ${session.section || '-'}`],
    ];
    doc.setFontSize(10);
    info.forEach(([label, val]) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(label + ':', marginL, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(val), 58, y);
        y += 5.5;
    });

    // ── AGGREGATE DATA ────────────────────────────────────────────
    const subjectMap = {};
    assignments.forEach(a => {
        if (!subjectMap[a.subject_code]) {
            subjectMap[a.subject_code] = {
                subject_code: a.subject_code,
                subject_name: a.subject_name,
                staff_name: a.staff_name,
                responses: [],
            };
        }
    });
    responses.forEach(r => {
        if (subjectMap[r.subject_code]) subjectMap[r.subject_code].responses.push(r);
    });

    const subjectAvgRows = [];
    Object.values(subjectMap).forEach(sub => {
        const resps = sub.responses;
        const count = resps.length;
        const qAvgs = Array.from({ length: 10 }, (_, i) => {
            const key = `q${i + 1}`;
            const vals = resps.filter(r => r[key] != null).map(r => r[key]);
            return vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2) : 'N/A';
        });
        const overallVals = resps.map(r =>
            [r.q1, r.q2, r.q3, r.q4, r.q5, r.q6, r.q7, r.q8, r.q9, r.q10]
                .filter(v => v != null).reduce((s, v) => s + v, 0) / 10
        );
        const overallAvg = overallVals.length
            ? (overallVals.reduce((s, v) => s + v, 0) / overallVals.length).toFixed(2)
            : 'N/A';
        subjectAvgRows.push([
            sub.subject_code, sub.subject_name || '-', sub.staff_name || '-',
            ...qAvgs, count, overallAvg,
        ]);
    });

    // ── SUBJECT-WISE TABLE ────────────────────────────────────────
    y += 2;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 94, 32);
    doc.text('SUBJECT-WISE FEEDBACK ANALYSIS', marginL, y);

    autoTable(doc, {
        startY: y + 3,
        head: [[
            'Course Code', 'Course Name', 'Staff Name',
            'Q1', 'Q2', 'Q3', 'Q4', 'Q5',
            'Q6', 'Q7', 'Q8', 'Q9', 'Q10',
            'Students\nCount', 'Avg of\nAll 10',
        ]],
        body: subjectAvgRows,
        theme: 'grid',
        headStyles: {
            fillColor: [27, 94, 32], textColor: 255, fontStyle: 'bold',
            fontSize: 8, halign: 'center', valign: 'middle', cellPadding: 2,
        },
        bodyStyles: { fontSize: 9, halign: 'center', valign: 'middle', cellPadding: 2, fillColor: [255, 255, 255] },
        columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 46, halign: 'left' },
            2: { cellWidth: 36, halign: 'left' },
            3: { cellWidth: 13 }, 4: { cellWidth: 13 },
            5: { cellWidth: 13 }, 6: { cellWidth: 13 },
            7: { cellWidth: 13 }, 8: { cellWidth: 13 },
            9: { cellWidth: 13 }, 10: { cellWidth: 13 },
            11: { cellWidth: 13 }, 12: { cellWidth: 13 },
            13: { cellWidth: 17 },
            14: { cellWidth: 18 },
        },
        margin: { left: marginL, right: marginR },
    });

    const BOTTOM_MARGIN = 16; // space reserved for page footer text
    const usablePageH = pageH - BOTTOM_MARGIN;

    // ── NOTE: QUESTION-WISE 2-COL TABLE ──────────────────────────
    // Estimate how tall the NOTE block will be:
    //   label row (6mm) + table header (8mm) + 5 body rows (≈7mm each) = ~49mm
    const NOTE_BLOCK_H = 49;

    const afterTableY = doc.lastAutoTable.finalY;
    const spaceLeft = usablePageH - afterTableY;

    let noteStartY;
    if (spaceLeft >= NOTE_BLOCK_H + 6) {
        // Enough room — keep it on the same page
        noteStartY = afterTableY + 6;
    } else {
        // Not enough room — push to a fresh page
        doc.addPage();
        noteStartY = 14;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 94, 32);
    doc.text('NOTE:', marginL, noteStartY);

    const qAvgAll = QUESTIONS.map((q, i) => {
        const key = `q${i + 1}`;
        const vals = responses.filter(r => r[key] != null).map(r => r[key]);
        const avg = vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2) : 'N/A';
        return { label: `Q${i + 1}`, question: q, avg };
    });

    const noteBody = Array.from({ length: 5 }, (_, i) => [
        qAvgAll[i].label, qAvgAll[i].question,
        qAvgAll[i + 5].label, qAvgAll[i + 5].question,
    ]);

    autoTable(doc, {
        startY: noteStartY + 3,
        head: [['Q#', 'Question (Q1 – Q5)', 'Q#', 'Question (Q6 – Q10)']],
        body: noteBody,
        theme: 'grid',
        headStyles: {
            fillColor: [27, 94, 32], textColor: 255, fontStyle: 'bold',
            fontSize: 9, halign: 'center', cellPadding: 2,
        },
        bodyStyles: { fontSize: 9, cellPadding: 2, fillColor: [255, 255, 255] },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 122.5 },
            2: { cellWidth: 12, halign: 'center' },
            3: { cellWidth: 122.5 },
        },
        // Never break the question rows across pages
        rowPageBreak: 'avoid',
        margin: { left: marginL, right: marginR },
    });

    // ── DEAN SIGNATURE  (bottom-right, on whichever page ended last) ──
    const deanLabel = getDeanLabel(session.faculty_type);
    const sigX = pageW - marginR;
    const sigY = (doc.lastAutoTable.finalY || 14) + 18;

    // Make sure signature fits on page
    if (usablePageH - sigY < 10) {
        doc.addPage();
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(deanLabel, sigX, 24, { align: 'right' });
    } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(deanLabel, sigX, sigY, { align: 'right' });
    }

    // ── FOOTER ────────────────────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    const genDate = new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    });
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount}  ·  ABC College  ·  Student Feedback Report`,
            pageW / 2, pageH - 9, { align: 'center' }
        );
        doc.text(
            `Generated on: ${genDate}`,
            pageW / 2, pageH - 5, { align: 'center' }
        );
    }

    doc.save(`Feedback_Report_${session.faculty_type}_${session.academic_year || 'NA'}_${Date.now()}.pdf`);
}

