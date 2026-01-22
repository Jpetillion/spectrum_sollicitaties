import express from 'express';
import { requireAuth, requireRole } from '../auth/session.js';
import * as candidatesService from '../services/candidatesService.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const { search } = req.query;
    let candidates;

    if (search) {
      candidates = await candidatesService.searchCandidates(search);
    } else {
      candidates = await candidatesService.getAllCandidates();
    }

    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Fout bij ophalen kandidaten' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const candidate = await candidatesService.getCandidateById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Kandidaat niet gevonden' });
    }
    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Fout bij ophalen kandidaat' });
  }
});

router.post('/', requireRole(['staf', 'admin']), async (req, res) => {
  try {
    const candidateId = await candidatesService.createCandidate(req.body);
    const candidate = await candidatesService.getCandidateById(candidateId);
    res.status(201).json(candidate);
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ error: 'Fout bij aanmaken kandidaat' });
  }
});

router.put('/:id', requireRole(['staf', 'admin']), async (req, res) => {
  try {
    const candidate = await candidatesService.updateCandidate(req.params.id, req.body);
    res.json(candidate);
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: 'Fout bij bijwerken kandidaat' });
  }
});

router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    await candidatesService.deleteCandidate(req.params.id);
    res.json({ message: 'Kandidaat verwijderd' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Fout bij verwijderen kandidaat' });
  }
});

export default router;
