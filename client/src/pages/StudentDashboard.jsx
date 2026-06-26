import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  FileText, Clock, CheckCircle2, AlertCircle, 
  FilePlus, History, User, Settings, ArrowRight, Star
} from 'lucide-react';

const COLORS = ['#e11d48', '#f59e0b', '#3b82f6', '#0c59a3', '#10b981', '#6b7280'];

const StudentDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await axios.get('http://localhost:5000/api/complaints/analytics/stats');
      setStats(statsRes.data);

      // Fetch recent complaints
      const compRes = await axios.get('http://localhost:5000/api/complaints?limit=5');
      setComplaints(compRes.data.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !stats) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col gap-6 justify-center items-center h-[60vh]">
          <div className="h-10 w-10 border-4 border-vignan-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">{t('loading')}</span>
        </div>
      </Layout>
    );
  }

  // Map Priority Badges
  const getPriorityBadge = (prio) => {
    const styles = {
      Emergency: 'bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400',
      High: 'bg-orange-500/10 border-orange-500/20 text-orange-500 dark:text-orange-400',
      Medium: 'bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400',
      Low: 'bg-slate-500/10 border-slate-500/20 text-slate-500 dark:text-slate-400',
    };
    return (
      <span className={`px-2 py-0.5 border rounded-lg text-[10px] font-bold uppercase tracking-wider ${styles[prio] || styles.Low}`}>
        {prio}
      </span>
    );
  };

  // Map Status Badges
  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
      'Under Review': 'bg-violet-500/15 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
      Assigned: 'bg-sky-500/15 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
      'In Progress': 'bg-blue-500/15 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
      Resolved: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
      Rejected: 'bg-rose-500/15 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${styles[status] || 'bg-slate-100 text-slate-650'}`}>
        {status}
      </span>
    );
  };

  return (
    <Layout>
      <div className="space-y-6 text-left animate-in fade-in duration-300">
        
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {t('welcome')}, {user?.name} 👋
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Roll No: {user?.rollNumber} • Dept: {user?.department || 'General'}
            </p>
          </div>
          <Link 
            to="/submit"
            className="px-5 py-2.5 bg-gradient-to-r from-vignan-blue to-vignan-blue/90 hover:shadow-lg transition-all rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 w-fit"
          >
            <FilePlus size={16} /> {t('newComplaint')}
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow flex items-center gap-4">
            <div className="p-3 bg-vignan-blue/10 dark:bg-vignan-blue/20 text-vignan-blue dark:text-sky-400 rounded-xl">
              <FileText size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('totalComplaints')}</span>
              <span className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{stats.stats.total}</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-xl">
              <Clock size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('pending')}</span>
              <span className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{stats.stats.pending}</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('resolved')}</span>
              <span className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{stats.stats.resolved}</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow flex items-center gap-4">
            <div className="p-3 bg-violet-500/10 dark:bg-violet-500/20 text-violet-500 rounded-xl">
              <AlertCircle size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('underReview')}</span>
              <span className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{stats.stats.underReview}</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart: Status distribution */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Grievance Status Breakdown</h3>
            <div className="h-64 flex items-center justify-center">
              {stats.statusChartData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.statusChartData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.statusChartData.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-xs text-slate-400">No active complaints found</span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-3 text-[10px] font-semibold text-slate-500">
              {stats.statusChartData.filter(d => d.value > 0).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart: Monthly trends */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Monthly Submission History</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyChartData}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                  <Bar dataKey="count" fill="#0c59a3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Complaints Table */}
        <div className="glass-panel rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-750 flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{t('recentComplaints')}</h3>
            <Link 
              to="/history"
              className="text-xs font-bold text-vignan-blue dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              See All History <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {complaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                You haven't filed any complaints yet. Click "File New Complaint" to get started.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/50 dark:bg-slate-800/40 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Title</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                  {complaints.map(c => (
                    <tr key={c._id} className="hover:bg-slate-100/35 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-500">{c.complaintId}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                        {c.title}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{c.category}</td>
                      <td className="px-5 py-3.5">{getPriorityBadge(c.priority)}</td>
                      <td className="px-5 py-3.5">{getStatusBadge(c.status)}</td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button 
                          onClick={() => navigate(`/complaints/${c._id}`)}
                          className="px-3 py-1 bg-slate-200/50 dark:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold hover:bg-vignan-blue hover:text-white dark:hover:bg-vignan-blue dark:hover:text-white rounded-lg transition-colors text-[10px]"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Help Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/about" className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-1 hover:border-vignan-blue/35 transition-colors">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Learn how we resolve issues</span>
            <p className="text-[10px] text-slate-400 leading-relaxed">Read about category escalations and resolving periods</p>
          </Link>
          <Link to="/contact" className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-1 hover:border-vignan-blue/35 transition-colors">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Direct Office Helplines</span>
            <p className="text-[10px] text-slate-400 leading-relaxed">Access names and telephone numbers of wardens & heads</p>
          </Link>
          <Link to="/settings" className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-1 hover:border-vignan-blue/35 transition-colors">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Notification & Language Settings</span>
            <p className="text-[10px] text-slate-400 leading-relaxed">Switch translation keys to Telugu or Hindi and configure alerts</p>
          </Link>
        </div>

      </div>
    </Layout>
  );
};

export default StudentDashboard;
