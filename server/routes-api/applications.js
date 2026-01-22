import express from 'express';
import { requireAuth, requireRole } from '../auth/session.js';
import { upload } from '../storage/upload.js';
import { uploadFile } from '../storage/blob-storage.js';
import * as applicationsService from '../services/applicationsService.js';
import * as notificationsService from '../services/notificationsService.js';
import * as candidatesService from '../services/candidatesService.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const applications = await applicationsService.getAllApplications();

    // Load jobs for each application
    const applicationsWithJobs = await Promise.all(
      applications.map(async (app) => {
        const jobs = await applicationsService.getJobsForApplication(app.id);
        return { ...app, jobs };
      })
    );

    res.json(applicationsWithJobs);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Fout bij ophalen sollicitaties' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const application = await applicationsService.getApplicationById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Sollicitatie niet gevonden' });
    }

    const jobs = await applicationsService.getJobsForApplication(req.params.id);
    const attachments = await applicationsService.getAttachmentsForApplication(req.params.id);

    res.json({
      ...application,
      jobs,
      attachments
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Fout bij ophalen sollicitatie' });
  }
});

router.post('/', requireRole(['staf', 'admin']), async (req, res) => {
  try {
    const { job_ids, ...applicationData } = req.body;

    console.log('[POST /applications] Creating application:', { applicationData, job_ids, userId: req.session.userId });

    const applicationId = await applicationsService.createApplication(
      applicationData,
      req.session.userId
    );

    console.log('[POST /applications] Application created with ID:', applicationId);

    if (job_ids && job_ids.length > 0) {
      await applicationsService.linkApplicationToJobs(applicationId, job_ids);
      console.log('[POST /applications] Linked to jobs:', job_ids);
    }

    // Send notifications
    const candidate = await candidatesService.getCandidateById(applicationData.candidate_id);
    if (!candidate) {
      console.error('[POST /applications] Candidate not found:', applicationData.candidate_id);
      throw new Error('Kandidaat niet gevonden');
    }
    const candidateName = candidate.name;
    await notificationsService.notifyNewApplication(applicationId, candidateName);

    const application = await applicationsService.getApplicationById(applicationId);
    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: error.message || 'Fout bij aanmaken sollicitatie' });
  }
});

router.put('/:id', requireRole(['staf', 'admin', 'directie']), async (req, res) => {
  try {
    const { job_ids, ...applicationData } = req.body;

    console.log('[PUT /applications/:id] Updating application:', {
      id: req.params.id,
      applicationData,
      job_ids,
      user: req.session.userId,
      role: req.session.userRole
    });

    const application = await applicationsService.updateApplication(req.params.id, applicationData);

    if (job_ids !== undefined) {
      await applicationsService.linkApplicationToJobs(req.params.id, job_ids);
    }

    console.log('[PUT /applications/:id] Application updated successfully');
    res.json(application);
  } catch (error) {
    console.error('[PUT /applications/:id] Error updating application:', error);
    res.status(500).json({ error: 'Fout bij bijwerken sollicitatie' });
  }
});

router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    await applicationsService.deleteApplication(req.params.id);
    res.json({ message: 'Sollicitatie verwijderd' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Fout bij verwijderen sollicitatie' });
  }
});

router.post('/:id/attachments', requireRole(['admin']), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Geen bestand geüpload' });
    }

    // Upload file to Vercel Blob or local storage
    const { url, pathname } = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    const attachmentId = await applicationsService.addAttachment(req.params.id, {
      kind: req.body.kind || 'other',
      filename: req.file.originalname,
      storage_path: pathname, // Store the pathname or URL
      storage_url: url, // Store the full URL for easy access
      mime_type: req.file.mimetype
    });

    res.status(201).json({
      id: attachmentId,
      filename: req.file.originalname,
      url: url,
      kind: req.body.kind || 'other'
    });
  } catch (error) {
    console.error('Error uploading attachment:', error);
    res.status(500).json({ error: 'Fout bij uploaden bijlage' });
  }
});

export default router;
