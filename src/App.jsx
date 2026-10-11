import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddNumberPage from './pages/AddNumberPage';
import NumbersListPage from './pages/NumbersListPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Admin Routes */}
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="add-number" element={<AddNumberPage />} />
            <Route path="numbers" element={<NumbersListPage />} />
            <Route
              path="numbers/available"
              element={<NumbersListPage defaultStatus="Available" />}
            />
            <Route
              path="numbers/reserved"
              element={<NumbersListPage defaultStatus="Reserved" />}
            />
            <Route
              path="numbers/sold"
              element={<NumbersListPage defaultStatus="Sold" />}
            />
            <Route path="sales-history" element={<SalesHistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
