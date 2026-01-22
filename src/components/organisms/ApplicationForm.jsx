import { useState, useEffect } from 'react';
import FormRow from '../molecules/FormRow.jsx';
import Input from '../atoms/Input.jsx';
import Select from '../atoms/Select.jsx';
import Textarea from '../atoms/Textarea.jsx';
import Button from '../atoms/Button.jsx';
import { AlertModal } from '../molecules/Modal.jsx';
import { api } from '../../lib/apiClient.js';

export default function ApplicationForm({ initialData = {}, onSubmit, onCancel }) {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState(initialData.job_ids || []);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    candidate_id: initialData.candidate_id || '',
  });

  const [errors, setErrors] = useState({});
  const [showNewCandidate, setShowNewCandidate] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    subjects: '',
    staff_notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [candidatesData, jobsData] = await Promise.all([
        api.getCandidates(),
        api.getJobs()
      ]);
      setCandidates(candidatesData);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNewCandidateChange = (e) => {
    const { name, value } = e.target;
    setNewCandidate(prev => ({ ...prev, [name]: value }));
  };

  const handleJobToggle = (jobId) => {
    setSelectedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleCreateCandidate = async () => {
    try {
      const candidate = await api.createCandidate(newCandidate);
      setCandidates(prev => [...prev, candidate]);
      setFormData(prev => ({ ...prev, candidate_id: candidate.id }));
      setShowNewCandidate(false);
      setNewCandidate({ name: '', subjects: '', staff_notes: '' });
      setAlert({ title: 'Gelukt', message: 'Kandidaat aangemaakt', variant: 'success' });
    } catch (error) {
      setAlert({ title: 'Fout', message: 'Fout bij aanmaken kandidaat: ' + error.message, variant: 'error' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.candidate_id) newErrors.candidate_id = 'Selecteer of maak een kandidaat aan';
    // Vacatures zijn optioneel (spontane sollicitatie mogelijk)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ ...formData, job_ids: selectedJobs });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="application-form">
        <FormRow label="Kandidaat" required error={errors.candidate_id}>
          {!showNewCandidate ? (
            <>
              <Select
                name="candidate_id"
                value={formData.candidate_id}
                onChange={handleChange}
                placeholder="Selecteer een kandidaat"
                options={candidates.map(c => ({
                  value: c.id,
                  label: c.name
                }))}
              />
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={() => setShowNewCandidate(true)}
                className="mt-2"
              >
                + Nieuwe kandidaat
              </Button>
            </>
          ) : (
            <div className="new-candidate-form">
              <Input
                name="name"
                placeholder="Naam"
                value={newCandidate.name}
                onChange={handleNewCandidateChange}
                required
              />
              <Input
                name="subjects"
                placeholder="Vakken (bijv. Nederlands, Wiskunde)"
                value={newCandidate.subjects}
                onChange={handleNewCandidateChange}
              />
              <Textarea
                name="staff_notes"
                placeholder="Interne notities (bijv. sterke kandidaat, spontaan)"
                value={newCandidate.staff_notes}
                onChange={handleNewCandidateChange}
                rows={3}
              />
              <div className="button-group">
                <Button type="button" size="small" onClick={handleCreateCandidate}>
                  Aanmaken
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={() => setShowNewCandidate(false)}
                >
                  Annuleren
                </Button>
              </div>
            </div>
          )}
        </FormRow>

        <FormRow label="Vacatures (optioneel - laat leeg voor spontane sollicitatie)" error={errors.jobs}>
          <div className="checkbox-group">
            {jobs.length === 0 ? (
              <p className="text-muted">Nog geen vacatures beschikbaar</p>
            ) : (
              jobs.map(job => (
                <label key={job.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedJobs.includes(job.id)}
                    onChange={() => handleJobToggle(job.id)}
                  />
                  {job.title} {job.vak && `- ${job.vak}`}
                </label>
              ))
            )}
          </div>
        </FormRow>

        <div className="form-actions">
          <Button type="submit" variant="primary">Opslaan</Button>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Annuleren
            </Button>
          )}
        </div>
      </form>

      {alert && (
        <AlertModal
          isOpen={true}
          onClose={() => setAlert(null)}
          title={alert.title}
          message={alert.message}
          variant={alert.variant}
        />
      )}
    </>
  );
}
