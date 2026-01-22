const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'same-origin',
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(data.error || 'Er is een fout opgetreden', response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Netwerkfout. Controleer uw internetverbinding.', 0);
  }
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  getCurrentUser: () => request('/auth/me'),

  // Jobs
  getJobs: () => request('/jobs'),
  getJob: (id) => request(`/jobs/${id}`),
  createJob: (data) => request('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  updateJob: (id, data) => request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),

  // Candidates
  getCandidates: (search) => request(`/candidates${search ? `?search=${search}` : ''}`),
  getCandidate: (id) => request(`/candidates/${id}`),
  createCandidate: (data) => request('/candidates', { method: 'POST', body: JSON.stringify(data) }),
  updateCandidate: (id, data) => request(`/candidates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCandidate: (id) => request(`/candidates/${id}`, { method: 'DELETE' }),

  // Applications
  getApplications: () => request('/applications'),
  getApplication: (id) => request(`/applications/${id}`),
  createApplication: (data) => request('/applications', { method: 'POST', body: JSON.stringify(data) }),
  updateApplication: (id, data) => request(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteApplication: (id) => request(`/applications/${id}`, { method: 'DELETE' }),

  uploadAttachment: (applicationId, file, kind) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);

    return fetch(`${API_BASE}/applications/${applicationId}/attachments`, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin'
    }).then(res => res.json());
  },

  // Evaluations
  getEvaluationsForJob: (jobId) => request(`/evaluations/jobs/${jobId}`),
  saveEvaluation: (data) => request('/evaluations', { method: 'POST', body: JSON.stringify(data) }),
  deleteEvaluation: (id) => request(`/evaluations/${id}`, { method: 'DELETE' }),
  signoffJob: (jobId) => request(`/evaluations/jobs/${jobId}/signoff`, { method: 'POST' }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),

  // Mail
  getMailDrafts: (status) => request(`/mail/outbox${status ? `?status=${status}` : ''}`),
  getMailDraft: (id) => request(`/mail/outbox/${id}`),
  generateMail: (data) => request('/mail/generate', { method: 'POST', body: JSON.stringify(data) }),
  updateMailDraft: (id, subject, body) => {
    console.log('[API] updateMailDraft called:', { id, subject, body });
    return request(`/mail/outbox/${id}`, { method: 'PUT', body: JSON.stringify({ subject, body }) });
  },
  approveMail: (id) => {
    console.log('[API] approveMail called:', id);
    return request(`/mail/outbox/${id}/approve`, { method: 'POST' });
  },
  sendMail: (id) => {
    console.log('[API] sendMail called:', id);
    return request(`/mail/outbox/${id}/send`, { method: 'POST' });
  },

  // MFA
  loginMfa: (tempToken, code, isBackupCode = false) =>
    request('/auth/login/mfa', {
      method: 'POST',
      body: JSON.stringify({ tempToken, code, isBackupCode })
    }),

  mfaGenerateSetup: () => request('/mfa/setup/generate', { method: 'POST' }),
  mfaVerifySetup: (token) => request('/mfa/setup/verify', { method: 'POST', body: JSON.stringify({ token }) }),
  mfaDisable: (password) => request('/mfa/disable', { method: 'POST', body: JSON.stringify({ password }) }),
  mfaGetStatus: () => request('/mfa/status'),
  mfaRegenerateBackupCodes: (token) => request('/mfa/backup-codes/regenerate', { method: 'POST', body: JSON.stringify({ token }) }),

  // Documents
  uploadDocument: async (candidateId, type, file) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);

    const response = await fetch(`/api/documents/candidates/${candidateId}/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error || 'Upload failed', response.status);
    }

    return response.json();
  },

  getDocumentsByCandidate: (candidateId) => request(`/documents/candidates/${candidateId}`),
  deleteDocument: (id) => request(`/documents/${id}`, { method: 'DELETE' })
};

export { ApiError };
