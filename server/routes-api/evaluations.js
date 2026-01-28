import express from 'express';
import { requireAuth, requireRole } from '../auth/jwt.js';
import * as evaluationsService from '../services/evaluationsService.js';

const router = express.Router();

router.get('/jobs/:jobId', requireAuth, async (req, res) => {
  try {
    const evaluations = await evaluationsService.getEvaluationsForJob(req.params.jobId);
    const signoffs = await evaluationsService.getSignoffsForJob(req.params.jobId);

    res.json({
      evaluations,
      signoffs
    });
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ error: 'Fout bij ophalen evaluaties' });
  }
});

router.post('/', requireRole(['admin', 'directie']), async (req, res) => {
  try {
    const evaluationId = await evaluationsService.createOrUpdateEvaluation(
      req.body,
      req.session.userId
    );

    const evaluation = await evaluationsService.getEvaluationById(evaluationId);
    res.json(evaluation);
  } catch (error) {
    console.error('Error creating/updating evaluation:', error);
    res.status(500).json({ error: 'Fout bij opslaan evaluatie' });
  }
});

router.delete('/:id', requireRole(['admin', 'directie']), async (req, res) => {
  try {
    await evaluationsService.deleteEvaluation(req.params.id);
    res.json({ message: 'Evaluatie verwijderd' });
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    res.status(500).json({ error: 'Fout bij verwijderen evaluatie' });
  }
});

router.post('/jobs/:jobId/signoff', requireRole(['directie', 'admin']), async (req, res) => {
  try {
    const userRole = req.session.userRole;
    const signoffRole = userRole === 'directie' ? 'directie' : 'admin';

    const signoffId = await evaluationsService.addSignoff(
      req.params.jobId,
      signoffRole,
      req.session.userId
    );

    res.json({ id: signoffId, message: 'Aftekening geregistreerd' });
  } catch (error) {
    console.error('Error adding signoff:', error);
    res.status(500).json({ error: 'Fout bij aftekenen' });
  }
});

export default router;
