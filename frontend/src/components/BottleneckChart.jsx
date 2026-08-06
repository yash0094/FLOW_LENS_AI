import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { fmtDuration } from '../utils/format.js';

export default function BottleneckChart({ stageReports }) {
  const data = [...stageReports]
    .sort((a, b) => b.mean - a.mean)
    .map((s) => ({ name: s.stage, minutes: +(s.mean / 60).toFixed(1), isBottleneck: s.isBottleneck }));

  return (
    <div className="card p-5">
      <p className="font-display font-semibold text-sm text-ink-900 mb-1">Average Time per Stage</p>
      <p className="text-xs text-ink-500 mb-4">Red bars are flagged as bottlenecks.</p>
      <ResponsiveContainer width="100%" height={Math.max(160, data.length * 44)}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EDE9FE" />
          <XAxis type="number" tickFormatter={(v) => `${v}m`} stroke="#6B7280" fontSize={11} />
          <YAxis type="category" dataKey="name" width={110} stroke="#6B7280" fontSize={11} />
          <Tooltip
            formatter={(value) => [fmtDuration(value * 60), 'Avg duration']}
            contentStyle={{ borderRadius: 12, border: '1px solid #EDE9FE', fontSize: 12 }}
          />
          <Bar dataKey="minutes" radius={[0, 8, 8, 0]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.isBottleneck ? '#DC2626' : '#7C3AED'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
