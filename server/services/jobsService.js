import { executeQuery } from '../db/client.js';

export async function getAllJobs() {
  const result = await executeQuery(`
    SELECT j.*
    FROM jobs j
    WHERE j.is_active = 1
    ORDER BY j.created_at DESC
  `);
  return result.rows;
}

export async function getJobById(id) {
  const result = await executeQuery(
    'SELECT * FROM jobs WHERE id = ?',
    [id]
  );
  return result.rows[0] || null;
}

export async function createJob(jobData, createdBy) {
  const result = await executeQuery(
    `INSERT INTO jobs (title, vak, hours, classes, notes)
     VALUES (?, ?, ?, ?, ?)`,
    [
      jobData.title,
      jobData.vak,
      jobData.hours,
      jobData.classes,
      jobData.notes
    ]
  );
  return result.lastInsertRowid;
}

export async function updateJob(id, jobData) {
  await executeQuery(
    `UPDATE jobs
     SET title = ?, vak = ?, hours = ?, classes = ?, notes = ?
     WHERE id = ?`,
    [
      jobData.title,
      jobData.vak,
      jobData.hours,
      jobData.classes,
      jobData.notes,
      id
    ]
  );
  return await getJobById(id);
}

export async function deleteJob(id) {
  await executeQuery('DELETE FROM jobs WHERE id = ?', [id]);
}

export async function getJobsWithApplicationCount() {
  const result = await executeQuery(`
    SELECT j.*, COUNT(DISTINCT aj.application_id) as application_count
    FROM jobs j
    LEFT JOIN application_jobs aj ON j.id = aj.job_id
    GROUP BY j.id
    ORDER BY j.created_at DESC
  `);
  return result.rows;
}
