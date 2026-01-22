import { executeQuery, executeTransaction } from '../db/client.js';

export async function getAllApplications() {
  const result = await executeQuery(`
    SELECT a.id, a.candidate_id, a.source, a.received_at, a.created_at, a.created_by_user_id,
           a.status, a.next_step,
           c.name as candidate_name,
           c.subjects as candidate_subjects,
           c.staff_notes,
           u.email as creator_email
    FROM applications a
    JOIN candidates c ON a.candidate_id = c.id
    LEFT JOIN users u ON a.created_by_user_id = u.id
    ORDER BY a.created_at DESC
  `);
  return result.rows;
}

export async function getApplicationById(id) {
  const result = await executeQuery(
    `SELECT a.id, a.candidate_id, a.source, a.received_at, a.created_at, a.created_by_user_id,
            a.status, a.next_step,
            c.name as candidate_name,
            c.subjects as candidate_subjects,
            c.staff_notes
     FROM applications a
     JOIN candidates c ON a.candidate_id = c.id
     WHERE a.id = ?`,
    [id]
  );
  return result.rows[0] || null;
}

export async function createApplication(applicationData, createdBy) {
  const result = await executeQuery(
    `INSERT INTO applications (candidate_id, source, received_at, created_by_user_id)
     VALUES (?, ?, ?, ?)`,
    [
      applicationData.candidate_id,
      applicationData.source || 'manual',
      applicationData.received_at || new Date().toISOString(),
      createdBy
    ]
  );
  return result.lastInsertRowid;
}

export async function updateApplication(id, applicationData) {
  const updates = [];
  const params = [];

  if (applicationData.source !== undefined) {
    updates.push('source = ?');
    params.push(applicationData.source);
  }
  if (applicationData.received_at !== undefined) {
    updates.push('received_at = ?');
    params.push(applicationData.received_at);
  }
  if (applicationData.status !== undefined) {
    updates.push('status = ?');
    params.push(applicationData.status);
  }
  if (applicationData.next_step !== undefined) {
    updates.push('next_step = ?');
    params.push(applicationData.next_step);
  }

  if (updates.length === 0) {
    return await getApplicationById(id);
  }

  params.push(id);

  await executeQuery(
    `UPDATE applications SET ${updates.join(', ')} WHERE id = ?`,
    params
  );
  return await getApplicationById(id);
}

export async function deleteApplication(id) {
  await executeQuery('DELETE FROM applications WHERE id = ?', [id]);
}

export async function linkApplicationToJobs(applicationId, jobIds) {
  // First, remove existing links
  await executeQuery('DELETE FROM application_jobs WHERE application_id = ?', [applicationId]);

  // Then add new links
  if (jobIds && jobIds.length > 0) {
    const queries = jobIds.map(jobId => ({
      sql: 'INSERT INTO application_jobs (application_id, job_id) VALUES (?, ?)',
      params: [applicationId, jobId]
    }));
    await executeTransaction(queries);
  }
}

export async function getJobsForApplication(applicationId) {
  const result = await executeQuery(
    `SELECT j.*
     FROM jobs j
     JOIN application_jobs aj ON j.id = aj.job_id
     WHERE aj.application_id = ?`,
    [applicationId]
  );
  return result.rows;
}

export async function getApplicationsForJob(jobId) {
  const result = await executeQuery(
    `SELECT a.id, a.candidate_id, a.source, a.received_at, a.created_at, a.created_by_user_id,
            a.status, a.next_step,
            c.name as candidate_name,
            c.subjects as candidate_subjects
     FROM applications a
     JOIN candidates c ON a.candidate_id = c.id
     JOIN application_jobs aj ON a.id = aj.application_id
     WHERE aj.job_id = ?
     ORDER BY a.created_at DESC`,
    [jobId]
  );
  return result.rows;
}

export async function getAttachmentsForApplication(applicationId) {
  const result = await executeQuery(
    'SELECT * FROM attachments WHERE application_id = ? ORDER BY uploaded_at DESC',
    [applicationId]
  );
  return result.rows;
}

export async function addAttachment(applicationId, attachmentData) {
  const result = await executeQuery(
    'INSERT INTO attachments (application_id, kind, filename, storage_path, mime_type) VALUES (?, ?, ?, ?, ?)',
    [
      applicationId,
      attachmentData.kind,
      attachmentData.filename,
      attachmentData.storage_path,
      attachmentData.mime_type
    ]
  );
  return result.lastInsertRowid;
}
