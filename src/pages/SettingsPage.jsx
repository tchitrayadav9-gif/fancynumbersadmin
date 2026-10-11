import React, { useState } from 'react';
import { ShieldCheck, Database, Key, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function SettingsPage() {
  const { admin, refreshAdmin } = useAuth();

  // Profile state
  const [name, setName] = useState(admin?.name || 'Satyadeva Admin');
  const [supportContact, setSupportContact] = useState(admin?.supportContact || '8499955543');

  // Password reset state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Handle Profile Update (Name / Support Phone)
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setSavingProfile(true);

    try {
      const res = await api.patch('/auth/profile', {
        name,
        supportContact,
      });

      if (res.data.success) {
        setProfileSuccess('Profile information updated successfully!');
        refreshAdmin();
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Direct Password Reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    setResettingPassword(true);

    try {
      const res = await api.patch('/auth/profile', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setPasswordSuccess('Password has been reset successfully! Use your new password on future logins.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || 'Incorrect current password. Could not reset password.'
      );
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage administrator profile, reset admin password, and business contact information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Admin Profile Info</span>
            </h2>

            {profileSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Administrator Email (Locked)
                </label>
                <input
                  type="text"
                  disabled
                  value={admin?.email || 'satyadevatravellss@gmail.com'}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Business / Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Support Contact Phone
                </label>
                <input
                  type="text"
                  required
                  value={supportContact}
                  onChange={(e) => setSupportContact(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  {savingProfile ? 'Updating Profile...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Dedicated Reset Password Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2 mb-4">
              <Key className="w-5 h-5 text-emerald-600" />
              <span>Reset Admin Password</span>
            </h2>

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={resettingPassword}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resettingPassword ? 'animate-spin' : ''}`} />
                  <span>{resettingPassword ? 'Resetting...' : 'Reset Password Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
