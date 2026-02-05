import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash } from '@phosphor-icons/react';
import Button from '../components/atoms/Button.jsx';
import Input from '../components/atoms/Input.jsx';
import Modal from '../components/molecules/Modal.jsx';
import { api } from '../lib/apiClient.js';
import { formatDate } from '../lib/format.js';

export default function JobsListPage({ user }) {
  const navigate = useNavigate();
  const [allJobs, setAllJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await api.getJobs();
      setAllJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const jobs = searchTerm
    ? allJobs.filter(job => {
        const searchLower = searchTerm.toLowerCase();
        return (
          job.title?.toLowerCase().includes(searchLower) ||
          job.vak?.toLowerCase().includes(searchLower) ||
          job.classes?.toLowerCase().includes(searchLower) ||
          job.notes?.toLowerCase().includes(searchLower)
        );
      })
    : allJobs;

  const canManageJobs = user?.role === 'admin' || user?.role === 'directie' || user?.role === 'staf';

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(jobs.map(job => job.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (jobId) => {
    if (selectedIds.includes(jobId)) {
      setSelectedIds(selectedIds.filter(id => id !== jobId));
    } else {
      setSelectedIds([...selectedIds, jobId]);
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    setError('');

    try {
      await Promise.all(selectedIds.map(id => api.deleteJob(id)));
      await loadJobs();
      setSelectedIds([]);
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.message || 'Er is een fout opgetreden bij het verwijderen');
    } finally {
      setDeleting(false);
    }
  };

  const handleRowClick = (job, e) => {
    if (e.target.type === 'checkbox') return;
    navigate(`/jobs/${job.id}`);
  };

  if (loading) return <div className="loading">Laden...</div>;

  const allSelected = jobs.length > 0 && selectedIds.length === jobs.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < jobs.length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Vacatures</h1>
          <p className="page-subtitle" style={{ visibility: selectedIds.length > 0 ? 'visible' : 'hidden' }}>
            {selectedIds.length > 0 ? `${selectedIds.length} ${selectedIds.length === 1 ? 'vacature' : 'vacatures'} geselecteerd` : 'placeholder'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', minHeight: '40px', alignItems: 'center' }}>
          {selectedIds.length > 0 && (
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              <Trash size={20} weight="bold" />
              Verwijder geselecteerde
            </Button>
          )}
          {canManageJobs && (
            <Link to="/jobs/new">
              <Button variant="primary">
                <Plus size={20} weight="bold" />
                Nieuwe vacature
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
          placeholder="Zoek vacatures op titel, vak, klassen of notities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#666' }}>Nog geen vacatures</p>
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
                  <th>Titel</th>
                  <th>Vak</th>
                  <th>Uren</th>
                  <th>Klassen</th>
                  <th>Aangemaakt</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} onClick={(e) => handleRowClick(job, e)} style={{ cursor: 'pointer' }}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(job.id)}
                        onChange={() => handleSelectOne(job.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>{job.title}</td>
                    <td>{job.vak || '-'}</td>
                    <td>{job.hours || '-'}</td>
                    <td>{job.classes || '-'}</td>
                    <td>{formatDate(job.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showDeleteModal} onClose={() => !deleting && setShowDeleteModal(false)} title="Vacatures verwijderen">
        <p style={{ marginBottom: '1.5rem' }}>
          Weet je zeker dat je <strong>{selectedIds.length}</strong> {selectedIds.length === 1 ? 'vacature' : 'vacatures'} wilt verwijderen?
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
