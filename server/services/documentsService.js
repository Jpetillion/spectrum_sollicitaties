import { executeQuery } from '../db/client.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage directory (local development)
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Upload document to local storage (Vercel Blob in production)
export async function uploadDocument(candidateId, type, file, uploadedByUserId) {
  await ensureUploadDir();

  // Generate unique filename
  const timestamp = Date.now();
  const ext = path.extname(file.originalname);
  const basename = path.basename(file.originalname, ext);
  const filename = `${candidateId}_${type}_${timestamp}_${basename}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // Save file to disk
  await fs.writeFile(filepath, file.buffer);

  // In production, you would upload to Vercel Blob here instead:
  // const blob = await put(filename, file.buffer, { access: 'public' });
  // const url = blob.url;

  // For now, use relative path
  const url = `/uploads/${filename}`;

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

  // Delete file from storage
  if (document.url_or_path.startsWith('/uploads/')) {
    const filepath = path.join(__dirname, '../../', document.url_or_path);
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue even if file doesn't exist
    }
  }

  // Delete from database
  await executeQuery('DELETE FROM candidate_documents WHERE id = ?', [id]);
}
