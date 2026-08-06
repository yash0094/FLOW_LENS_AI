import React, { useState } from 'react';
import { X, UploadCloud, Sparkles, FileText, Download, Table2 } from 'lucide-react';

const steps = [
  {
    icon: UploadCloud,
    title: 'Load your process data',
    body:
      'Go to Upload and drag in a CSV or Excel file — or paste a Google Sheets link. Each row should show one item moving through one stage, with an entry and exit time.',
  },
  {
    icon: Sparkles,
    title: 'Run the analysis',
    body:
      'Tap "Analyze" on your dataset. FlowLens computes average time per stage and compares it statistically against the rest of your pipeline — no AI black box, just clear math.',
  },
  {
    icon: Table2,
    title: 'Read the report',
    body:
      'The report ranks every stage, flags bottlenecks in red, explains the likely cause (capacity vs. inconsistency vs. exceptions), and lists specific stuck items.',
  },
  {
    icon: FileText,
    title: 'Understand the "why"',
    body:
      'Tap any stage card to expand it — you\'ll get a plain-English explanation and a specific recommendation you can act on today.',
  },
  {
    icon: Download,
    title: 'Download the PDF',
    body:
      'One tap turns the whole report into a shareable PDF — perfect for a standup, a client update, or an ops review.',
  },
];

export default function TutorialOverlay({ onClose }) {
  const [i, setI] = useState(0);
  const step = steps[i];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 bg-ink-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-xl2 w-full max-w-sm p-6 relative shadow-floating animate-[fadeIn_.2s_ease]">
        <button onClick={onClose} className="absolute top-4 right-4 text-ink-500" aria-label="Close tutorial">
          <X size={20} />
        </button>
        <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mb-4">
          <Icon size={26} className="text-brand-600" />
        </div>
        <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-1">
          Step {i + 1} of {steps.length}
        </p>
        <h3 className="font-display font-bold text-lg text-ink-900 mb-2">{step.title}</h3>
        <p className="text-sm text-ink-500 leading-relaxed mb-6">{step.body}</p>

        <div className="flex items-center gap-1.5 mb-5">
          {steps.map((_, idx) => (
            <div key={idx} className={`h-1.5 rounded-full flex-1 ${idx <= i ? 'bg-brand-600' : 'bg-brand-100'}`} />
          ))}
        </div>

        <div className="flex gap-3">
          {i > 0 && (
            <button className="btn-secondary flex-1" onClick={() => setI(i - 1)}>
              Back
            </button>
          )}
          <button
            className="btn-primary flex-1"
            onClick={() => (i === steps.length - 1 ? onClose() : setI(i + 1))}
          >
            {i === steps.length - 1 ? 'Got it' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
