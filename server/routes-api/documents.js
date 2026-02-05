import express from 'express';
import { requireAuth, requireRole } from '../auth/jwt.js';
import { upload } from '../storage/upload.js';
import * as documentsService from '../services/documentsService.js';

const router = express.Router();

// Upload document voor een kandidaat
router.post(
  '/candidates/:candidateId/upload',
  requireRole(['staf', 'admin', 'directie']),
  upload.single('document'),
  async (req, res) => {
    try {
      console.log('[DOCS API] POST /candidates/:candidateId/upload called:', {
        candidateId: req.params.candidateId,
        type: req.body.type,
        hasFile: !!req.file,
        fileName: req.file?.originalname,
        fileSize: req.file?.size,
        user: req.session?.userId
      });

      const { candidateId } = req.params;
      const { type } = req.body; // 'cv', 'brief', or 'extra'

      if (!req.file) {
        console.error('[DOCS API] No file uploaded');
        return res.status(400).json({ error: 'Geen bestand geüpload' });
      }

      if (!['cv', 'brief', 'extra'].includes(type)) {
        console.error('[DOCS API] Invalid document type:', type);
        return res.status(400).json({ error: 'Ongeldig documenttype. Gebruik: cv, brief, of extra' });
      }

      const document = await documentsService.uploadDocument(
        candidateId,
        type,
        req.file,
        req.session.userId
      );

      console.log('[DOCS API] Document uploaded successfully:', document.id);
      res.status(201).json(document);
    } catch (error) {
      console.error('[DOCS API] Error uploading document:', error);
      res.status(500).json({ error: error.message || 'Fout bij uploaden document' });
    }
  }
);

// Haal documenten op voor een kandidaat
router.get('/candidates/:candidateId', requireAuth, async (req, res) => {
  try {
    const { candidateId } = req.params;
    const documents = await documentsService.getDocumentsByCandidate(candidateId);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Fout bij ophalen documenten' });
  }
});

// Download/bekijk een specifiek document
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const document = await documentsService.getDocumentById(id);

    if (!document) {
      return res.status(404).json({ error: 'Document niet gevonden' });
    }

    // Redirect naar de opgeslagen URL (Vercel Blob of local storage)
    res.redirect(document.url_or_path);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Fout bij ophalen document' });
  }
});

// Verwijder een document
router.delete('/:id', requireRole(['admin', 'directie']), async (req, res) => {
  try {
    const { id } = req.params;
    await documentsService.deleteDocument(id);
    res.json({ message: 'Document verwijderd' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Fout bij verwijderen document' });
  }
});

export default router;
