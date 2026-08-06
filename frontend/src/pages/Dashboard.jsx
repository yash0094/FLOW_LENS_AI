import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, FileBarChart2, ArrowRight, Sparkles, Database } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import Loader from '../components/Loader.jsx';
import { endpoints } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { fmtDate } from '../utils/format.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [datasets, setDatasets] = useState(null);

  useEffect(() => {
    endpoints
      .listDatasets()
      .then(({ data }) => setDatasets(data.datasets))
      .catch(() => setDatasets([]));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <AppShell title="Home">
      <p className="text-ink-500 text-sm">
        {greeting}, <span className="font-semibold text-ink-900">{user?.name?.split(' ')[0]}</span>
      </p>

      {/* Primary metric card */}
      <div className="mt-3 rounded-xl2 bg-gradient-to-br from-brand-600 to-brand-900 p-6 text-white shadow-floating relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -right-2 top-16 w-16 h-16 rounded-full bg-white/10" />
        <p className="text-brand-100 text-xs font-semibold uppercase tracking-wide">Datasets analyzed</p>
        <p className="font-display font-bold text-4xl mt-1">{datasets?.length ?? '—'}</p>
        <p className="text-brand-100 text-xs mt-3 max-w-[70%]">
          {user?.role === 'admin'
            ? 'Showing datasets from every user in your organization.'
            : 'Upload a new file anytime to spot your next bottleneck.'}
        </p>
        <Link
          to="/upload"
          className="inline-flex items-center gap-1.5 bg-white text-brand-700 font-semibold text-sm rounded-full px-4 py-2 mt-4"
        >
          <UploadCloud size={15} /> Upload data
        </Link>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <Link to="/upload" className="card p-4 flex flex-col gap-2">
          <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center">
            <UploadCloud size={17} className="text-brand-600" />
          </div>
          <p className="font-semibold text-sm text-ink-900">New upload</p>
          <p className="text-xs text-ink-500">CSV, Excel, or Sheets</p>
        </Link>
        <Link to="/reports" className="card p-4 flex flex-col gap-2">
          <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center">
            <FileBarChart2 size={17} className="text-brand-600" />
          </div>
          <p className="font-semibold text-sm text-ink-900">View reports</p>
          <p className="text-xs text-ink-500">All your analyses</p>
        </Link>
      </div>

      {/* Recent datasets */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display font-semibold text-ink-900">Recent datasets</p>
          {datasets?.length > 0 && (
            <Link to="/reports" className="text-brand-600 text-xs font-semibold flex items-center gap-0.5">
              See all <ArrowRight size={12} />
            </Link>
          )}
        </div>

        {datasets === null && <Loader label="Loading your datasets..." />}

        {datasets?.length === 0 && (
          <div className="card p-8 flex flex-col items-center text-center gap-2">
            <Database className="text-brand-300" size={32} />
            <p className="font-semibold text-ink-900 text-sm">No datasets yet</p>
            <p className="text-xs text-ink-500 max-w-[220px]">
              Upload a CSV, Excel file, or connect a Google Sheet to run your first bottleneck analysis.
            </p>
            <Link to="/upload" className="btn-primary text-sm mt-2 flex items-center gap-1.5">
              <Sparkles size={14} /> Get started
            </Link>
          </div>
        )}

        <div className="space-y-2">
          {datasets?.slice(0, 5).map((d) => (
            <Link key={d.id} to={`/reports/${d.id}`} className="card p-4 flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-ink-900 truncate">{d.name}</p>
                <p className="text-xs text-ink-500">
                  {d.row_count} rows · {d.source === 'sheets' ? 'Google Sheets' : 'File upload'} ·{' '}
                  {fmtDate(d.created_at)}
                  {d.owner_name ? ` · ${d.owner_name}` : ''}
                </p>
              </div>
              <ArrowRight size={16} className="text-ink-500 shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
