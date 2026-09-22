import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { authApi } from '../../api/auth';
import { User, Lock, Check, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setSavingProfile(true);
    try {
      const res = await authApi.updateProfile({ firstName, lastName, phone });
      if (res.data.success && res.data.data) {
        updateUser(res.data.data);
        setProfileMsg('Profile updated successfully');
      }
    } catch (err: any) {
      setProfileErr(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');

    if (newPassword !== confirmPassword) {
      setPasswordErr('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setPasswordMsg('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordErr(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Account Settings & Profile"
        subtitle="Manage personal contact details and password credentials."
      />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="font-semibold text-base text-text flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Profile Details
          </h3>

          {profileMsg && (
            <div className="p-3 bg-green-50 text-green-800 border border-green-200 rounded text-xs flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-600" /> {profileMsg}
            </div>
          )}
          {profileErr && (
            <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" /> {profileErr}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-text-muted mb-1">Email Address (Read-only)</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full h-9 px-3 bg-gray-50 border border-border rounded text-text-muted cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-muted mb-1">Assigned Role</label>
              <input
                type="text"
                value={user?.role || ''}
                disabled
                className="w-full h-9 px-3 bg-gray-50 border border-border rounded font-bold text-primary cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-muted mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-9 px-3 bg-background border border-border rounded text-xs focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-text-muted mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-9 px-3 bg-background border border-border rounded text-xs focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-text-muted mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full h-9 px-3 bg-background border border-border rounded text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-primary-dark disabled:opacity-50 mt-2"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="font-semibold text-base text-text flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" /> Security & Password
          </h3>

          {passwordMsg && (
            <div className="p-3 bg-green-50 text-green-800 border border-green-200 rounded text-xs flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-600" /> {passwordMsg}
            </div>
          )}
          {passwordErr && (
            <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" /> {passwordErr}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-text-muted mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-9 px-3 bg-background border border-border rounded text-xs focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-text-muted mb-1">New Password (min 8 chars)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-9 px-3 bg-background border border-border rounded text-xs focus:outline-none"
                minLength={8}
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-text-muted mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-9 px-3 bg-background border border-border rounded text-xs focus:outline-none"
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2 bg-charcoal text-white text-xs font-semibold rounded hover:bg-gray-800 disabled:opacity-50 mt-2"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
