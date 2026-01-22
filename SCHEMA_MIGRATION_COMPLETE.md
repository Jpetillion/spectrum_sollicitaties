# Schema Migration Complete - 2026-01-20

## Database Reset & Migration

✅ **Turso database successfully reset with simplified schema**
- Ran: `npm run db:reset` followed by `npm run migrate`
- All old tables dropped
- New simplified schema created
- Test data seeded (3 users, 2 jobs, 3 candidates, 3 applications)

## Services Updated to Simplified Schema

### **candidates** table schema:
- OLD: `first_name, last_name, email, phone, notes`
- NEW: `name, subjects, staff_notes`

### **jobs** table schema:
- OLD: `title, subject, grade, period_text, requirements_text, start_date, created_by`
- NEW: `title, vak, hours, classes, notes, is_active`

### **applications** table schema:
- OLD: `source_email_subject, source_email_from, status, created_by`
- NEW: `source, received_at, created_by_user_id`

## Files Fixed (Backend Services)

1. **server/services/candidatesService.js** ✅
   - Changed from better-sqlite3 API to libsql executeQuery
   - Updated to use: name, subjects, staff_notes

2. **server/services/documentsService.js** ✅
   - Changed from better-sqlite3 API to libsql executeQuery
   - Already uses correct schema (candidate_id reference)

3. **server/services/applicationsService.js** ✅
   - Changed from better-sqlite3 API to libsql executeQuery
   - Updated queries to use: candidate_name, candidate_subjects, staff_notes
   - Fixed JOIN to use `created_by_user_id` instead of `created_by`
   - Removed old fields: source_email_subject, source_email_from, status

4. **server/services/jobsService.js** ✅
   - Changed from better-sqlite3 API to libsql executeQuery
   - Updated to use: title, vak, hours, classes, notes
   - Removed old fields: subject, grade, period_text, requirements_text, start_date, created_by

5. **server/routes-api/applications.js** ✅
   - Fixed notification to use `candidate.name` instead of `${first_name} ${last_name}`
   - Updated GET /applications to include jobs for each application

## Files Fixed (Frontend)

1. **src/pages/ApplicationDetailPage.jsx** ✅
   - Updated to show: candidate_name, candidate_subjects, staff_notes
   - Added document upload UI

2. **src/pages/JobDetailPage.jsx** ✅
   - Updated to show: vak, hours, classes (instead of subject, grade, period)
   - Added delete button with ConfirmModal

3. **src/pages/CandidatesListPage.jsx** ✅
   - Columns: Naam, Vakken, Sollicitaties, Toegevoegd
   - Search on name or subjects

4. **src/components/organisms/ApplicationForm.jsx** ✅
   - Form fields: name, subjects, staff_notes
   - Removed: first_name, last_name, email, phone

## Node Version Fix

Created `run-with-node20.sh` wrapper script to handle nvm switching:
- Unsets npm_config_prefix
- Loads nvm
- Switches to Node 20
- All npm scripts now use this wrapper

## Running the App

```bash
npm run dev           # Starts dev server with Node 20
npm run migrate       # Run migrations
npm run db:reset      # Reset database and recreate schema
```

## Login Credentials

```
Email: admin@hetspectrum.be
Password: Welcome123!

Email: staf@hetspectrum.be
Password: Welcome123!

Email: directie@hetspectrum.be
Password: Welcome123!
```

## Test Data

**Jobs:**
1. Leraar Wiskunde (20u, 5e-6e jaar)
2. Leraar Nederlands (18u, 3e-4e jaar)

**Candidates:**
1. Jan Peeters - Wiskunde, Natuurkunde
2. Marie Janssens - Nederlands, Frans
3. Pieter De Vries - Wiskunde

**Applications:**
- All 3 candidates have 1 application each
- Applications are linked to jobs via application_jobs table

## What's Working Now

✅ Candidates list shows names and subjects
✅ Applications show with linked jobs
✅ Job details show with applications
✅ Document upload on application detail page
✅ Delete buttons with modals
✅ All database queries use correct schema
✅ All services use libsql executeQuery API

## Still To Do

❌ Remaining alerts to replace with modals:
  - MailDetailPage.jsx
  - ApplicationFormPage.jsx
  - EvaluationTable.jsx

❌ Evaluatie notes UI - add textarea for notes

❌ Mail templates with placeholders ({{name}}, {{job_title}}, {{next_step}})
