ROADMAP – Sollicitatie-app Het Spectrum (Strak + Gedetailleerd, met multi-vacature)
Kernregels (waar we niet van afwijken)

Staf kan kandidaten toevoegen + documenten + opmerkingen + (0..N) vacatures koppelen (incl. “spontaan” als 0 vacatures)

Staf & directie kunnen vacatures aanmaken (vak/uren/klassen optioneel)

Directie evalueert per kandidaat x vacature (status ja/neen/reserve + tekst + next step)

Evaluatie triggert mailvoorstel (met juiste naam + vacature(s) of spontaan + next step)

Overal: zoeken, filteren, sorteren (naam, vak, klas, status)

Datamodel (MVP-waardig, maar compleet)
Entiteiten

users

id, email, password_hash, role (admin|staf|directie), created_at

jobs (vacatures)

id, title/vak, hours (nullable), classes (nullable string), notes (nullable), is_active, created_at

candidates

id, name, subjects (vrije tekst of comma list), staff_notes (text), created_at

candidate_documents

id, candidate_id, type (cv|brief|extra), filename, url/path, uploaded_by_user_id, created_at

applications (koppelt kandidaat aan meerdere vacatures)

id, candidate_id, created_by_user_id, created_at

(optioneel) source (email/manual), received_at

application_jobs (many-to-many)

application_id, job_id

uniek: (application_id, job_id)

evaluations (per kandidaat x vacature)

id, application_id, job_id, evaluator_user_id

decision (yes|no|reserve)

notes (text)

next_step_id (nullable)

updated_at

next_steps

id, label (bv “volgend gesprek”), is_active, sort_order

mail_drafts

id, application_id, job_id (nullable bij “spontaan”)

to_email (nullable als nog niet gekend), subject, body

status (draft|sent) (geen approved nodig, directie is beslisser)

generated_from_decision, generated_at, sent_at

“Spontaan” = application zonder gekoppelde jobs OF mail_draft met job_id = null.

UX-schermen (wat er minimaal moet zijn)
Staf

Kandidaat toevoegen (naam, vakken, opmerkingen, documenten uploaden)

Sollicitatie aanmaken (kies kandidaat of “nieuw”, koppel 0..N vacatures, save)

Overzicht kandidaten/sollicitaties met filter + zoek + sorteer

Dossier: documenten, gekoppelde vacatures, interne notities

Directie

Vacatures beheren

Dossier bekijken

Evaluatie per vacature-tab (voor elke gekoppelde vacature: ja/neen/reserve + next step + tekst)

Mailvoorstel bekijken + “Verzenden”

Week-by-week (gedetailleerd)
Week 1 — Setup, skeleton, auth, DB basis

Doel: project draait stabiel + login werkt + DB connect.

Backend

Express server structuur + SSR wiring

Turso connectie (env vars, client wrapper)

DB migrations setup (1 script + schema versioning)

Seed: users + paar vacatures + paar candidates

Auth

Session-based auth (cookie session)

Login route + middleware requireAuth

Role middleware requireRole(['staf','directie'])

Frontend

SSR base layout (sidebar/topbar)

Login page + protected route test

Dashboard placeholder per role

Deliverable

Inloggen als staf/directie/admin → dashboard zichtbaar

npm run migrate + npm run seed werkt

Week 2 — Vacatures (CRUD) + basis UI patterns

Doel: staf/directie kan vacatures aanmaken/bewerken/verwijderen.

API

GET /api/jobs

POST /api/jobs

PUT /api/jobs/:id

DELETE /api/jobs/:id (soft delete mag ook via is_active=false)

UI

JobsList (table + search input)

JobForm (vak/uren/klassen optioneel)

Role check: staf & directie mogen beheren

Validatie

Vak verplicht, rest optioneel

Foutmelding UI + backend

Deliverable

Vacatures volledig beheersbaar in UI

Sorteren A-Z op vak

Week 3 — Kandidaten + documenten upload

Doel: staf kan kandidaat registreren met docs.

API

GET /api/candidates

POST /api/candidates

PUT /api/candidates/:id

GET /api/candidates/:id

POST /api/candidates/:id/documents (upload)

GET /api/documents/:id (download / open)

Storage

Local dev storage + Vercel Blob in prod (zoals jullie al hebben)

Documenttypes: cv, brief, extra

Security: alleen ingelogd + right roles

UI

CandidatesList (zoek + sorteer)

CandidateForm (naam, vakken, staff_notes)

CandidateDetail (docs list + upload)

Deliverable

Staf kan dossier opbouwen: kandidaat + docs + opmerkingen

Week 4 — Sollicitatie-flow (many-to-many vacatures)

Doel: staf kan een sollicitatie registreren en koppelen aan meerdere vacatures.

API

POST /api/applications

body: candidate_id OR candidate_create payload

job_ids: [] (0..N)

GET /api/applications (met joins: candidate + gekoppelde jobs)

GET /api/applications/:id (full dossier)

PUT /api/applications/:id/jobs (jobs aanpassen)

UI

ApplicationCreate wizard:

kies bestaande kandidaat of “nieuw”

selecteer vacatures (multi-select + “geen/ spontaan”)

bevestigen → dossier pagina

ApplicationDetail:

kandidaat info + docs

gekoppelde vacatures chips/list

link “jobs aanpassen”

DB constraints

application_jobs uniek per (application_id, job_id)

bij verwijderen job: cascade of blokkeren (kies simpel: cascade)

Deliverable

Eén kandidaat kan aan meerdere vacatures hangen

“Spontaan” is ook mogelijk (0 vacatures)

Week 5 — Evaluaties per vacature + next steps beheer

Doel: directie evalueert per gekoppelde vacature.

Next steps

Table next_steps

UI klein beheer: add/edit/disable (directie of admin)

Default steps seed:

Volgend gesprek

Proefles

Contractbespreking

Reserve houden

Afwijzen – afgerond

Evaluations API

GET /api/applications/:id/evaluations (per job)

POST/PUT /api/applications/:id/evaluations/:job_id

decision: yes/no/reserve

next_step_id

notes

UI

ApplicationDetail krijgt “Evaluaties” sectie:

Per gekoppelde vacature een card/tab:

status select (ja/neen/reserve)

next step dropdown

tekstvak

save

Deliverable

Directie kan per vacature een beslissing vastleggen + next step

Week 6 — Mailgeneratie + verzenden (simpel maar volledig)

Doel: evaluatie → mailvoorstel → directie verzendt.

Mail templates

3 basis templates (yes/no/reserve)

placeholders:

{{name}}

{{job_title}} of fallback “spontane sollicitatie”

{{next_step}}

Subject rules:

“Sollicitatie – {{job_title}}” of “Sollicitatie – Het Spectrum”

API

POST /api/mail/generate (application_id + job_id/null)

GET /api/mail/drafts?application_id=...

POST /api/mail/send (draft_id)

UI

In evaluatie card: knop “Genereer mail”

MailDraft preview page:

subject + body editbaar (optioneel)

button “Verzenden”

status “sent” + timestamp

Deliverable

End-to-end: evaluatie → maildraft → verzenden

Week 7 — Overzichten, filters, sortering, rechten harden

Doel: vlot bruikbaar in echte workflow.

Filtering/Sorting (minimaal)

Search input:

kandidaat naam (contains)

Filters:

vacature (dropdown)

klas (dropdown via jobs.classes)

vak (jobs.title)

status (ja/neen/reserve)

Sorting:

naam A-Z

laatst aangepast (evaluations.updated_at)

Rechten

Staf:

kandidaten + sollicitaties maken/bekijken

vacatures beheren (zoals gewenst)

GEEN mail verzenden

Directie:

evalueren + mail verzenden

Admin:

alles + beheer next steps

Deliverable

Overzichtschermen zijn “werkbaar” voor schoolgebruik

Rechten zijn waterdicht

Week 8 — QA, testscenario’s, bugfix, demo

Doel: stabiel + toonbaar + klaar voor echte data.

QA

Testplan (10-15 scenario’s)

kandidaat toevoegen + docs

spontane sollicitatie + mail

2 vacatures koppelen + 2 aparte evaluaties

filters werken correct

rechten: staf kan niet verzenden

Demo

Demo script (2 minuten + 5 minuten versie)

Seed data uitbreiden (realistische namen/vakken)

Deploy

Vercel productie deploy

Smoke test na deploy

Deliverable

Finale oplevering + demo + checklist afgevinkt

Definition of Done (strakker)

Een feature is af als:

UI flow werkt end-to-end

DB correct + constraints ok

Rollen enforced op backend

Validatie + foutmeldingen aanwezig

Minstens 1 testscenario toegevoegd

Extra “niet-exotisch maar nuttig” (optioneel als tijd)

Soft delete voor kandidaten/vacatures (om data niet te verliezen)

“Laatste wijziging door” op evaluatie/mails

Snelle actie: in overzicht direct status aanpassen (later)