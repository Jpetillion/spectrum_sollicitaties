import { executeQuery } from '../db/client.js';

export async function getAllCandidates() {
  const result = await executeQuery(`
    SELECT c.*,
           COUNT(DISTINCT a.id) as application_count
    FROM candidates c
    LEFT JOIN applications a ON c.id = a.candidate_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `);
  return result.rows;
}

export async function getCandidateById(id) {
  const result = await executeQuery('SELECT * FROM candidates WHERE id = ?', [id]);
  return result.rows[0];
}

export async function createCandidate(candidateData) {
  const result = await executeQuery(
    'INSERT INTO candidates (name, subjects, staff_notes) VALUES (?, ?, ?)',
    [candidateData.name, candidateData.subjects, candidateData.staff_notes]
  );
  return result.lastInsertRowid;
}

export async function updateCandidate(id, candidateData) {
  await executeQuery(
    'UPDATE candidates SET name = ?, subjects = ?, staff_notes = ? WHERE id = ?',
    [candidateData.name, candidateData.subjects, candidateData.staff_notes, id]
  );
  return await getCandidateById(id);
}

export async function deleteCandidate(id) {
  await executeQuery('DELETE FROM candidates WHERE id = ?', [id]);
}

export async function searchCandidates(searchTerm) {
  const pattern = `%${searchTerm}%`;
  const result = await executeQuery(`
    SELECT c.*,
           COUNT(DISTINCT a.id) as application_count
    FROM candidates c
    LEFT JOIN applications a ON c.id = a.candidate_id
    WHERE c.name LIKE ? OR c.subjects LIKE ?
    GROUP BY c.id
    ORDER BY c.name
  `, [pattern, pattern]);
  return result.rows;
}
