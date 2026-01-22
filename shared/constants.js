export const ROLES = {
  ADMIN: 'admin',
  DIRECTIE: 'directie',
  STAF: 'staf',
  PSYCHOLOOG: 'psycholoog'
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.DIRECTIE]: 'Directie',
  [ROLES.STAF]: 'Staf',
  [ROLES.PSYCHOLOOG]: 'Arbeidspsycholoog'
};

export const APPLICATION_STATUS = {
  IN_BEHANDELING: 'in_behandeling',
  AANVAARD: 'aanvaard',
  GEWEIGERD: 'geweigerd',
  RESERVE: 'reserve'
};

export const APPLICATION_STATUS_LABELS = {
  [APPLICATION_STATUS.IN_BEHANDELING]: 'In behandeling',
  [APPLICATION_STATUS.AANVAARD]: 'Aanvaard',
  [APPLICATION_STATUS.GEWEIGERD]: 'Geweigerd',
  [APPLICATION_STATUS.RESERVE]: 'Reserve'
};

export const STATUS_VARIANTS = {
  in_behandeling: 'warning',
  aanvaard: 'success',
  geweigerd: 'error',
  reserve: 'info'
};

export const VERDICT = {
  GESCHIKT: 'geschikt',
  MINDER: 'minder',
  NIET: 'niet'
};

export const VERDICT_LABELS = {
  [VERDICT.GESCHIKT]: 'Geschikt',
  [VERDICT.MINDER]: 'Minder geschikt',
  [VERDICT.NIET]: 'Niet geschikt'
};

export const ATTACHMENT_KIND = {
  CV: 'cv',
  LETTER: 'letter',
  OTHER: 'other'
};

export const ATTACHMENT_KIND_LABELS = {
  [ATTACHMENT_KIND.CV]: 'CV',
  [ATTACHMENT_KIND.LETTER]: 'Sollicitatiebrief',
  [ATTACHMENT_KIND.OTHER]: 'Overig'
};

export const MAIL_TEMPLATE_TYPE = {
  INVITE: 'invite',
  REJECT: 'reject',
  RESERVE: 'reserve',
  PENDING: 'pending'
};

export const MAIL_TEMPLATE_LABELS = {
  [MAIL_TEMPLATE_TYPE.INVITE]: 'Uitnodiging',
  [MAIL_TEMPLATE_TYPE.REJECT]: 'Afwijzing',
  [MAIL_TEMPLATE_TYPE.RESERVE]: 'Reserve',
  [MAIL_TEMPLATE_TYPE.PENDING]: 'Nog in behandeling'
};

export const MAIL_STATUS = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  SENT: 'sent'
};

export const MAIL_STATUS_LABELS = {
  [MAIL_STATUS.DRAFT]: 'Concept',
  [MAIL_STATUS.APPROVED]: 'Goedgekeurd',
  [MAIL_STATUS.SENT]: 'Verzonden'
};
