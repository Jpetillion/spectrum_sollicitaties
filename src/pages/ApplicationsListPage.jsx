import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash } from '@phosphor-icons/react';
import Button from '../components/atoms/Button.jsx';
import Badge from '../components/atoms/Badge.jsx';
import Input from '../components/atoms/Input.jsx';
import Modal from '../components/molecules/Modal.jsx';
import { api } from '../lib/apiClient.js';
import { formatDate } from '../lib/format.js';
import { APPLICATION_STATUS, APPLICATION_STATUS_LABELS, STATUS_VARIANTS } from '../../shared/constants.js';

export default function ApplicationsListPage({ user }) {
  const navigate = useNavigate();
  const [allApplications, setAllApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await api.getApplications();
      setAllApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Live filter applications based on search term
  const applications = searchTerm
    ? allApplications.filter(app => {
        const searchLower = searchTerm.toLowerCase();
        return (
          app.candidate_name?.toLowerCase().includes(searchLower) ||
          app.candidate_subjects?.toLowerCase().includes(searchLower) ||
          app.staff_notes?.toLowerCase().includes(searchLower) ||
          app.jobs?.some(job => job.title?.toLowerCase().includes(searchLower))
        );
      })
    : allApplications;

  const canEdit = user?.role === 'staf' || user?.role === 'admin' || user?.role === 'directie';
  const canDelete = user?.role === 'admin' || user?.role === 'directie';

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(applications.map(app => app.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (appId) => {
    if (selectedIds.includes(appId)) {
      setSelectedIds(selectedIds.filter(id => id !== appId));
    } else {
      setSelectedIds([...selectedIds, appId]);
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    setError('');

    try {
      await Promise.all(selectedIds.map(id => api.deleteApplication(id)));
      await loadApplications();
      setSelectedIds([]);
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.message || 'Er is een fout opgetreden bij het verwijderen');
    } finally {
      setDeleting(false);
    }
  };

  const handleRowClick = (app, e) => {
    if (e.target.type === 'checkbox') return;
    navigate(`/applications/${app.id}`);
  };

  if (loading) return <div className="loading">Laden...</div>;

  const allSelected = applications.length > 0 && selectedIds.length === applications.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < applications.length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Sollicitaties</h1>
          <p className="page-subtitle" style={{ visibility: selectedIds.length > 0 ? 'visible' : 'hidden' }}>
            {selectedIds.length > 0 ? `${selectedIds.length} ${selectedIds.length === 1 ? 'sollicitatie' : 'sollicitaties'} geselecteerd` : 'placeholder'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', minHeight: '40px', alignItems: 'center' }}>
          {selectedIds.length > 0 && (
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              <Trash size={20} weight="bold" />
              Verwijder geselecteerde
            </Button>
          )}
          {canEdit && (
            <Link to="/applications/new">
              <Button variant="primary">
                <Plus size={20} weight="bold" />
                Nieuwe sollicitatie
              </Button>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div className="search-bar" style={{ marginBottom: '1.5rem' }}>
        <Input
          type="search"
          placeholder="Zoek sollicitaties op kandidaat, vakken of vacature..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {applications.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#666' }}>Nog geen sollicitaties</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={input => {
                        if (input) input.indeterminate = someSelected;
                      }}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th>Kandidaat</th>
                  <th>Vakken</th>
                  <th>Vacatures</th>
                  <th>Status</th>
                  <th>Volgende stap</th>
                  <th>Datum</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} onClick={(e) => handleRowClick(app, e)} style={{ cursor: 'pointer' }}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app.id)}
                        onChange={() => handleSelectOne(app.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>{app.candidate_name || '-'}</td>
                    <td>{app.candidate_subjects || '-'}</td>
                    <td>
                      {app.jobs?.length > 0
                        ? app.jobs.map(j => j.title).join(', ')
                        : 'Spontaan'}
                    </td>
                    <td>
                      <Badge variant={STATUS_VARIANTS[app.status || APPLICATION_STATUS.IN_BEHANDELING]}>
                        {APPLICATION_STATUS_LABELS[app.status || APPLICATION_STATUS.IN_BEHANDELING]}
                      </Badge>
                    </td>
                    <td>{app.next_step || '-'}</td>
                    <td>{formatDate(app.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showDeleteModal} onClose={() => !deleting && setShowDeleteModal(false)} title="Sollicitaties verwijderen">
        <p style={{ marginBottom: '1.5rem' }}>
          Weet je zeker dat je <strong>{selectedIds.length}</strong> {selectedIds.length === 1 ? 'sollicitatie' : 'sollicitaties'} wilt verwijderen?
        </p>
        <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Deze actie kan niet ongedaan worden gemaakt.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="danger" onClick={handleBulkDelete} disabled={deleting}>
            {deleting ? 'Verwijderen...' : 'Ja, verwijderen'}
          </Button>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
            Annuleren
          </Button>
        </div>
      </Modal>
    </div>
  );
}
