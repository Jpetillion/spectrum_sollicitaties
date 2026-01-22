# Rol Permissions - Het Spectrum Sollicitaties App

## Overzicht Rollen

### Admin
**Volledige toegang tot alle functionaliteiten**

- Beheer gebruikers
- Beheer next steps (toevoegen/bewerken/verwijderen)
- Alle rechten van Staf EN Directie
- 2FA setup en configuratie

### Staf
**Focus: Kandidaten registreren en sollicitaties beheren**

**Kan:**
- ✅ Kandidaten toevoegen (naam, vakken, staff_notes)
- ✅ Documenten uploaden (CV, brief, extra)
- ✅ Sollicitaties aanmaken (kandidaat koppelen aan 0..N vacatures)
- ✅ Spontane sollicitaties registreren (geen vacature gekoppeld)
- ✅ Vacatures aanmaken en beheren (samen met directie)
- ✅ Kandidaten zoeken, filteren, sorteren
- ✅ Kandidaat dossiers bekijken
- ✅ Staff notes toevoegen bij kandidaten

**Kan NIET:**
- ❌ Kandidaten evalueren (decision: yes/no/reserve)
- ❌ Next step selecteren bij evaluatie
- ❌ Mails genereren of verzenden
- ❌ Next steps beheren
- ❌ Gebruikers beheren

### Directie
**Focus: Evalueren en communiceren met kandidaten**

**Kan:**
- ✅ Alle kandidaten en sollicitaties bekijken
- ✅ Kandidaten evalueren per vacature:
  - Decision: yes/no/reserve
  - Next step selecteren
  - Evaluatie notities toevoegen
- ✅ Mails genereren op basis van evaluatie
- ✅ Mails bewerken en verzenden
- ✅ Vacatures aanmaken en beheren (samen met staf)
- ✅ Zoeken, filteren, sorteren
- ✅ Documenten bekijken

**Kan NIET:**
- ❌ Kandidaten toevoegen (alleen staf)
- ❌ Documenten uploaden (alleen staf)
- ❌ Sollicitaties aanmaken (alleen staf)
- ❌ Next steps beheren (alleen admin)
- ❌ Gebruikers beheren (alleen admin)

## Workflow

### Typische Staf Workflow
1. Ontvangt sollicitatie (email/post)
2. Maakt kandidaat aan in systeem
3. Upload CV en motivatiebrief
4. Koppelt kandidaat aan relevante vacature(s) of markeert als "spontaan"
5. Voegt staff notes toe (eerste indruk, bijzonderheden)
6. Notificeert directie (automatisch via notifications)

### Typische Directie Workflow
1. Ziet notificatie van nieuwe sollicitatie
2. Bekijkt kandidaat dossier (docs, info, staff notes)
3. Voor elke gekoppelde vacature:
   - Leest CV en brief
   - Maakt evaluatie (yes/no/reserve)
   - Voegt evaluatie notities toe
   - Selecteert next step
4. Genereert mail op basis van evaluatie
5. Bewerkt mail indien nodig
6. Verzendt mail naar kandidaat

## API Route Permissions

### Publiek (niet ingelogd)
- POST `/api/auth/login`
- POST `/api/auth/logout`

### Authenticated (alle ingelogde gebruikers)
- GET `/api/auth/me`
- GET `/api/jobs` (vacatures lijst)
- GET `/api/candidates` (kandidaten lijst)
- GET `/api/applications` (sollicitaties lijst)
- GET `/api/notifications`
- PUT `/api/notifications/:id/read`

### Staf + Directie + Admin
- POST `/api/jobs` (vacatures aanmaken)
- PUT `/api/jobs/:id` (vacatures bewerken)
- DELETE `/api/jobs/:id` (vacatures verwijderen)

### Alleen Staf + Admin
- POST `/api/candidates` (kandidaten aanmaken)
- PUT `/api/candidates/:id` (kandidaten bewerken)
- DELETE `/api/candidates/:id` (kandidaten verwijderen)
- POST `/api/candidates/:id/documents` (documenten uploaden)
- POST `/api/applications` (sollicitaties aanmaken)
- PUT `/api/applications/:id` (sollicitaties bewerken)

### Alleen Directie + Admin
- POST `/api/evaluations` (evaluaties aanmaken)
- PUT `/api/evaluations/:id` (evaluaties bewerken)
- POST `/api/mail/generate` (mails genereren)
- POST `/api/mail/send` (mails verzenden)
- PUT `/api/mail/:id` (mails bewerken)

### Alleen Admin
- GET `/api/users` (gebruikers lijst)
- POST `/api/users` (gebruikers aanmaken)
- PUT `/api/users/:id` (gebruikers bewerken)
- DELETE `/api/users/:id` (gebruikers verwijderen)
- POST `/api/next-steps` (next steps aanmaken)
- PUT `/api/next-steps/:id` (next steps bewerken)
- DELETE `/api/next-steps/:id` (next steps verwijderen)

## UI Elementen per Rol

### Navigatie - Staf
- Dashboard
- Kandidaten (toevoegen/bekijken)
- Sollicitaties (toevoegen/bekijken)
- Vacatures (beheren)
- Notificaties

### Navigatie - Directie
- Dashboard
- Kandidaten (alleen bekijken)
- Sollicitaties (bekijken + evalueren)
- Vacatures (beheren)
- Mails (genereren/verzenden)
- Notificaties

### Navigatie - Admin
- Dashboard
- Kandidaten (volledige controle)
- Sollicitaties (volledige controle)
- Vacatures (volledige controle)
- Mails (volledige controle)
- Next Steps (beheren)
- Gebruikers (beheren)
- Notificaties

## Veldniveau Permissions

### Kandidaat Detail Pagina

**Staf ziet:**
- Naam, vakken (editable)
- Staff notes (editable)
- Documenten lijst (upload knop zichtbaar)
- Gekoppelde sollicitaties
- Gekoppelde vacatures

**Directie ziet:**
- Naam, vakken (readonly)
- Staff notes (readonly)
- Documenten lijst (download alleen)
- Evaluatie sectie per vacature (editable):
  - Decision select (yes/no/reserve)
  - Notes textarea
  - Next step select
  - "Genereer mail" knop
- Gekoppelde sollicitaties
- Gekoppelde vacatures

**Admin ziet:**
- Alles van Staf EN Directie
- Extra metadata (created_at, user_id, etc.)

## Belangrijk voor Implementatie

1. **Backend validatie is leidend**: UI mag elementen verbergen, maar backend MOET altijd permissions checken
2. **requireRole() middleware** op alle routes die niet publiek zijn
3. **Frontend conditionals** gebruiken `user.role` om UI aan te passen
4. **Error messages**: Duidelijke feedback bij permission denied (403)
5. **Audit trail**: Log wie wat doet (evaluations.evaluator_user_id, etc.)
