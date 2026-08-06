import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, Download, AlertTriangle, RefreshCw } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import Loader from '../components/Loader.jsx';
import FlowMeter from '../components/FlowMeter.jsx';
import BottleneckChart from '../components/BottleneckChart.jsx';
import StageCard from '../components/StageCard.jsx';
import { endpoints } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { fmtDuration } from '../utils/format.js';

export default function Report() {
  const { id } = useParams();
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(undefined); // undefined = loading, null = none yet
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const loadLatest = async () => {
    try {
      const { data } = await endpoints.getLatestAnalysis(id);
      setAnalysis(data.result);
    } catch {
      setAnalysis(null);
    }
  };

  useEffect(() => {
    loadLatest();
  }, [id]);

  const runAnalysis = async () => {
    setRunning(true);
    setError('');
    try {
      const { data } = await endpoints.runAnalysis(id, user?.z_threshold ?? 1.0);
      setAnalysis(data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed.');
    } finally {
      setRunning(false);
    }
  };

  if (analysis === undefined) return <Loader full label="Loading report..." />;

  return (
    <AppShell title="Report">
      {analysis === null && !running && (
        <div className="card p-8 flex flex-col items-center text-center gap-3">
          <Sparkles className="text-brand-500" size={32} />
          <p className="font-semibold text-ink-900">No analysis yet</p>
          <p className="text-xs text-ink-500 max-w-[240px]">
            Run the bottleneck detection engine on this dataset to generate a report.
          </p>
          <button className="btn-primary mt-2" onClick={runAnalysis}>
            Analyze now
          </button>
        </div>
      )}

      {running && <Loader label="Crunching the numbers..." />}

      {error && (
        <div className="card border-danger-100 bg-danger-100/30 p-4 mb-4 flex items-start gap-2">
          <AlertTriangle size={18} className="text-danger-500 shrink-0 mt-0.5" />
          <p className="text-sm text-danger-500">{error}</p>
        </div>
      )}

      {analysis && !running && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="font-display font-bold text-2xl text-ink-900">Bottleneck Report</p>
            <div className="flex gap-2">
              <button onClick={runAnalysis} className="text-ink-500" title="Re-run analysis" aria-label="Re-run analysis">
                <RefreshCw size={18} />
              </button>
              <a
                href={endpoints.downloadReportUrl(id) + `?t=${localStorage.getItem('flowlens_token')}`}
                onClick={(e) => {
                  e.preventDefault();
                  downloadPdf(id);
                }}
                className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
              >
                <Download size={15} /> PDF
              </a>
            </div>
          </div>

          {/* Executive summary */}
          <div className="card p-5 bg-brand-50 border-brand-100">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-700 mb-1.5">Executive Summary</p>
            <p className="text-sm text-ink-900 leading-relaxed">{analysis.summaryText}</p>
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-4 gap-2">
            <StatCard label="Items" value={analysis.totalItems} />
            <StatCard label="Stages" value={analysis.totalStages} />
            <StatCard label="Bottlenecks" value={analysis.bottleneckStages.length} danger={analysis.bottleneckStages.length > 0} />
            <StatCard label="Stuck items" value={analysis.stuckItemCount} danger={analysis.stuckItemCount > 0} />
          </div>

          <FlowMeter stages={analysis.stageReports} />

          <BottleneckChart stageReports={analysis.stageReports} />

          {/* Stage breakdown */}
          <div>
            <p className="font-display font-semibold text-ink-900 mb-3">Stage-by-stage breakdown</p>
            <div className="space-y-2">
              {[...analysis.stageReports]
                .sort((a, b) => b.mean - a.mean)
                .map((s, idx) => (
                  <StageCard key={s.stage} stage={s} rank={idx + 1} defaultOpen={idx === 0} />
                ))}
            </div>
          </div>

          {/* Stuck items */}
          {analysis.stuckItems.length > 0 && (
            <div>
              <p className="font-display font-semibold text-ink-900 mb-3">
                Stuck items <span className="text-ink-500 font-normal text-sm">(top outliers)</span>
              </p>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-brand-50 text-left text-xs text-brand-700 uppercase">
                      <th className="p-3 font-semibold">Item</th>
                      <th className="p-3 font-semibold">Stage</th>
                      <th className="p-3 font-semibold text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.stuckItems.slice(0, 15).map((item, idx) => (
                      <tr key={idx} className="border-t border-ink-200/50">
                        <td className="p-3 font-mono text-xs">{item.item_id}</td>
                        <td className="p-3 text-xs">{item.stage}</td>
                        <td className="p-3 text-xs text-right font-mono text-danger-500 font-semibold">
                          {fmtDuration(item.duration_seconds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}

function StatCard({ label, value, danger }) {
  return (
    <div className="card p-3 text-center">
      <p className={`font-display font-bold text-xl ${danger ? 'text-danger-500' : 'text-brand-600'}`}>{value}</p>
      <p className="text-[10px] text-ink-500 uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}

async function downloadPdf(datasetId) {
  const token = localStorage.getItem('flowlens_token');
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/report/${datasetId}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    alert('Could not generate PDF. Please try again.');
    return;
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'FlowLens_Report.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
