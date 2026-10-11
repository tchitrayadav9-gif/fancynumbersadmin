import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentAdmin = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setAdmin(res.data.admin);
      }
    } catch (err) {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentAdmin();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      if (res.data.token) {
        localStorage.setItem('admin_token', res.data.token);
      }
      setAdmin(res.data.admin);
      return res.data;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('admin_token');
      setAdmin(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, refreshAdmin: fetchCurrentAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
