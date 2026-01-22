import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Users } from '@phosphor-icons/react';
import Card from '../components/molecules/Card.jsx';
import Table from '../components/molecules/Table.jsx';
import { api } from '../lib/apiClient.js';
import { formatDate } from '../lib/format.js';

export default function DashboardPage() {
  const [stats, setStats] = useState({ jobs: 0, applications: 0, candidates: 0 });
  const [recentApplications, setRecentApplications] = useState([]);
  const [openJobs, setOpenJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [jobs, applications, candidates] = await Promise.all([
        api.getJobs(),
        api.getApplications(),
        api.getCandidates()
      ]);

      setStats({
        jobs: jobs.length,
        applications: applications.length,
        candidates: candidates.length
      });

      setRecentApplications(applications.slice(0, 5));
      setOpenJobs(jobs.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const applicationColumns = [
    {
      header: 'Kandidaat',
      render: (app) => app.candidate_name || '-'
    },
    {
      header: 'Vakken',
      render: (app) => app.candidate_subjects || '-'
    },
    {
      header: 'Datum',
      render: (app) => formatDate(app.created_at)
    }
  ];

  const jobColumns = [
    { header: 'Titel', field: 'title' },
    {
      header: 'Vak',
      render: (job) => job.vak || '-'
    },
    {
      header: 'Sollicitaties',
      render: (job) => job.application_count || 0
    }
  ];

  if (loading) return <div className="loading">Laden...</div>;

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon">
            <Briefcase size={32} weight="duotone" />
          </div>
          <div className="stat-card__content">
            <div className="stat-card__value">{stats.jobs}</div>
            <div className="stat-card__label">Vacatures</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon">
            <FileText size={32} weight="duotone" />
          </div>
          <div className="stat-card__content">
            <div className="stat-card__value">{stats.applications}</div>
            <div className="stat-card__label">Sollicitaties</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon">
            <Users size={32} weight="duotone" />
          </div>
          <div className="stat-card__content">
            <div className="stat-card__value">{stats.candidates}</div>
            <div className="stat-card__label">Kandidaten</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <Card
          title="Recente sollicitaties"
          actions={<Link to="/applications" className="link">Alles bekijken →</Link>}
        >
          <Table
            columns={applicationColumns}
            data={recentApplications}
            onRowClick={(app) => window.location.href = `/applications/${app.id}`}
            emptyMessage="Nog geen sollicitaties"
          />
        </Card>

        <Card
          title="Open vacatures"
          actions={<Link to="/jobs" className="link">Alles bekijken →</Link>}
        >
          <Table
            columns={jobColumns}
            data={openJobs}
            onRowClick={(job) => window.location.href = `/jobs/${job.id}`}
            emptyMessage="Nog geen vacatures"
          />
        </Card>
      </div>
    </div>
  );
}
