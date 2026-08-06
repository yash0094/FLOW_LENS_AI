import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

// The signature visual of the app: your process rendered as a literal pipe,
// with each stage a node sized/colored by how much of a bottleneck it is.
// Order matters here (it's a real sequence), so numbering the nodes is meaningful.

function severityColor(stage) {
  if (stage.isBottleneck && stage.zScore >= 2) return { bg: '#DC2626', ring: '#FEE2E2', text: 'Severe' };
  if (stage.isBottleneck) return { bg: '#D97706', ring: '#FEF3C7', text: 'Bottleneck' };
  return { bg: '#059669', ring: '#D1FAE5', text: 'Healthy' };
}

export default function FlowMeter({ stages }) {
  const maxMean = Math.max(...stages.map((s) => s.mean), 1);

  return (
    <div className="card p-5 overflow-x-auto">
      <p className="font-display font-semibold text-sm text-ink-900 mb-1">Pipeline Flow</p>
      <p className="text-xs text-ink-500 mb-5">
        Node size = relative time spent. Color = how much slower than a typical stage.
      </p>
      <div className="flex items-center min-w-max pb-2">
        {stages.map((stage, i) => {
          const sev = severityColor(stage);
          const size = 44 + (stage.mean / maxMean) * 40;
          return (
            <React.Fragment key={stage.stage}>
              <div className="flex flex-col items-center gap-2 w-28 shrink-0">
                <div
                  className="rounded-full flex items-center justify-center font-display font-bold text-white shadow-md relative"
                  style={{ width: size, height: size, backgroundColor: sev.bg }}
                >
                  {i + 1}
                  {stage.isBottleneck ? (
                    <AlertTriangle size={14} className="absolute -top-1 -right-1 text-white bg-danger-500 rounded-full p-[2px]" />
                  ) : (
                    <CheckCircle2 size={14} className="absolute -top-1 -right-1 text-white bg-ok-500 rounded-full p-[2px]" />
                  )}
                </div>
                <p className="text-xs font-semibold text-ink-900 text-center leading-tight truncate w-full" title={stage.stage}>
                  {stage.stage}
                </p>
                <span
                  className="chip text-[10px]"
                  style={{ backgroundColor: sev.ring, color: sev.bg }}
                >
                  {sev.text}
                </span>
              </div>
              {i < stages.length - 1 && (
                <div className="h-1 flex-1 min-w-[24px] rounded-full bg-gradient-to-r from-brand-200 to-brand-100 mx-1" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
