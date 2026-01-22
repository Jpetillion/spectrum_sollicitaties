-- SIMPLIFIED SCHEMA - Aligned with Roadmap
-- This schema contains ONLY what's in the roadmap - no exotic features

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'staf', 'directie')),
  mfa_enabled INTEGER DEFAULT 0 CHECK(mfa_enabled IN (0, 1)),
  mfa_secret TEXT,
  mfa_backup_codes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Jobs (vacatures) table
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  vak TEXT,
  hours REAL,
  classes TEXT,
  notes TEXT,
  is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  subjects TEXT,
  staff_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Candidate documents table
CREATE TABLE IF NOT EXISTS candidate_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id INTEGER NOT NULL,
  type TEXT CHECK(type IN ('cv', 'brief', 'extra')),
  filename TEXT NOT NULL,
  url_or_path TEXT NOT NULL,
  uploaded_by_user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id)
);

-- Applications table (koppelt kandidaat aan sollicitatie)
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id INTEGER NOT NULL,
  created_by_user_id INTEGER,
  source TEXT CHECK(source IN ('email', 'manual')),
  status TEXT DEFAULT 'in_behandeling' CHECK(status IN ('in_behandeling', 'aanvaard', 'geweigerd', 'reserve')),
  next_step TEXT,
  received_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id),
  FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- Many-to-many relationship between applications and jobs
CREATE TABLE IF NOT EXISTS application_jobs (
  application_id INTEGER NOT NULL,
  job_id INTEGER NOT NULL,
  PRIMARY KEY (application_id, job_id),
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Next steps (voor evaluatie workflow)
CREATE TABLE IF NOT EXISTS next_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
  sort_order INTEGER DEFAULT 0
);

-- Evaluations table (per kandidaat x vacature)
CREATE TABLE IF NOT EXISTS evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL,
  job_id INTEGER NOT NULL,
  evaluator_user_id INTEGER,
  decision TEXT CHECK(decision IN ('yes', 'no', 'reserve')),
  notes TEXT,
  next_step_id INTEGER,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (evaluator_user_id) REFERENCES users(id),
  FOREIGN KEY (next_step_id) REFERENCES next_steps(id)
);

-- Mail drafts table
CREATE TABLE IF NOT EXISTS mail_drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL,
  job_id INTEGER,
  to_email TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'sent')),
  generated_from_decision TEXT,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  sent_at DATETIME,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
);

-- Notifications table (keeps staf & directie updated on each other's entries)
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('new_job', 'new_application')),
  related_id INTEGER,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0 CHECK(is_read IN (0, 1)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_application_job ON evaluations(application_id, job_id);
CREATE INDEX IF NOT EXISTS idx_documents_candidate ON candidate_documents(candidate_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
