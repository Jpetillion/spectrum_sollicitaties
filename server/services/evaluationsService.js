import { executeQuery } from '../db/client.js';

export async function getEvaluationsForJob(jobId) {
  const result = await executeQuery(
    `SELECT e.*,
            a.id as application_id,
            c.first_name, c.last_name,
            u.email as evaluator_email
     FROM evaluations e
     JOIN applications a ON e.application_id = a.id
     JOIN candidates c ON a.candidate_id = c.id
     LEFT JOIN users u ON e.evaluator_user_id = u.id
     WHERE e.job_id = ?
     ORDER BY e.ranking_int ASC, c.last_name, c.first_name`,
    [jobId]
  );
  return result.rows;
}

export async function getEvaluationById(id) {
  const result = await executeQuery('SELECT * FROM evaluations WHERE id = ?', [id]);
  return result.rows[0] || null;
}

export async function createOrUpdateEvaluation(evaluationData, evaluatorUserId) {
  // Check if evaluation already exists
  const existing = await executeQuery(
    'SELECT id FROM evaluations WHERE job_id = ? AND application_id = ?',
    [evaluationData.job_id, evaluationData.application_id]
  );

  if (existing.rows.length > 0) {
    // Update existing
    await executeQuery(
      `UPDATE evaluations
       SET interview_date = ?, interview_time = ?, verdict = ?, ranking_int = ?, chosen_bool = ?,
           evaluator_user_id = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        evaluationData.interview_date,
        evaluationData.interview_time,
        evaluationData.verdict,
        evaluationData.ranking_int,
        evaluationData.chosen_bool ? 1 : 0,
        evaluatorUserId,
        existing.rows[0].id
      ]
    );
    return existing.rows[0].id;
  } else {
    // Create new
    const result = await executeQuery(
      `INSERT INTO evaluations (job_id, application_id, interview_date, interview_time, verdict, ranking_int, chosen_bool, evaluator_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        evaluationData.job_id,
        evaluationData.application_id,
        evaluationData.interview_date,
        evaluationData.interview_time,
        evaluationData.verdict,
        evaluationData.ranking_int,
        evaluationData.chosen_bool ? 1 : 0,
        evaluatorUserId
      ]
    );
    return result.lastInsertRowid;
  }
}

export async function deleteEvaluation(id) {
  await executeQuery('DELETE FROM evaluations WHERE id = ?', [id]);
}

export async function getSignoffsForJob(jobId) {
  const result = await executeQuery(
    `SELECT s.*, u.email as signed_by_email
     FROM selection_signoffs s
     JOIN users u ON s.signed_by_user_id = u.id
     WHERE s.job_id = ?`,
    [jobId]
  );
  return result.rows;
}

export async function addSignoff(jobId, role, userId) {
  // Check if already signed
  const existing = await executeQuery(
    'SELECT id FROM selection_signoffs WHERE job_id = ? AND role = ?',
    [jobId, role]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  const result = await executeQuery(
    'INSERT INTO selection_signoffs (job_id, role, signed_by_user_id) VALUES (?, ?, ?)',
    [jobId, role, userId]
  );
  return result.lastInsertRowid;
}
