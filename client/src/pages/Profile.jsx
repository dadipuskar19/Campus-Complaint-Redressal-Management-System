import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ShieldCheck, User, Mail, BookOpen, Phone, Upload, AlertCircle, Bookmark } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [rollNumber, setRollNumber] = useState(user?.rollNumber || '');
  const [photo, setPhoto] = useState(user?.photo || '');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

  const departmentsList = [
    'CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL', 'MCA', 'MBA', 'AI&DS', 'CS', 'General'
  ];

  // Fetch student specific counts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/complaints/analytics/stats');
        setStats({
          total: res.data.stats.total,
          pending: res.data.stats.pending,
          resolved: res.data.stats.resolved
        });
      } catch (err) {
        console.error('Error fetching profile stats:', err);
      }
    };
    fetchStats();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const res = await updateProfile({ name, phone, department, rollNumber, photo });
    setLoading(false);

    if (res.success) {
      setSuccess('Profile updated successfully!');
    } else {
      setError(res.error);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Photo size must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 text-left animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Your Profile</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Keep your profile details up-to-date for direct communications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats & Photo side */}
          <div className="md:col-span-1 space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center text-center">
              {/* Photo box */}
              <div className="relative group">
                <img 
                  src={photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'V')}`}
                  alt="Profile Avatar"
                  className="h-28 w-28 rounded-full border border-slate-200 dark:border-slate-700 object-cover bg-white"
                />
                <label className="absolute bottom-1 right-1 p-2 bg-vignan-blue text-white rounded-full cursor-pointer hover:scale-105 transition-transform shadow-md">
                  <Upload size={14} />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                    className="hidden" 
                  />
                </label>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-4">{name}</h3>
              <span className="text-xs text-slate-400 capitalize">{user?.role} Portal User</span>
              
              {/* Join date */}
              <div className="text-[10px] text-slate-450 dark:text-slate-500 mt-2">
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </div>
            </div>

            {/* Compact statistics */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col">
                <span className="text-lg font-black text-vignan-blue">{stats.total}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Total</span>
              </div>
              <div className="flex flex-col border-x border-slate-100 dark:border-slate-750">
                <span className="text-lg font-black text-vignan-red">{stats.pending}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Pending</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-emerald-500">{stats.resolved}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Resolved</span>
              </div>
            </div>
          </div>

          {/* Details Form Card */}
          <div className="md:col-span-2">
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <User size={16} className="text-vignan-blue" /> Personal Registration Details
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

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue outline-none transition-all dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Email Address (Read-only)
                    </label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={user?.email || ''}
                        disabled
                        className="w-full pl-3 pr-10 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none dark:text-slate-400 cursor-not-allowed"
                      />
                      <Mail className="absolute right-3 top-3 text-slate-400" size={16} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Department
                    </label>
                    <select 
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue outline-none transition-all dark:text-white"
                    >
                      {departmentsList.map(d => (
                        <option key={d} value={d} className="dark:bg-slate-800">{d}</option>
                      ))}
                    </select>
                  </div>

                  {user?.role === 'student' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Roll Number
                      </label>
                      <input 
                        type="text" 
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue outline-none transition-all dark:text-white"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Portal Status
                      </label>
                      <input 
                        type="text" 
                        value="Authorized Administrator"
                        disabled
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none dark:text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10 digit number"
                      className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue outline-none transition-all dark:text-white"
                    />
                    <Phone className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-to-r from-vignan-blue to-vignan-blue/90 hover:shadow-md transition-all rounded-xl text-white font-bold text-xs disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Update Details'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
