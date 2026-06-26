import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Moon, Sun, Globe, Bell, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Settings = () => {
  const { changePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { locale, changeLanguage, t } = useLanguage();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Local settings switches
  const [notifBrowser, setNotifBrowser] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const res = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError(res.error);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 text-left animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Settings & Customizations</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your credentials, theme options, and notifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Settings Nav/Side */}
          <div className="md:col-span-1 space-y-4">
            {/* Visual Quick Toggles */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Appearance</h3>
              
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Dark Mode</span>
                <button 
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${theme === 'dark' ? 'bg-vignan-blue' : 'bg-slate-300'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Language Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Default Language</span>
                <div className="grid grid-cols-3 gap-2">
                  {['en', 'hi', 'te'].map(l => (
                    <button
                      key={l}
                      onClick={() => changeLanguage(l)}
                      className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${locale === l ? 'bg-vignan-blue text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                    >
                      {l === 'en' ? 'EN' : l === 'hi' ? 'हिंदी' : 'తెలుగు'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notification settings */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notifications</h3>
              
              {/* Browser Alert Switch */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">In-App Popups</span>
                  <span className="text-[10px] text-slate-400">Real-time socket alerts</span>
                </div>
                <button 
                  onClick={() => setNotifBrowser(!notifBrowser)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${notifBrowser ? 'bg-vignan-blue' : 'bg-slate-300'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifBrowser ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Email Switch */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-750">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Alerts</span>
                  <span className="text-[10px] text-slate-400">SMTP mail on update</span>
                </div>
                <button 
                  onClick={() => setNotifEmail(!notifEmail)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${notifEmail ? 'bg-vignan-blue' : 'bg-slate-300'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifEmail ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Change Password Form Panel */}
          <div className="md:col-span-2">
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock size={16} className="text-vignan-red" /> Update Portal Password
              </h3>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 dark:text-green-400 text-xs flex items-center gap-2">
                  <ShieldCheck size={16} className="shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-10 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue outline-none transition-all dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue outline-none transition-all dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue outline-none transition-all dark:text-white"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-to-r from-vignan-blue to-vignan-blue/90 hover:shadow-md transition-all rounded-xl text-white font-bold text-xs disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Save Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
