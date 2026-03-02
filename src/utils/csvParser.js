// CSV Parser + Supabase DB populate utility
import Papa from 'papaparse';
import { supabase } from '../supabase';

export async function parseAndUploadCSV(file, facultyType) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const rows = results.data;
                    if (!rows.length) throw new Error('CSV file is empty');

                    // ---- Extract session-level metadata from first row ----
                    const first = rows[0];
                    const sessionLabel = `${first.department || facultyType} – Batch ${first.batch || '?'} | Yr ${first.year || '?'} | Sec ${first.section || '?'} | ${first.academic_year || '?'}`;

                    // Create feedback session
                    const { data: session, error: sessionErr } = await supabase
                        .from('feedback_sessions')
                        .insert({
                            faculty_type: facultyType,
                            academic_year: first.academic_year,
                            batch: first.batch,
                            department: first.department,
                            year: parseInt(first.year) || null,
                            section: first.section,
                            session_label: sessionLabel,
                            status: 'active',
                            deleted: false,
                        })
                        .select()
                        .single();

                    if (sessionErr) throw sessionErr;

                    const sessionId = session.id;
                    const staffUpserts = [];
                    const studentUpserts = [];
                    const assignmentInserts = [];

                    rows.forEach(row => {
                        // Staff upsert
                        if (row.staff_id && row.staff_name) {
                            staffUpserts.push({
                                staff_id: row.staff_id.trim(),
                                staff_name: row.staff_name.trim(),
                                faculty_type: facultyType,
                            });
                        }
                        // Student upsert  
                        if (row.roll_number && row.student_name) {
                            studentUpserts.push({
                                roll_number: row.roll_number.trim(),
                                student_name: row.student_name.trim(),
                                department: row.department?.trim(),
                                faculty_type: facultyType,
                            });
                        }
                        // Assignment insert
                        if (row.roll_number && row.subject_code && row.staff_id) {
                            assignmentInserts.push({
                                session_id: sessionId,
                                roll_number: row.roll_number.trim(),
                                student_name: row.student_name?.trim(),
                                subject_code: row.subject_code.trim(),
                                subject_name: row.subject_name?.trim(),
                                staff_id: row.staff_id.trim(),
                                staff_name: row.staff_name?.trim(),
                                completed: false,
                            });
                        }
                    });

                    // Upsert staff
                    if (staffUpserts.length) {
                        const uniqueStaff = [...new Map(staffUpserts.map(s => [s.staff_id, s])).values()];
                        const { error: staffErr } = await supabase
                            .from('staff')
                            .upsert(uniqueStaff, { onConflict: 'staff_id' });
                        if (staffErr) throw staffErr;
                    }

                    // Upsert students
                    if (studentUpserts.length) {
                        const uniqueStudents = [...new Map(studentUpserts.map(s => [s.roll_number, s])).values()];
                        // Only upsert, don't overwrite password
                        for (const student of uniqueStudents) {
                            const { error: stuErr } = await supabase
                                .from('students')
                                .upsert(student, { onConflict: 'roll_number', ignoreDuplicates: true });
                            if (stuErr) console.warn('Student upsert warning:', stuErr.message);
                        }
                    }

                    // Insert assignments
                    if (assignmentInserts.length) {
                        const { error: assignErr } = await supabase
                            .from('feedback_assignments')
                            .insert(assignmentInserts);
                        if (assignErr) throw assignErr;
                    }

                    resolve({ sessionId, totalStudents: [...new Set(rows.map(r => r.roll_number))].length, totalAssignments: assignmentInserts.length });
                } catch (err) {
                    reject(err);
                }
            },
            error: (err) => reject(err),
        });
    });
}
