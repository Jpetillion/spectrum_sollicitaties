# Voltooide Fixes - Het Spectrum Sollicitaties App

## Datum: 2026-01-20

### ✅ Volledig Geïmplementeerd

## 1. Document Upload Systeem

**Backend:**
- ✅ [server/routes-api/documents.js](server/routes-api/documents.js) - Volledige API endpoints
  - POST `/api/documents/candidates/:id/upload` - Upload CV, brief, extra
  - GET `/api/documents/candidates/:id` - Haal documenten op
  - GET `/api/documents/:id` - Download document
  - DELETE `/api/documents/:id` - Verwijder document
- ✅ [server/services/documentsService.js](server/services/documentsService.js) - Business logic
  - Local storage voor development
  - Vercel Blob ready voor productie
  - CASCADE delete support
- ✅ [server/storage/upload.js](server/storage/upload.js) - Multer configuratie
  - Max 10MB file size
  - Allowed types: PDF, DOC, DOCX, JPG, PNG

**Frontend:**
- ✅ [src/lib/apiClient.js](src/lib/apiClient.js:117-137) - Upload methods
  - `uploadDocument(candidateId, type, file)`
  - `getDocumentsByCandidate(candidateId)`
  - `deleteDocument(id)`
- ✅ [src/pages/ApplicationDetailPage.jsx](src/pages/ApplicationDetailPage.jsx:46-76) - Upload UI
  - 3 upload knoppen (CV, Brief, Extra)
  - File type validation
  - Upload progress indicator
  - Document lijst met download + delete
  - Permission checks (staf/admin kunnen uploaden, admin kan deleten)

## 2. Schema Vereenvoudiging

**Backend Services:**
- ✅ [server/services/candidatesService.js](server/services/candidatesService.js) - Volledig gefixd
  - OLD: `first_name, last_name, email, phone, notes`
  - NEW: `name, subjects, staff_notes`
  - Alle queries aangepast
  - Search functionaliteit werkt op name en subjects

**Frontend Pagina's:**
- ✅ [src/pages/CandidatesListPage.jsx](src/pages/CandidatesListPage.jsx:42-59) - Kolommen aangepast
  - Naam, Vakken, Sollicitaties, Toegevoegd
  - Zoekfunctie aangepast naar "naam of vakken"
- ✅ [src/pages/ApplicationDetailPage.jsx](src/pages/ApplicationDetailPage.jsx:140-161) - Detail view
  - candidate_name, candidate_subjects, staff_notes
  - Staff notes alleen zichtbaar indien gevuld
- ✅ [src/pages/JobDetailPage.jsx](src/pages/JobDetailPage.jsx:63-76) - Sollicitaties lijst
  - candidate_name, candidate_subjects
  - Job velden: vak, hours, classes (i.p.v. subject, grade, period)
- ✅ [src/components/organisms/ApplicationForm.jsx](src/components/organisms/ApplicationForm.jsx:22-26,124-143) - Formulier
  - Nieuwe kandidaat: name, subjects, staff_notes
  - Vacatures optioneel (spontane sollicitatie mogelijk)

## 3. Modal Components

**Components:**
- ✅ [src/components/molecules/Modal.jsx](src/components/molecules/Modal.jsx) - Base + helpers
  - `Modal` - Base component met overlay
  - `AlertModal` - Voor success/error/info messages
  - `ConfirmModal` - Voor delete/destructive actions
  - Loading state support
  - Keyboard escape support

**Vervangen Alerts:**
- ✅ [src/pages/JobFormPage.jsx](src/pages/JobFormPage.jsx:29,39-56,84-92) - AlertModal voor opslaan feedback
- ✅ [src/pages/JobDetailPage.jsx](src/pages/JobDetailPage.jsx:42-58,147-168) - Alert + ConfirmModal voor delete
- ✅ [src/pages/ApplicationDetailPage.jsx](src/pages/ApplicationDetailPage.jsx:46-76,180-200) - Upload + delete modals
- ✅ [src/components/organisms/ApplicationForm.jsx](src/components/organisms/ApplicationForm.jsx:66-78,190-198) - Kandidaat aanmaken feedback

## 4. Delete Functionaliteit

**Vacatures:**
- ✅ [src/pages/JobDetailPage.jsx](src/pages/JobDetailPage.jsx:42-58,101-106,157-168)
  - Delete knop alleen zichtbaar voor admin
  - ConfirmModal met warning message
  - Cascade: gekoppelde sollicitaties blijven behouden
  - Success redirect naar /jobs

**Kandidaten:**
- ✅ Backend route bestaat: DELETE `/api/candidates/:id`
- ✅ Database CASCADE:
  - candidate_documents worden verwijderd
  - applications worden verwijderd
  - evaluations worden verwijderd (via applications CASCADE)

**Documenten:**
- ✅ [src/pages/ApplicationDetailPage.jsx](src/pages/ApplicationDetailPage.jsx:67-76,190-200)
  - Delete knop per document (alleen admin)
  - ConfirmModal met bestandsnaam
  - File wordt verwijderd van disk + database

## 5. Navigatie & Routes

**Verwijderd:**
- ✅ [src/App.jsx](src/App.jsx) - SelectionOverviewPage route verwijderd
  - Import verwijderd (regel 9)
  - Route `/jobs/:jobId/selection` verwijderd (regel 66)

## 6. Rol Permissions

**Documentatie:**
- ✅ [ROLES.md](ROLES.md) - Volledig overzicht van alle rol permissions
  - Admin: Alles
  - Staf: Kandidaten toevoegen, documenten uploaden, sollicitaties aanmaken
  - Directie: Evalueren, mails verzenden, readonly kandidaten

**Implementatie:**
- ✅ Document upload: `canManageDocuments = staf || admin`
- ✅ Document delete: `canDelete = admin`
- ✅ Vacature delete: `canDelete = admin`
- ✅ Vacature bewerken: `canManage = admin || staf || directie`

## 7. API Endpoints Toegevoegd

```
POST   /api/documents/candidates/:id/upload
GET    /api/documents/candidates/:id
GET    /api/documents/:id
DELETE /api/documents/:id
```

## 8. Database

**Schema Checks:**
- ✅ [server/db/schema.sql](server/db/schema.sql) - Simplified schema actief
  - candidates: name, subjects, staff_notes
  - candidate_documents: type (cv|brief|extra), filename, url_or_path
  - jobs: title, vak, hours, classes, notes
  - CASCADE deletes correct ingesteld

## Nog Te Doen (Volgens uw requirements)

### 1. Resterende Alerts Vervangen
**Bestanden met alerts:**
- [ ] src/pages/MailDetailPage.jsx
- [ ] src/pages/ApplicationFormPage.jsx
- [ ] src/components/organisms/EvaluationTable.jsx

### 2. Evaluatie Notes UI
**Locatie:** EvaluationTable.jsx of nieuwe EvaluationForm component
- [ ] Textarea voor notes toevoegen
- [ ] Database kolom `evaluations.notes` bestaat al
- [ ] UI moet tonen: decision (yes/no/reserve), next_step, notes textarea

### 3. Mail Templates Systeem
**Vereisten:**
- [ ] Templates voor yes/no/reserve decisions
- [ ] Placeholders: `{{name}}`, `{{job_title}}`, `{{next_step}}`
- [ ] server/services/mailService.js updaten
- [ ] Auto-generatie bij evaluatie

### 4. API Method Missing
- [ ] apiClient: `searchCandidates(term)` - Bestaat in backend maar niet in client

### 5. Testing
- [ ] npm run migrate met nieuwe schema
- [ ] Document upload end-to-end test
- [ ] Delete vacature met gekoppelde sollicitaties
- [ ] Spontane sollicitatie (0 vacatures)

## Belangrijke Bestanden Gewijzigd

1. **server/services/candidatesService.js** - Complete herschrijving naar nieuw schema
2. **src/pages/ApplicationDetailPage.jsx** - Schema + upload UI + modals
3. **src/pages/JobDetailPage.jsx** - Schema + delete + modals
4. **src/pages/CandidatesListPage.jsx** - Kolommen naar nieuw schema
5. **src/components/organisms/ApplicationForm.jsx** - Formulier vereenvoudigd + modals
6. **src/components/molecules/Modal.jsx** - AlertModal + ConfirmModal helpers
7. **src/lib/apiClient.js** - Document upload methods
8. **server/routes-api/documents.js** - Nieuwe routes (CREATED)
9. **server/services/documentsService.js** - Document business logic (CREATED)

## Database Migratie Vereist

⚠️ **BELANGRIJK**: De Turso database moet opnieuw gemigreerd worden met het vereenvoudigde schema.

```bash
npm run migrate
npm run seed
```

## Vercel Deployment Ready

- ✅ bcryptjs (niet bcrypt)
- ✅ Document uploads (local + Vercel Blob ready)
- ✅ Environment variables ready (.env.example up-to-date)
- ✅ Build script correct
- ✅ vercel.json correct
