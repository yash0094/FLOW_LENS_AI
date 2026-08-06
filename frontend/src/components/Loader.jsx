import React from 'react';
import { Zap } from 'lucide-react';

export default function Loader({ full = false, label = 'Loading...' }) {
  return (
    <div
      className={
        full
          ? 'min-h-screen flex flex-col items-center justify-center bg-canvas'
          : 'flex flex-col items-center justify-center py-16'
      }
    >
      <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center animate-pulse shadow-floating">
        <Zap className="text-white" size={22} strokeWidth={2.5} />
      </div>
      <p className="mt-4 text-sm text-ink-500 font-medium">{label}</p>
    </div>
  );
}
