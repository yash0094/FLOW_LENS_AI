import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What format should my file be in?',
    a: 'A CSV or Excel file where each row is one item at one stage: columns for item ID, stage name, entry time, and exit time. Column names are flexible — "Order Number", "OrderID", "item" all work.',
  },
  {
    q: 'How does FlowLens decide a stage is a "bottleneck"?',
    a: 'It compares each stage\'s average duration to the average across all stages using a z-score. If a stage is more standard deviations slower than the threshold set in Settings (default 1.0), it\'s flagged. This is plain statistics, not AI.',
  },
  {
    q: 'What are "stuck items"?',
    a: 'Individual items whose time in a stage is unusually high compared to everything else in that same stage — specifically, above Q3 + 1.5×IQR, the standard box-plot outlier rule.',
  },
  {
    q: 'Can I connect Google Sheets instead of uploading a file?',
    a: 'Yes — sign in with Google, then on the Upload page paste your Google Sheet link. FlowLens reads the sheet directly using your Google account\'s permission.',
  },
  {
    q: 'What\'s the difference between admin and normal accounts?',
    a: 'Admins can see every dataset uploaded across the whole organization; normal users only see their own. The very first person to register on a new deployment automatically becomes admin.',
  },
  {
    q: 'Can I change how sensitive the bottleneck detection is?',
    a: 'Yes — in Settings, adjust the "Sensitivity threshold" slider. A lower number flags more stages as bottlenecks; a higher number only flags the most extreme ones.',
  },
  {
    q: 'Is my data shared with any AI model?',
    a: 'No. The bottleneck detection is deterministic statistics running entirely on the FlowLens server — no data is sent to any third-party AI service.',
  },
];

export default function HelpAccordion() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className="space-y-2">
      {faqs.map((f, idx) => (
        <div key={idx} className="card overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 text-left"
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
          >
            <span className="font-semibold text-sm text-ink-900 pr-3">{f.q}</span>
            <ChevronDown
              size={18}
              className={`text-brand-600 shrink-0 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`}
            />
          </button>
          {openIdx === idx && <p className="px-4 pb-4 text-sm text-ink-500 leading-relaxed">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}
