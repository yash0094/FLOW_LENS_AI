import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileSpreadsheet, Link2, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import { endpoints } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    setError('');
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    try {
      const { data } = await endpoints.uploadFile(formData);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please check your file format.');
    } finally {
      setBusy(false);
    }
  };

  const handleSheetImport = async () => {
    if (!sheetUrl) return;
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const { data } = await endpoints.importSheet({ spreadsheetUrl: sheetUrl, name: 'Google Sheet import' });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not import this sheet.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Upload data">
      <p className="font-display font-bold text-2xl text-ink-900 mb-1">Load your process data</p>
      <p className="text-sm text-ink-500 mb-6">
        One row per item, per stage — with an entry and exit time. Flexible column names are fine.
      </p>

      {/* Drag & drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`card border-2 border-dashed p-8 flex flex-col items-center text-center cursor-pointer transition-colors ${
          dragOver ? 'border-brand-500 bg-brand-50' : 'border-brand-200'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mb-3">
          <UploadCloud size={26} className="text-brand-600" />
        </div>
        <p className="font-semibold text-ink-900">Drag & drop a CSV or Excel file</p>
        <p className="text-xs text-ink-500 mt-1">or tap to browse · up to 20MB</p>
      </div>

      <a
        href="/sample_process_data.csv"
        download
        className="flex items-center justify-center gap-1.5 text-brand-600 text-xs font-semibold mt-3"
      >
        <Download size={13} /> Download a sample CSV to try
      </a>

      {/* Google Sheets import */}
      <div className="card p-5 mt-6">
        <div className="flex items-center gap-2 mb-1">
          <FileSpreadsheet size={17} className="text-brand-600" />
          <p className="font-semibold text-sm text-ink-900">Import from Google Sheets</p>
        </div>
        <p className="text-xs text-ink-500 mb-3">
          {user?.email ? 'Paste a sheet link and FlowLens will read it directly.' : ''}
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              className="input pl-9"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
          </div>
          <button className="btn-secondary shrink-0" onClick={handleSheetImport} disabled={busy || !sheetUrl}>
            Import
          </button>
        </div>
      </div>

      {busy && (
        <div className="mt-5 flex items-center gap-2 text-sm text-ink-500">
          <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          Processing your data...
        </div>
      )}

      {error && (
        <div className="card border-danger-100 bg-danger-100/30 p-4 mt-5 flex items-start gap-2">
          <AlertCircle size={18} className="text-danger-500 shrink-0 mt-0.5" />
          <p className="text-sm text-danger-500">{error}</p>
        </div>
      )}

      {result && (
        <div className="card p-5 mt-5 border-ok-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={18} className="text-ok-500" />
            <p className="font-semibold text-sm text-ink-900">Loaded {result.dataset.row_count} rows</p>
          </div>
          {result.skippedRows > 0 && (
            <p className="text-xs text-warn-500 mb-3">{result.skippedRows} row(s) were skipped — check formatting.</p>
          )}
          <button className="btn-primary w-full" onClick={() => navigate(`/reports/${result.dataset.id}`)}>
            Run bottleneck analysis →
          </button>
        </div>
      )}
    </AppShell>
  );
}
