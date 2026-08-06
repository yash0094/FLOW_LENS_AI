import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, ArrowRight } from 'lucide-react';
import api, { endpoints, API_BASE } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    endpoints
      .googleStatus()
      .then(({ data }) => setGoogleEnabled(data.enabled))
      .catch(() => setGoogleEnabled(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } =
        mode === 'login' ? await endpoints.login(form) : await endpoints.register(form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-600 to-brand-700 flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-10 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-floating">
            <Zap size={22} className="text-brand-600" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-2xl text-white">FlowLens</span>
        </div>

        <h1 className="font-display font-bold text-3xl text-white mb-2 leading-tight">
          Find your process's<br />weakest link.
        </h1>
        <p className="text-brand-100 text-sm mb-8">
          Upload your operations data. Get a plain-English bottleneck report in seconds.
        </p>

        <div className="bg-white rounded-xl2 shadow-floating p-6">
          <div className="flex gap-2 mb-5 bg-brand-50 rounded-full p-1">
            <button
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${
                mode === 'login' ? 'bg-white shadow-card text-brand-700' : 'text-ink-500'
              }`}
              onClick={() => setMode('login')}
            >
              Log in
            </button>
            <button
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${
                mode === 'register' ? 'bg-white shadow-card text-brand-700' : 'text-ink-500'
              }`}
              onClick={() => setMode('register')}
            >
              Sign up
            </button>
          </div>

          <button
            type="button"
            disabled={!googleEnabled}
            onClick={() => (window.location.href = `${API_BASE}/api/auth/google`)}
            title={googleEnabled ? 'Continue with Google' : 'Google Sign-In is not configured on this server yet'}
            className="w-full flex items-center justify-center gap-2 border border-ink-200 rounded-full py-3 font-semibold text-sm text-ink-900 mb-4 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <GoogleG /> Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-px bg-ink-200 flex-1" />
            <span className="text-xs text-ink-500">or</span>
            <div className="h-px bg-ink-200 flex-1" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'register' && (
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                <input
                  className="input pl-9"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                type="email"
                className="input pl-9"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                type="password"
                className="input pl-9"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            {error && <p className="text-danger-500 text-xs font-medium">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <p className="text-brand-100 text-xs text-center mt-6">
          First person to sign up on a new deployment becomes the admin automatically.
        </p>
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6 29.5 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-1.8 14.1-5l-6.5-5.5c-2 1.4-4.6 2.3-7.6 2.3-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.5 5.5C41.5 35.5 44 30.2 44 24c0-1.3-.1-2.6-.4-3.5z"/>
    </svg>
  );
}
