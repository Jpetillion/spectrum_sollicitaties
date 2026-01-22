# Role Permissions - Het Spectrum Sollicitaties App

## Overview

The app has **3 roles**: `admin`, `staf`, and `directie`

## Role Permissions Summary

| Feature | Admin | Staf | Directie |
|---------|-------|------|----------|
| **Vacatures** |
| View vacatures | ✅ | ✅ | ✅ |
| Create vacature | ✅ | ✅ | ✅ |
| Edit vacature | ✅ | ✅ | ✅ |
| Delete vacature | ✅ | ❌ | ❌ |
| **Kandidaten** |
| View kandidaten | ✅ | ✅ | ✅ (readonly) |
| Create kandidaat | ✅ | ✅ | ❌ |
| Edit kandidaat | ✅ | ✅ | ❌ |
| Delete kandidaat | ✅ | ❌ | ❌ |
| **Sollicitaties** |
| View sollicitaties | ✅ | ✅ | ✅ |
| Create sollicitatie | ✅ | ✅ | ❌ |
| Edit sollicitatie | ✅ | ✅ | ❌ |
| Delete sollicitatie | ✅ | ❌ | ❌ |
| **Documenten** |
| View documenten | ✅ | ✅ | ✅ |
| Upload documenten | ✅ | ✅ | ❌ |
| Download documenten | ✅ | ✅ | ✅ |
| Delete documenten | ✅ | ❌ | ❌ |
| **Evaluaties** |
| View evaluaties | ✅ | ✅ | ✅ |
| Create evaluatie | ✅ | ❌ | ✅ |
| Edit evaluatie | ✅ | ❌ | ✅ |
| Delete evaluatie | ✅ | ❌ | ❌ |
| **Mails** |
| View mails | ✅ | ✅ (own only) | ✅ |
| Generate mail | ✅ | ❌ | ✅ |
| Edit mail draft | ✅ | ❌ | ✅ |
| Send mail | ✅ | ❌ | ✅ |

## Detailed Role Descriptions

### **Admin** (Beheerder)
- **Full access** to everything
- Can delete any record (vacatures, kandidaten, sollicitaties, documenten, evaluaties)
- Can manage users and system settings
- Can override any workflow
- **Main tasks:** System management, data cleanup, full control

### **Staf** (HR/Administratie)
- **Data entry role** - responsible for collecting applications
- Can create and manage candidates
- Can upload documents (CV, motivatiebrief)
- Can create applications (link candidates to jobs)
- Can create and edit vacatures
- **Cannot:** Delete records, evaluate candidates, send mails
- **Main tasks:** Register candidates, upload documents, create applications, manage job postings

### **Directie** (Management/Decision Makers)
- **Evaluation and communication role**
- Can view all data (readonly for candidates)
- Can create and edit vacatures
- Can evaluate applications (yes/no/reserve + next step)
- Can generate, edit and send mails to candidates
- **Cannot:** Delete records, modify candidate data, upload documents
- **Main tasks:** Evaluate candidates, make hiring decisions, send official communications

## Workflow

1. **Staf** receives application
   - Creates candidate record (name, subjects, staff_notes)
   - Uploads CV and motivatiebrief
   - Creates application and links to relevant vacature(s)

2. **Directie** evaluates
   - Reviews candidate dossier (info + documents)
   - Makes evaluation per vacature (yes/no/reserve)
   - Sets next step (volgend gesprek, proefles, contractbespreking, reserve, afwijzen)
   - Generates and sends mail to candidate

3. **Admin** manages
   - Cleans up old/duplicate records
   - Handles system issues
   - Has override access for special cases

## Permission Implementation

### Backend (Express Middleware)

```javascript
requireAuth              // All authenticated users
requireRole(['admin'])   // Admin only
requireRole(['staf', 'admin'])   // Staf or Admin
requireRole(['directie', 'admin']) // Directie or Admin
```

### Frontend (React Components)

```javascript
const canManageDocuments = user?.role === 'staf' || user?.role === 'admin';
const canDelete = user?.role === 'admin';
const canEvaluate = user?.role === 'directie' || user?.role === 'admin';
const canSendMail = user?.role === 'directie' || user?.role === 'admin';
```

## Login Credentials (Development)

```
Admin:
  Email: admin@hetspectrum.be
  Password: Welcome123!

Staf:
  Email: staf@hetspectrum.be
  Password: Welcome123!

Directie:
  Email: directie@hetspectrum.be
  Password: Welcome123!
```
