import React from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react';
import { fmtDuration } from '../utils/format.js';

export default function StageCard({ stage, rank, defaultOpen = false }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const bottleneck = stage.isBottleneck;

  return (
    <div className={`card overflow-hidden border ${bottleneck ? 'border-danger-100' : 'border-brand-100/60'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-sm ${
              bottleneck ? 'bg-danger-100 text-danger-500' : 'bg-ok-100 text-ok-500'
            }`}
          >
            {rank}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-ink-900 truncate">{stage.stage}</p>
            <p className="text-xs text-ink-500 font-mono">{fmtDuration(stage.mean)} avg</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {bottleneck ? (
            <span className="chip bg-danger-100 text-danger-500">
              <AlertTriangle size={12} /> Bottleneck
            </span>
          ) : (
            <span className="chip bg-ok-100 text-ok-500">
              <CheckCircle2 size={12} /> Healthy
            </span>
          )}
          <ChevronDown size={18} className={`text-ink-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-ink-200/60 space-y-3">
          <div className="grid grid-cols-4 gap-2 text-center">
            <Stat label="Median" value={fmtDuration(stage.median)} />
            <Stat label="Std Dev" value={fmtDuration(stage.stddev)} />
            <Stat label="Items" value={stage.count} />
            <Stat label="Outliers" value={stage.outlierCount} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-600 mb-1">Cause: {stage.cause}</p>
            <p className="text-sm text-ink-500 leading-relaxed">{stage.explanation}</p>
          </div>
          <div className="bg-brand-50 rounded-xl p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-700 mb-1">Recommendation</p>
            <p className="text-sm text-ink-900 leading-relaxed">{stage.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-ink-200/20 rounded-lg py-2">
      <p className="font-mono font-semibold text-sm text-ink-900">{value}</p>
      <p className="text-[10px] text-ink-500 uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}
