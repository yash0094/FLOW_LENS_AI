import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UploadCloud, FileBarChart2, Settings as SettingsIcon, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/upload', icon: UploadCloud, label: 'Upload' },
  { to: '/reports', icon: FileBarChart2, label: 'Reports' },
  { to: '/settings', icon: SettingsIcon, label: 'Settings' },
];

export default function AppShell({ children, title }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-canvas pb-24">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur border-b border-brand-100/70">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-floating shrink-0">
              <Zap size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-display font-bold text-lg leading-none text-ink-900">FlowLens</p>
              {title && <p className="text-xs text-ink-500 mt-0.5">{title}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <span className="chip bg-brand-600 text-white">Admin</span>
            )}
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center font-display font-semibold text-brand-700 text-sm">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-5">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-brand-100 shadow-[0_-4px_20px_rgba(91,33,182,0.08)]">
        <div className="max-w-3xl mx-auto grid grid-cols-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors ${
                  isActive ? 'text-brand-600' : 'text-ink-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
