import { executeQuery } from './client.js';
import { hashPassword } from '../auth/password.js';

export async function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Create default users
  const defaultPassword = await hashPassword('Welcome123!');

  const users = [
    // ADMIN
    { name: 'Joris Petillion', email: 'joris.petillion@onderwijs.gent.be', role: 'admin' },
    { name: 'Steven Desmet', email: 'steven.desmet@onderwijs.gent.be', role: 'admin' },

    // DIRECTIE
    { name: 'De Doncker Caroline', email: 'caroline.dedoncker@onderwijs.gent.be', role: 'directie' },
    { name: 'Bicici Ediz', email: 'ediz.bicici@onderwijs.gent.be', role: 'directie' },
    { name: 'Orlans Charlene', email: 'charlene.orlans@onderwijs.gent.be', role: 'directie' },

    // STAF
    { name: 'Spectrum Personeel', email: 'spectrum.personeel@onderwijs.gent.be', role: 'staf' },
    { name: 'Sarah Meirlaen', email: 'sarah.meirlaen@onderwijs.gent.be', role: 'staf' },
    { name: 'Elien Lemaire', email: 'elien.lemaire@onderwijs.gent.be', role: 'staf' },
    { name: 'Jasper Brondeel', email: 'jasper.brondeel@onderwijs.gent.be', role: 'staf' },
    { name: 'Chahrazad Dafi', email: 'chahrazad.dafi@onderwijs.gent.be', role: 'staf' },
  ];

  for (const user of users) {
    try {
      await executeQuery(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, defaultPassword, user.role]
      );
      console.log(`✓ Created user: ${user.name} <${user.email}> (password: Welcome123!)`);
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        console.log(`→ User ${user.email} already exists`);
      } else {
        throw error;
      }
    }
  }

  // Create next_steps
  const nextSteps = [
    { label: 'Mailen', sort_order: 1 },
    { label: 'Bellen', sort_order: 2 },
    { label: 'Gesprek', sort_order: 3 }
  ];

  for (const step of nextSteps) {
    try {
      await executeQuery(
        'INSERT INTO next_steps (label, sort_order) VALUES (?, ?)',
        [step.label, step.sort_order]
      );
      console.log(`✓ Created next step: ${step.label}`);
    } catch (error) {
      console.log(`→ Next step ${step.label} might already exist`);
    }
  }

  // Create sample jobs
  const sampleJobs = [
    {
      title: 'Leraar Wiskunde',
      vak: 'Wiskunde',
      hours: 20,
      classes: '5e-6e jaar',
      notes: 'Master in de wiskunde, pedagogische bekwaamheid vereist'
    },
    {
      title: 'Leraar Nederlands',
      vak: 'Nederlands',
      hours: 18,
      classes: '3e-4e jaar',
      notes: 'Master taal- en letterkunde Nederlands, ervaring gewenst'
    }
  ];

  for (const job of sampleJobs) {
    try {
      await executeQuery(
        `INSERT INTO jobs (title, vak, hours, classes, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [job.title, job.vak, job.hours, job.classes, job.notes]
      );
      console.log(`✓ Created job: ${job.title}`);
    } catch (error) {
      console.log(`→ Job ${job.title} might already exist`);
    }
  }

  // Create sample candidates
  const sampleCandidates = [
    {
      name: 'Jan Peeters',
      subjects: 'Wiskunde, Natuurkunde',
      staff_notes: 'Sterke kandidaat met 5 jaar ervaring'
    },
    {
      name: 'Marie Janssens',
      subjects: 'Nederlands, Frans',
      staff_notes: 'Pas afgestudeerd, zeer enthousiast'
    },
    {
      name: 'Pieter De Vries',
      subjects: 'Wiskunde',
      staff_notes: 'Goede referenties, solliciteert spontaan'
    }
  ];

  for (const candidate of sampleCandidates) {
    try {
      await executeQuery(
        `INSERT INTO candidates (name, subjects, staff_notes)
         VALUES (?, ?, ?)`,
        [candidate.name, candidate.subjects, candidate.staff_notes]
      );
      console.log(`✓ Created candidate: ${candidate.name}`);
    } catch (error) {
      console.log(`→ Candidate ${candidate.name} might already exist`);
    }
  }

  // Create sample applications
  const sampleApplications = [
    {
      candidate_id: 1,
      source: 'email',
      received_at: '2025-01-05 10:30:00',
      created_by_user_id: 1,
      job_ids: [1]
    },
    {
      candidate_id: 2,
      source: 'manual',
      received_at: '2025-01-06 14:15:00',
      created_by_user_id: 1,
      job_ids: [2]
    },
    {
      candidate_id: 3,
      source: 'email',
      received_at: '2025-01-07 09:00:00',
      created_by_user_id: 1,
      job_ids: [1, 2]  // Kandidaat solliciteert voor beide vacatures
    }
  ];

  for (const application of sampleApplications) {
    try {
      const result = await executeQuery(
        `INSERT INTO applications (candidate_id, source, received_at, created_by_user_id)
         VALUES (?, ?, ?, ?)`,
        [application.candidate_id, application.source, application.received_at, application.created_by_user_id]
      );

      const applicationId = result.lastInsertRowid;

      // Link application to jobs
      for (const jobId of application.job_ids) {
        await executeQuery(
          `INSERT INTO application_jobs (application_id, job_id) VALUES (?, ?)`,
          [applicationId, jobId]
        );
      }

      console.log(`✓ Created application for candidate ${application.candidate_id}`);
    } catch (error) {
      console.log(`→ Application for candidate ${application.candidate_id} might already exist`);
    }
  }

  // Create sample evaluation for first application
  try {
    await executeQuery(
      `INSERT INTO evaluations (application_id, job_id, evaluator_user_id, decision, notes, next_step_id)
       VALUES (1, 1, 2, 'yes', 'Uitstekende kandidaat met relevante ervaring', 1)`,
      []
    );
    console.log('✓ Created sample evaluation');
  } catch (error) {
    console.log('→ Sample evaluation might already exist');
  }

  // Create sample notifications (new job + new application)
  try {
    await executeQuery(
      `INSERT INTO notifications (user_id, type, related_id, message)
       VALUES (2, 'new_job', 1, 'Nieuwe vacature: Leraar Wiskunde')`,
      []
    );
    await executeQuery(
      `INSERT INTO notifications (user_id, type, related_id, message)
       VALUES (2, 'new_application', 2, 'Nieuwe sollicitatie van Marie Janssens')`,
      []
    );
    console.log('✓ Created sample notifications');
  } catch (error) {
    console.log('→ Sample notifications might already exist');
  }

  console.log('✓ Database seeded successfully with comprehensive test data');
}
