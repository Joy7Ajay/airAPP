import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const Settings = () => {
  const { user, token } = useOutletContext();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const avatarInputRef = useRef(null);

  // Profile settings
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '+256 700 000 000',
    location: 'Kampala, Uganda',
    department: 'Administration',
    role: 'Administrator',
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactor: true,
    loginAlerts: true,
    sessionTimeout: '30',
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'dark',
    language: 'en',
    timezone: 'Africa/Kampala',
    dateFormat: 'DD/MM/YYYY',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          if (data.user) {
            setProfile((prev) => ({
              ...prev,
              fullName: data.user.full_name || prev.fullName,
              email: data.user.email || prev.email,
              phone: data.user.phone || prev.phone,
              location: data.user.location || prev.location,
              department: data.user.department || prev.department,
            }));
          }
          if (data.settings) {
            setSecurity((prev) => ({
              ...prev,
              twoFactor: data.settings.two_factor === 1,
              loginAlerts: data.settings.login_alerts === 1,
              sessionTimeout: data.settings.session_timeout || prev.sessionTimeout,
            }));
            setAppearance((prev) => ({
              ...prev,
              theme: data.settings.theme || prev.theme,
              language: data.settings.language || prev.language,
              timezone: data.settings.timezone || prev.timezone,
              dateFormat: data.settings.date_format || prev.dateFormat,
            }));
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, [token]);

  const handleProfileSave = async () => {
    setIsLoading(true);
    setSaveStatus('');
    
    try {
      const res = await fetch(`${API_URL}/settings/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          department: profile.department,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed');
      setSaveStatus('Profile updated successfully!');
    } catch (error) {
      console.error('Profile save error:', error);
      setSaveStatus('Unable to save profile.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleProfileCancel = async () => {
    setSaveStatus('');
    try {
      const res = await fetch(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setProfile((prev) => ({
          ...prev,
          fullName: data.user.full_name || prev.fullName,
          email: data.user.email || prev.email,
          phone: data.user.phone || prev.phone,
          location: data.user.location || prev.location,
          department: data.user.department || prev.department,
        }));
      }
    } catch (error) {
      console.error('Profile reset error:', error);
    }
  };

  const handleSecurityChange = async (nextSecurity) => {
    setSecurity(nextSecurity);
    try {
      await fetch(`${API_URL}/settings/security`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextSecurity),
      });
    } catch (error) {
      console.error('Security update error:', error);
    }
  };

  const handleAppearanceChange = async (nextAppearance) => {
    setAppearance(nextAppearance);
    try {
      await fetch(`${API_URL}/settings/appearance`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextAppearance),
      });
    } catch (error) {
      console.error('Appearance update error:', error);
    }
  };

  const handlePasswordUpdate = async () => {
    setPasswordStatus('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus('New passwords do not match.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/settings/password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setPasswordStatus('Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Password update error:', error);
      setPasswordStatus(error.message || 'Unable to update password.');
    } finally {
      setTimeout(() => setPasswordStatus(''), 3000);
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch(`${API_URL}/settings/avatar`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: reader.result }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload failed');
        setSaveStatus('Avatar updated successfully!');
      } catch (error) {
        console.error('Avatar upload error:', error);
        setSaveStatus('Unable to update avatar.');
      } finally {
        setTimeout(() => setSaveStatus(''), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarRemove = async () => {
    try {
      const res = await fetch(`${API_URL}/settings/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Remove failed');
      setSaveStatus('Avatar removed.');
    } catch (error) {
      console.error('Avatar remove error:', error);
      setSaveStatus('Unable to remove avatar.');
    } finally {
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: '👤' },
    { id: 'security', label: 'Security Settings', icon: '🔒' },
    { id: 'appearance', label: 'Appearance and Billing', icon: '🎨' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            Settings
          </h1>
          <p className="text-slate-400 mt-1">Manage your profile, preferences, and system configurations.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-800 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Settings Tab */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">Profile Settings</h2>
            <p className="text-slate-400 text-sm mt-1">Manage your account information</p>
          </div>

          <div className="p-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-800">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {profile.fullName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">{profile.fullName}</h3>
                <p className="text-slate-400 text-sm">{profile.email}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Change Avatar
                  </button>
                  <button
                    onClick={handleAvatarRemove}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    Remove
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                  />
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                <input
                  type="text"
                  value={profile.role}
                  disabled
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
              {saveStatus && (
                <span className="text-green-400 text-sm">{saveStatus}</span>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={handleProfileCancel}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileSave}
                  disabled={isLoading}
                  className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Two-Factor Authentication</h3>
                <p className="text-slate-400 text-sm mt-1">Add an extra layer of security to your account</p>
              </div>
              <button
                onClick={() => handleSecurityChange({ ...security, twoFactor: !security.twoFactor })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  security.twoFactor ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    security.twoFactor ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Login Alerts */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Login Alerts</h3>
                <p className="text-slate-400 text-sm mt-1">Get notified when someone logs into your account</p>
              </div>
              <button
                onClick={() => handleSecurityChange({ ...security, loginAlerts: !security.loginAlerts })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  security.loginAlerts ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    security.loginAlerts ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Session Timeout */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-white font-semibold mb-4">Session Timeout</h3>
            <p className="text-slate-400 text-sm mb-4">Automatically log out after inactivity</p>
            <select
              value={security.sessionTimeout}
              onChange={(e) => handleSecurityChange({ ...security, sessionTimeout: e.target.value })}
              className="w-full md:w-64 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="never">Never</option>
            </select>
          </div>

          {/* Change Password */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-white font-semibold mb-4">Change Password</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              {passwordStatus && <p className="text-xs text-cyan-400">{passwordStatus}</p>}
              <button
                onClick={handlePasswordUpdate}
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appearance Settings Tab */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Theme */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-white font-semibold mb-4">Theme</h3>
            <div className="flex gap-4">
              {['dark', 'light', 'system'].map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleAppearanceChange({ ...appearance, theme })}
                  className={`flex-1 p-4 rounded-xl border transition-all ${
                    appearance.theme === theme
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className={`w-full h-20 rounded-lg mb-3 ${
                    theme === 'dark' ? 'bg-slate-800' :
                    theme === 'light' ? 'bg-slate-200' :
                    'bg-gradient-to-r from-slate-800 to-slate-200'
                  }`} />
                  <span className="text-white font-medium capitalize">{theme}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language & Region */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-white font-semibold mb-4">Language & Region</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
                <select
                  value={appearance.language}
                  onChange={(e) => handleAppearanceChange({ ...appearance, language: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Timezone</label>
                <select
                  value={appearance.timezone}
                  onChange={(e) => handleAppearanceChange({ ...appearance, timezone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="Africa/Kampala">Africa/Kampala (UTC+3)</option>
                  <option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Date Format</label>
                <select
                  value={appearance.dateFormat}
                  onChange={(e) => handleAppearanceChange({ ...appearance, dateFormat: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Billing (Placeholder) */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-white font-semibold mb-4">Billing & Subscription</h3>
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-6 border border-cyan-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-400 font-semibold text-lg">Enterprise Plan</p>
                  <p className="text-slate-400 text-sm">Unlimited access to all features</p>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-sm">Next billing date: March 1, 2026</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
