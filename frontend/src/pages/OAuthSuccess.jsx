import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { endpoints } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';

export default function OAuthSuccess() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      navigate('/login');
      return;
    }
    localStorage.setItem('flowlens_token', token);
    endpoints
      .me()
      .then(({ data }) => {
        login(token, data.user);
        navigate('/dashboard');
      })
      .catch(() => navigate('/login'));
  }, []);

  return <Loader full label="Signing you in with Google..." />;
}
