import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from '@phosphor-icons/react';
import Button from '../components/atoms/Button.jsx';
import Input from '../components/atoms/Input.jsx';
import Table from '../components/molecules/Table.jsx';
import { api } from '../lib/apiClient.js';
import { formatDate } from '../lib/format.js';

export default function JobsListPage({ user }) {
  const [allJobs, setAllJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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

  // Live filter jobs based on search term
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

  const canManageJobs = user?.role === 'admin' || user?.role === 'directie';

  const columns = [
    { header: 'Titel', field: 'title' },
    {
      header: 'Vak',
      render: (job) => job.vak || '-'
    },
    {
      header: 'Uren',
      render: (job) => job.hours || '-'
    },
    {
      header: 'Klassen',
      render: (job) => job.classes || '-'
    },
    {
      header: 'Aangemaakt',
      render: (job) => formatDate(job.created_at)
    }
  ];

  if (loading) return <div className="loading">Laden...</div>;

  return (
    <div className="jobs-list-page">
      <div className="page-header">
        <h1>Vacatures</h1>
        {canManageJobs && (
          <Link to="/jobs/new">
            <Button variant="primary">
              <Plus size={20} weight="bold" />
              Nieuwe vacature
            </Button>
          </Link>
        )}
      </div>

      <div className="search-bar">
        <Input
          type="search"
          placeholder="Zoek vacatures op titel, vak, klassen of notities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        data={jobs}
        onRowClick={(job) => window.location.href = `/jobs/${job.id}`}
        emptyMessage="Nog geen vacatures"
      />
    </div>
  );
}
