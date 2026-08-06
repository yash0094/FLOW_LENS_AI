import React, { createContext, useContext, useEffect, useState } from 'react';
import { endpoints } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem('flowlens_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await endpoints.me();
      setUser(data.user);
    } catch {
      localStorage.removeItem('flowlens_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('flowlens_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('flowlens_token');
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await endpoints.me();
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
