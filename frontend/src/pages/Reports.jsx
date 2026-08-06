import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Database, Trash2 } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import Loader from '../components/Loader.jsx';
import { endpoints } from '../api/api.js';
import { fmtDate } from '../utils/format.js';

export default function Reports() {
  const [datasets, setDatasets] = useState(null);

  const load = () => endpoints.listDatasets().then(({ data }) => setDatasets(data.datasets));

  useEffect(() => {
    load();
  }, []);

  const remove = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this dataset and its analysis? This cannot be undone.')) return;
    await endpoints.deleteDataset(id);
    load();
  };

  return (
    <AppShell title="Reports">
      <p className="font-display font-bold text-2xl text-ink-900 mb-4">Your datasets</p>

      {datasets === null && <Loader label="Loading reports..." />}

      {datasets?.length === 0 && (
        <div className="card p-8 flex flex-col items-center text-center gap-2">
          <Database className="text-brand-300" size={32} />
          <p className="font-semibold text-ink-900 text-sm">Nothing here yet</p>
          <Link to="/upload" className="btn-primary text-sm mt-2">
            Upload your first dataset
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {datasets?.map((d) => (
          <Link key={d.id} to={`/reports/${d.id}`} className="card p-4 flex items-center justify-between group">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-ink-900 truncate">{d.name}</p>
              <p className="text-xs text-ink-500">
                {d.row_count} rows · {d.source === 'sheets' ? 'Google Sheets' : 'File upload'} · {fmtDate(d.created_at)}
                {d.owner_name ? ` · ${d.owner_name}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={(e) => remove(d.id, e)}
                className="text-ink-500 hover:text-danger-500 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete dataset"
              >
                <Trash2 size={16} />
              </button>
              <ArrowRight size={16} className="text-ink-500" />
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
