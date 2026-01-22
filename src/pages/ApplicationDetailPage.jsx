import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DownloadSimple, Upload, Trash, PencilSimple, X, Check } from '@phosphor-icons/react';
import Button from '../components/atoms/Button.jsx';
import Badge from '../components/atoms/Badge.jsx';
import Select from '../components/atoms/Select.jsx';
import Card from '../components/molecules/Card.jsx';
import Table from '../components/molecules/Table.jsx';
import Input from '../components/atoms/Input.jsx';
import Textarea from '../components/atoms/Textarea.jsx';
import { AlertModal, ConfirmModal } from '../components/molecules/Modal.jsx';
import { api } from '../lib/apiClient.js';
import { formatDate, formatDateTime } from '../lib/format.js';
import { APPLICATION_STATUS, APPLICATION_STATUS_LABELS, STATUS_VARIANTS } from '../../shared/constants.js';

export default function ApplicationDetailPage({ user }) {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmEmailGeneration, setConfirmEmailGeneration] = useState(null);

  const canManageDocuments = user?.role === 'staf' || user?.role === 'admin';
  const canEdit = user?.role === 'staf' || user?.role === 'admin';
  const canDelete = user?.role === 'admin';
  const canChangeStatus = user?.role === 'admin' || user?.role === 'directie';

  useEffect(() => {
    loadApplication();
    loadJobs();
  }, [applicationId]);

  const loadJobs = async () => {
    try {
      const jobsData = await api.getJobs();
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadApplication = async () => {
    try {
      const data = await api.getApplication(applicationId);
      setApplication(data);
      setSelectedJobIds(data.jobs?.map(j => j.id) || []);

      // Load candidate and documents
      if (data.candidate_id) {
        const candidateData = await api.getCandidate(data.candidate_id);
        setCandidate(candidateData);

        const docs = await api.getDocumentsByCandidate(data.candidate_id);
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Error loading application:', error);
      setAlert({ title: 'Fout', message: 'Fout bij laden sollicitatie', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateUpdate = async (field, value) => {
    if (!candidate || !canEdit) return;

    try {
      setSaving(true);
      await api.updateCandidate(candidate.id, {
        ...candidate,
        [field]: value
      });
      setCandidate(prev => ({ ...prev, [field]: value }));
    } catch (error) {
      setAlert({ title: 'Fout', message: 'Fout bij opslaan: ' + error.message, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleJobToggle = async (jobId) => {
    if (!canEdit) return;

    const newSelectedJobs = selectedJobIds.includes(jobId)
      ? selectedJobIds.filter(id => id !== jobId)
      : [...selectedJobIds, jobId];

    try {
      setSaving(true);
      await api.updateApplication(applicationId, { job_ids: newSelectedJobs });
      setSelectedJobIds(newSelectedJobs);
      loadApplication();
    } catch (error) {
      setAlert({ title: 'Fout', message: 'Fout bij opslaan: ' + error.message, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!application?.candidate_id) {
      setAlert({ title: 'Fout', message: 'Kandidaat ID niet gevonden', variant: 'error' });
      return;
    }

    setUploading(true);
    try {
      await api.uploadDocument(application.candidate_id, type, file);
      setAlert({ title: 'Gelukt', message: 'Document geüpload', variant: 'success' });
      loadApplication();
    } catch (error) {
      setAlert({ title: 'Fout', message: 'Fout bij uploaden: ' + error.message, variant: 'error' });
    } finally {
      setUploading(false);
      // Reset the input
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await api.deleteDocument(docId);
      setAlert({ title: 'Gelukt', message: 'Document verwijderd', variant: 'success' });
      setConfirmDelete(null);
      loadApplication();
    } catch (error) {
      setAlert({ title: 'Fout', message: 'Fout bij verwijderen: ' + error.message, variant: 'error' });
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!newStatus || newStatus === application?.status) return;

    // Check if email should be generated for this status change
    if (newStatus === APPLICATION_STATUS.AANVAARD ||
        newStatus === APPLICATION_STATUS.GEWEIGERD ||
        newStatus === APPLICATION_STATUS.RESERVE) {
      setConfirmEmailGeneration({ newStatus });
    } else {
      // Just update status without email
      await updateApplicationStatus(newStatus);
    }
  };

  const handleNextStepChange = async (e) => {
    const newNextStep = e.target.value;
    if (newNextStep === application?.next_step) return;

    try {
      setSaving(true);
      await api.updateApplication(applicationId, { next_step: newNextStep || null });
      setApplication(prev => ({ ...prev, next_step: newNextStep || null }));
    } catch (error) {
      setAlert({ title: 'Fout', message: 'Fout bij bijwerken volgende stap: ' + error.message, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const updateApplicationStatus = async (newStatus, generateEmail = false) => {
    try {
      setSaving(true);
      await api.updateApplication(applicationId, { status: newStatus });
      setApplication(prev => ({ ...prev, status: newStatus }));

      if (generateEmail) {
        await generateEmailForStatus(newStatus);
      }

      setAlert({ title: 'Gelukt', message: 'Status bijgewerkt', variant: 'success' });
    } catch (error) {
      setAlert({ title: 'Fout', message: 'Fout bij bijwerken status: ' + error.message, variant: 'error' });
    } finally {
      setSaving(false);
      setConfirmEmailGeneration(null);
    }
  };

  const generateEmailForStatus = async (status) => {
    try {
      let templateType;
      if (status === APPLICATION_STATUS.AANVAARD) {
        templateType = 'invite';
      } else if (status === APPLICATION_STATUS.GEWEIGERD) {
        templateType = 'reject';
      } else if (status === APPLICATION_STATUS.RESERVE) {
        templateType = 'reserve';
      }

      const jobId = application.jobs && application.jobs.length > 0 ? application.jobs[0].id : null;

      await api.generateMail({
        application_id: applicationId,
        job_id: jobId,
        template_type: templateType
      });

      setAlert({ title: 'Gelukt', message: 'E-mail gegenereerd', variant: 'success' });
    } catch (error) {
      setAlert({ title: 'Fout', message: 'Fout bij genereren e-mail: ' + error.message, variant: 'error' });
    }
  };

  const getDocTypeLabel = (type) => {
    const labels = { cv: 'CV', brief: 'Brief', extra: 'Extra' };
    return labels[type] || type;
  };

  const jobColumns = [
    { header: 'Titel', field: 'title' },
    { header: 'Vak', render: (job) => job.vak || '-' },
    { header: 'Uren', render: (job) => job.hours || '-' },
    { header: 'Klassen', render: (job) => job.classes || '-' }
  ];

  const documentColumns = [
    {
      header: 'Type',
      render: (doc) => getDocTypeLabel(doc.type)
    },
    { header: 'Bestandsnaam', field: 'filename' },
    {
      header: 'Geüpload',
      render: (doc) => formatDateTime(doc.created_at)
    },
    {
      header: 'Door',
      render: (doc) => doc.uploaded_by_email || '-'
    },
    {
      header: 'Acties',
      render: (doc) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href={doc.url_or_path} target="_blank" rel="noopener noreferrer">
            <Button size="small" variant="secondary">
              <DownloadSimple size={16} />
              Download
            </Button>
          </a>
          {canDelete && (
            <Button
              size="small"
              variant="secondary"
              onClick={() => setConfirmDelete(doc)}
            >
              <Trash size={16} />
            </Button>
          )}
        </div>
      )
    }
  ];

  if (loading) return <div className="loading">Laden...</div>;
  if (!application) return <div>Sollicitatie niet gevonden</div>;

  return (
    <div className="application-detail-page">
      <div className="page-header">
        <Button variant="secondary" onClick={() => navigate('/applications')}>
          <ArrowLeft size={20} />
          Terug
        </Button>
      </div>

      <Card title="Kandidaatinformatie">
        {canEdit && candidate ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Naam</label>
              <Input
                value={candidate.name || ''}
                onChange={(e) => setCandidate(prev => ({ ...prev, name: e.target.value }))}
                onBlur={(e) => handleCandidateUpdate('name', e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Vakken</label>
              <Input
                value={candidate.subjects || ''}
                onChange={(e) => setCandidate(prev => ({ ...prev, subjects: e.target.value }))}
                onBlur={(e) => handleCandidateUpdate('subjects', e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Interne notities</label>
              <Textarea
                value={candidate.staff_notes || ''}
                onChange={(e) => setCandidate(prev => ({ ...prev, staff_notes: e.target.value }))}
                onBlur={(e) => handleCandidateUpdate('staff_notes', e.target.value)}
                disabled={saving}
                rows={4}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Aangemaakt op</label>
              <p style={{ margin: 0, color: '#666' }}>{formatDate(application.created_at)}</p>
            </div>
            {canChangeStatus && (
              <>
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.95rem' }}>Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <Select
                      value={application?.status || APPLICATION_STATUS.IN_BEHANDELING}
                      onChange={handleStatusChange}
                      disabled={saving}
                      options={[
                        { value: APPLICATION_STATUS.IN_BEHANDELING, label: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.IN_BEHANDELING] },
                        { value: APPLICATION_STATUS.AANVAARD, label: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.AANVAARD] },
                        { value: APPLICATION_STATUS.GEWEIGERD, label: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.GEWEIGERD] },
                        { value: APPLICATION_STATUS.RESERVE, label: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.RESERVE] }
                      ]}
                    />
                    <Badge variant={STATUS_VARIANTS[application?.status || APPLICATION_STATUS.IN_BEHANDELING]}>
                      {APPLICATION_STATUS_LABELS[application?.status || APPLICATION_STATUS.IN_BEHANDELING]}
                    </Badge>
                  </div>
                </div>
                <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.95rem' }}>Volgende stap</label>
                  <Select
                    value={application?.next_step || ''}
                    onChange={handleNextStepChange}
                    disabled={saving}
                    options={[
                      { value: '', label: '(Geen volgende stap)' },
                      { value: 'Mailen', label: 'Mailen' },
                      { value: 'Bellen', label: 'Bellen' },
                      { value: 'Gesprek', label: 'Gesprek' }
                    ]}
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="detail-grid">
            <div className="detail-item">
              <label>Naam</label>
              <p>{application.candidate_name || '-'}</p>
            </div>
            <div className="detail-item">
              <label>Vakken</label>
              <p>{application.candidate_subjects || '-'}</p>
            </div>
            <div className="detail-item">
              <label>Aangemaakt op</label>
              <p>{formatDate(application.created_at)}</p>
            </div>
            {application.staff_notes && (
              <div className="detail-item">
                <label>Interne notities</label>
                <p className="whitespace-pre-wrap">{application.staff_notes}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card title="Gekoppelde vacatures">
        {canEdit ? (
          <div className="checkbox-group">
            {jobs.length === 0 ? (
              <p className="text-muted">Nog geen vacatures beschikbaar</p>
            ) : (
              jobs.map(job => (
                <label key={job.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedJobIds.includes(job.id)}
                    onChange={() => handleJobToggle(job.id)}
                    disabled={saving}
                  />
                  {job.title} {job.vak && `- ${job.vak}`}
                </label>
              ))
            )}
            {selectedJobIds.length === 0 && (
              <p className="text-muted" style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
                Geen vacatures geselecteerd (spontane sollicitatie)
              </p>
            )}
          </div>
        ) : (
          <Table
            columns={jobColumns}
            data={application.jobs || []}
            onRowClick={(job) => navigate(`/jobs/${job.id}`)}
            emptyMessage="Geen vacatures gekoppeld (spontane sollicitatie)"
          />
        )}
      </Card>

      <Card title="Documenten">
        {canManageDocuments && (
          <div className="upload-section" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
            <label className="upload-button">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileUpload(e, 'cv')}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              <Button as="span" disabled={uploading}>
                <Upload size={20} />
                {uploading ? 'Uploaden...' : 'Upload CV'}
              </Button>
            </label>

            <label className="upload-button">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileUpload(e, 'brief')}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              <Button as="span" disabled={uploading}>
                <Upload size={20} />
                {uploading ? 'Uploaden...' : 'Upload Motivatiebrief'}
              </Button>
            </label>
          </div>
        )}

        <Table
          columns={documentColumns}
          data={documents}
          emptyMessage="Nog geen documenten"
        />
      </Card>

      {alert && (
        <AlertModal
          isOpen={true}
          onClose={() => setAlert(null)}
          title={alert.title}
          message={alert.message}
          variant={alert.variant}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => handleDeleteDocument(confirmDelete.id)}
          title="Document verwijderen"
          message={`Weet u zeker dat u "${confirmDelete.filename}" wilt verwijderen?`}
          confirmText="Verwijderen"
          confirmVariant="primary"
        />
      )}

      {confirmEmailGeneration && (
        <ConfirmModal
          isOpen={true}
          onClose={() => {
            setConfirmEmailGeneration(null);
            loadApplication(); // Reload to reset status
          }}
          onConfirm={() => updateApplicationStatus(confirmEmailGeneration.newStatus, true)}
          title="E-mail genereren"
          message={`Wilt u een ${
            confirmEmailGeneration.newStatus === APPLICATION_STATUS.AANVAARD ? 'uitnodigings' :
            confirmEmailGeneration.newStatus === APPLICATION_STATUS.RESERVE ? 'reserve' :
            'afwijzings'
          }e-mail genereren voor deze kandidaat?`}
          confirmText="Ja, genereer e-mail"
          confirmVariant="primary"
        />
      )}
    </div>
  );
}
