import React, { useEffect, useState } from 'react';
import { LogOut, Sliders, HelpCircle, ShieldCheck, PlayCircle } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import HelpAccordion from '../components/HelpAccordion.jsx';
import TutorialOverlay from '../components/TutorialOverlay.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { endpoints } from '../api/api.js';

export default function Settings() {
  const { user, logout, refreshUser } = useAuth();
  const [threshold, setThreshold] = useState(user?.z_threshold ?? 1.0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [users, setUsers] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      endpoints.listUsers().then(({ data }) => setUsers(data.users)).catch(() => {});
    }
  }, [user]);

  const saveThreshold = async () => {
    await endpoints.updateSettings({ z_threshold: threshold });
    await refreshUser();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const setRole = async (userId, role) => {
    await endpoints.setRole({ userId, role });
    const { data } = await endpoints.listUsers();
    setUsers(data.users);
  };

  return (
    <AppShell title="Settings">
      {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}

      <p className="font-display font-bold text-2xl text-ink-900 mb-4">Settings</p>

      {/* Profile */}
      <div className="card p-5 flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center font-display font-bold text-xl text-brand-700 shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ink-900 truncate">{user?.name}</p>
          <p className="text-xs text-ink-500 truncate">{user?.email}</p>
          <span className={`chip mt-1 ${user?.role === 'admin' ? 'bg-brand-100 text-brand-700' : 'bg-ink-200/40 text-ink-500'}`}>
            {user?.role === 'admin' ? 'Authorized admin' : 'Standard user'}
          </span>
        </div>
      </div>

      {/* Sensitivity */}
      <div className="card p-5 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Sliders size={16} className="text-brand-600" />
          <p className="font-semibold text-sm text-ink-900">Bottleneck sensitivity</p>
        </div>
        <p className="text-xs text-ink-500 mb-4">
          A stage is flagged when it's this many standard deviations slower than the pipeline average. Lower = more
          sensitive (flags more stages). Current: <span className="font-mono font-semibold">{threshold.toFixed(1)}</span>
        </p>
        <input
          type="range"
          min="0.5"
          max="2.5"
          step="0.1"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="w-full accent-brand-600"
        />
        <div className="flex justify-between text-[10px] text-ink-500 mt-1 mb-3">
          <span>More sensitive</span>
          <span>Fewer, stronger flags</span>
        </div>
        <button className="btn-secondary text-sm" onClick={saveThreshold}>
          {saved ? 'Saved ✓' : 'Save threshold'}
        </button>
      </div>

      {/* Admin panel */}
      {user?.role === 'admin' && users && (
        <div className="card p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} className="text-brand-600" />
            <p className="font-semibold text-sm text-ink-900">Manage users</p>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between text-sm py-1.5">
                <div className="min-w-0 pr-2">
                  <p className="font-medium text-ink-900 truncate">{u.name}</p>
                  <p className="text-xs text-ink-500 truncate">{u.email}</p>
                </div>
                <select
                  value={u.role}
                  onChange={(e) => setRole(u.id, e.target.value)}
                  className="text-xs border border-ink-200 rounded-lg px-2 py-1 shrink-0"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help & Tutorial */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle size={16} className="text-brand-600" />
          <p className="font-semibold text-sm text-ink-900">Help</p>
        </div>
        <button
          onClick={() => setShowTutorial(true)}
          className="w-full card p-4 flex items-center justify-between mb-3"
        >
          <div className="flex items-center gap-3">
            <PlayCircle size={20} className="text-brand-600" />
            <div className="text-left">
              <p className="font-semibold text-sm text-ink-900">Replay tutorial</p>
              <p className="text-xs text-ink-500">A 5-step walkthrough of the app</p>
            </div>
          </div>
        </button>
        <HelpAccordion />
      </div>

      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 text-danger-500 font-semibold text-sm py-3"
      >
        <LogOut size={16} /> Log out
      </button>
    </AppShell>
  );
}
