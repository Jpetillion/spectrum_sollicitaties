import { executeQuery } from '../db/client.js';
import { uploadFile, deleteFile } from '../storage/blob-storage.js';

// Upload document to Vercel Blob (production) or local storage (development)
export async function uploadDocument(candidateId, type, file, uploadedByUserId) {
  // Upload file using blob-storage module (handles both Vercel Blob and local storage)
  const { url, pathname } = await uploadFile(file.buffer, file.originalname, file.mimetype);

  // Insert into database
  const result = await executeQuery(
    `INSERT INTO candidate_documents (candidate_id, type, filename, url_or_path, uploaded_by_user_id)
     VALUES (?, ?, ?, ?, ?)`,
    [candidateId, type, file.originalname, url, uploadedByUserId]
  );

  return getDocumentById(result.lastInsertRowid);
}

// Get all documents for a candidate
export async function getDocumentsByCandidate(candidateId) {
  const result = await executeQuery(
    `SELECT d.*, u.email as uploaded_by_email
     FROM candidate_documents d
     LEFT JOIN users u ON d.uploaded_by_user_id = u.id
     WHERE d.candidate_id = ?
     ORDER BY d.created_at DESC`,
    [candidateId]
  );
  return result.rows;
}

// Get single document by ID
export async function getDocumentById(id) {
  const result = await executeQuery(
    `SELECT d.*, u.email as uploaded_by_email
     FROM candidate_documents d
     LEFT JOIN users u ON d.uploaded_by_user_id = u.id
     WHERE d.id = ?`,
    [id]
  );
  return result.rows[0];
}

// Delete document
export async function deleteDocument(id) {
  const document = await getDocumentById(id);

  if (!document) {
    throw new Error('Document niet gevonden');
  }

  // Delete file from storage (Vercel Blob or local)
  try {
    await deleteFile(document.url_or_path);
  } catch (error) {
    console.error('Error deleting file:', error);
    // Continue even if file doesn't exist
  }

  // Delete from database
  await executeQuery('DELETE FROM candidate_documents WHERE id = ?', [id]);
}
