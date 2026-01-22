# TODO - Fixes en Verbeteringen

## Status: In Progress

### ✅ Voltooid
1. **ROLES.md gedocumenteerd** - Duidelijk overzicht van admin/staf/directie permissions
2. **Document upload API geïmplementeerd**
   - server/routes-api/documents.js
   - server/services/documentsService.js
   - Geregistreerd in server.js
   - apiClient.js uitgebreid met upload methods
3. **SelectionOverviewPage verwijderd** uit App.jsx routes
4. **Modal components uitgebreid**
   - ConfirmModal voor confirm dialogs
   - AlertModal voor success/error messages
5. **JobFormPage.jsx alerts vervangen** door modals

### 🔄 In Progress

#### 1. Document Upload UI (**PRIORITEIT 1**)
**Probleem**: De upload knoppen (CV en brief) doen nog niets.

**Locatie**: src/pages/ApplicationDetailPage.jsx, src/components/organisms/ApplicationForm.jsx

**Oplossing**:
- ApplicationDetailPage moet documents ophalen via `api.getDocumentsByCandidate(candidateId)`
- Upload handler toevoegen die `api.uploadDocument(candidateId, type, file)` aanroept
- Lijst van geüploade documenten tonen met download links

**Code voorbeeld**:
```jsx
const [documents, setDocuments] = useState([]);

const handleUpload = async (e, type) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploading(true);
  try {
    await api.uploadDocument(candidateId, type, file);
    setAlert({ title: 'Gelukt', message: 'Document geüpload', variant: 'success' });
    loadDocuments();
  } catch (error) {
    setAlert({ title: 'Fout', message: error.message, variant: 'error' });
  } finally {
    setUploading(false);
  }
};
```

#### 2. Delete Functionaliteit (**PRIORITEIT 1**)

**A. Vacatures Delete**
- Locatie: JobDetailPage.jsx of JobsListPage.jsx
- Backend route bestaat al: DELETE /api/jobs/:id
- Database heeft ON DELETE CASCADE voor application_jobs
- UI: Voeg "Verwijder" knop toe met ConfirmModal

**B. Kandidaten Delete**
- Locatie: Nog te maken CandidateDetailPage.jsx
- Backend route bestaat al: DELETE /api/candidates/:id
- Database heeft ON DELETE CASCADE voor documents en applications
- UI: Voeg "Verwijder" knop toe met ConfirmModal

#### 3. Schema Mismatch Fixes (**PRIORITEIT 1**)

**Probleem**: Veel pagina's gebruiken nog oude schema velden (first_name, last_name, email, phone) in plaats van vereenvoudigd schema (name, subjects, staff_notes).

**Bestanden die aangepast moeten worden**:

**A. CandidatesListPage.jsx** (regel 45-56)
```jsx
// OUD:
const columns = [
  { header: 'Naam', render: (c) => `${c.first_name} ${c.last_name}` },
  { header: 'E-mail', field: 'email' },
  { header: 'Telefoon', field: 'phone' }
];

// NIEUW:
const columns = [
  { header: 'Naam', field: 'name' },
  { header: 'Vakken', field: 'subjects' },
  { header: 'Sollicitaties', render: (c) => c.application_count || 0 }
];
```

**B. ApplicationDetailPage.jsx** (regel 93-107)
```jsx
// OUD:
<label>Naam</label>
<p>{application.first_name} {application.last_name}</p>
<label>E-mail</label>
<p>{application.email}</p>

// NIEUW:
<label>Naam</label>
<p>{application.candidate_name}</p>
<label>Vakken</label>
<p>{application.candidate_subjects}</p>
<label>Staff Notes</label>
<p>{application.staff_notes}</p>
```

**C. ApplicationForm.jsx en ApplicationFormPage.jsx**
- Formulier moet aangepast naar: name, subjects, staff_notes
- Email/telefoon velden verwijderen

#### 4. Replace Remaining Alerts (**PRIORITEIT 2**)

**Bestanden met alerts/confirms**:
- src/pages/MailDetailPage.jsx
- src/pages/ApplicationDetailPage.jsx (regel 41-44)
- src/pages/ApplicationFormPage.jsx
- src/components/organisms/EvaluationTable.jsx
- src/components/organisms/ApplicationForm.jsx

**Actie**: Vervang alle `alert()` en `confirm()` door AlertModal en ConfirmModal

#### 5. Mail Template Systeem (**PRIORITEIT 2**)

**Probleem**: Mails sectie is dummy - doet nog niets.

**Vereisten** (volgens ROADMAP.md):
- 3 basis templates (yes/no/reserve)
- Placeholders: {{name}}, {{job_title}}, {{next_step}}
- Subject: "Sollicitatie – {{job_title}}" of "Sollicitatie – Het Spectrum"

**Locatie**: server/services/mailService.js en server/routes-api/mail.js

**Oplossing**:
```javascript
const templates = {
  yes: {
    subject: 'Sollicitatie - {{job_title}}',
    body: `Beste {{name}},\n\nWe zijn verheugd u te kunnen meedelen dat uw sollicitatie voor {{job_title}} positief is beoordeeld.\n\nNext step: {{next_step}}\n\nMet vriendelijke groet,\nHet Spectrum`
  },
  no: {
    subject: 'Sollicitatie - {{job_title}}',
    body: `Beste {{name}},\n\nBedankt voor uw interesse in {{job_title}}. Helaas kunnen we u op dit moment geen positie aanbieden.\n\nMet vriendelijke groet,\nHet Spectrum`
  },
  reserve: {
    subject: 'Sollicitatie - {{job_title}}',
    body: `Beste {{name}},\n\nBedankt voor uw sollicitatie voor {{job_title}}. We houden u in reserve.\n\nNext step: {{next_step}}\n\nMet vriendelijke groet,\nHet Spectrum`
  }
};

function replacePlaceholders(template, data) {
  return template
    .replace(/{{name}}/g, data.name)
    .replace(/{{job_title}}/g, data.job_title || 'Het Spectrum')
    .replace(/{{next_step}}/g, data.next_step || '');
}
```

#### 6. Evaluatie Notes Field (**PRIORITEIT 2**)

**Probleem**: Ik zie niet waar opmerkingen kunnen worden toegevoegd bij evaluatie.

**Locatie**: Waarschijnlijk EvaluationTable.jsx of een nieuw EvaluationForm component

**Database**: evaluations tabel heeft al `notes TEXT` kolom

**UI toevoegen**:
```jsx
<FormRow label="Opmerkingen">
  <textarea
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    placeholder="bv. 'Sterke kandidaat met veel ervaring'"
    rows={4}
  />
</FormRow>
```

### 📋 Nice to Have (Lagere Prioriteit)

1. **MFA Frontend UI** - Backend is klaar, maar setup en login UI ontbreekt
2. **Notifications verbeteren** - Payload JSON parsing
3. **Filters en Sortering** - Volgens roadmap: zoeken, filteren op vak/klas/status, sorteren A-Z
4. **Vercel Blob integratie** - Voor production file uploads (nu local storage)
5. **Soft delete optie** - Voor vacatures en kandidaten (is_active flag gebruiken)

## Rol Permissions Check

Volgens ROLES.md:

### Admin
- ✅ Alles mag

### Staf
- ✅ Kandidaten toevoegen
- ✅ Documenten uploaden
- ✅ Sollicitaties aanmaken
- ✅ Vacatures beheren
- ❌ NIET: Evalueren, mails verzenden

### Directie
- ✅ Kandidaten bekijken (readonly)
- ✅ Evalueren (decision, notes, next_step)
- ✅ Mails genereren/verzenden
- ✅ Vacatures beheren
- ❌ NIET: Kandidaten toevoegen, documenten uploaden

**TODO**: UI conditionals toevoegen op basis van `user.role`

## Database CASCADE Check

Schema heeft correcte CASCADE:
- ✅ candidate_documents ON DELETE CASCADE (kandidaat verwijderen = docs verwijderen)
- ✅ application_jobs ON DELETE CASCADE (job/application verwijderen = koppeling verwijderen)
- ✅ evaluations ON DELETE CASCADE (application verwijderen = evaluaties verwijderen)
- ✅ notifications ON DELETE CASCADE (user verwijderen = notificaties verwijderen)

## Testing Checklist

Wanneer fixes compleet zijn:

1. [ ] Login als staf → kandidaat toevoegen → CV uploaden → sollicitatie aanmaken
2. [ ] Login als directie → kandidaat bekijken → evaluatie toevoegen met notes → mail genereren
3. [ ] Login als admin → vacature verwijderen (check CASCADE)
4. [ ] Login als admin → kandidaat verwijderen (check documents CASCADE)
5. [ ] Alle modals werken (geen window.alert/confirm meer)
6. [ ] Mail templates vullen placeholders correct in

## Implementatie Volgorde

1. **Fix schema mismatch** (CandidatesListPage, ApplicationDetailPage, ApplicationForm)
2. **Document upload UI** (ApplicationDetailPage)
3. **Delete knoppen** (JobDetailPage, CandidateDetailPage met ConfirmModal)
4. **Vervang resterende alerts** (alle 6 bestanden)
5. **Mail templates** (server/services/mailService.js)
6. **Evaluatie notes UI** (EvaluationTable.jsx)
