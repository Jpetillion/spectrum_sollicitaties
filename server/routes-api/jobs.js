import express from 'express';
import { requireAuth, requireRole } from '../auth/jwt.js';
import * as jobsService from '../services/jobsService.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const jobs = await jobsService.getJobsWithApplicationCount();
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Fout bij ophalen vacatures' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const job = await jobsService.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Vacature niet gevonden' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Fout bij ophalen vacature' });
  }
});

router.post('/', requireRole(['admin', 'directie', 'staf']), async (req, res) => {
  try {
    const jobId = await jobsService.createJob(req.body, req.session.userId);
    const job = await jobsService.getJobById(jobId);
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Fout bij aanmaken vacature' });
  }
});

router.put('/:id', requireRole(['admin', 'directie', 'staf']), async (req, res) => {
  try {
    const job = await jobsService.updateJob(req.params.id, req.body);
    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Fout bij bijwerken vacature' });
  }
});

router.delete('/:id', requireRole(['admin', 'directie', 'staf']), async (req, res) => {
  try {
    await jobsService.deleteJob(req.params.id);
    res.json({ message: 'Vacature verwijderd' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Fout bij verwijderen vacature' });
  }
});

export default router;
