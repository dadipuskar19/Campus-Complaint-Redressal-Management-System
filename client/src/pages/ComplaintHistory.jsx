import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { Search, Filter, Calendar, AlertCircle, ArrowRight } from 'lucide-react';

const ComplaintHistory = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      let query = `?search=${search}`;
      if (category) query += `&category=${category}`;
      if (priority) query += `&priority=${priority}`;
      if (status) query += `&status=${status}`;

      const res = await axios.get(`http://localhost:5000/api/complaints${query}`);
      setComplaints(res.data);
    } catch (err) {
      setError('Failed to fetch complaints history.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [search, category, priority, status]);

  // Priority badge formatter
  const getPriorityBadge = (prio) => {
    const styles = {
      Emergency: 'bg-red-500/10 border-red-500/20 text-red-500',
      High: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
      Medium: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
      Low: 'bg-slate-500/10 border-slate-500/20 text-slate-500',
    };
    return (
      <span className={`px-2 py-0.5 border rounded-lg text-[9px] font-black uppercase tracking-wider ${styles[prio] || styles.Low}`}>
        {prio}
      </span>
    );
  };

  // Status badge formatter
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
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${styles[status] || 'bg-slate-100 text-slate-650'}`}>
        {status}
      </span>
    );
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 text-left animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Grievance Logs & History</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {user?.role === 'admin' 
              ? 'Global registry of all student grievances submitted to the Vignan portal.'
              : 'Search and inspect history of your submitted complaints and their tracking timelines.'}
          </p>
        </div>

        {/* Filters Toolbar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, title, or details..."
              className="w-full pl-9 pr-4 py-2 bg-white/60 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-750 rounded-xl text-xs focus:ring-1 focus:ring-vignan-blue outline-none transition-all dark:text-white"
            />
            <Search className="absolute left-3 top-3 text-slate-400" size={14} />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-2.5 py-2 bg-white/60 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-750 rounded-xl text-xs outline-none focus:ring-1 focus:ring-vignan-blue dark:text-slate-200"
            >
              <option value="">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Hostel">Hostel</option>
              <option value="Transport">Transport</option>
              <option value="Library">Library</option>
              <option value="Examination">Examination</option>
              <option value="Fees">Fees</option>
              <option value="WiFi">WiFi</option>
              <option value="Electrical">Electrical</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Cafeteria">Cafeteria</option>
              <option value="Security">Security</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Others">Others</option>
            </select>

            {/* Priority */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-2.5 py-2 bg-white/60 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-750 rounded-xl text-xs outline-none focus:ring-1 focus:ring-vignan-blue dark:text-slate-200"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Emergency">Emergency</option>
            </select>

            {/* Status */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-2.5 py-2 bg-white/60 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-750 rounded-xl text-xs outline-none focus:ring-1 focus:ring-vignan-blue dark:text-slate-200"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Complaints List Table */}
        <div className="glass-panel rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
                <div className="h-6 w-6 border-2 border-vignan-blue border-t-transparent rounded-full animate-spin"></div>
                <span>Filtering logs...</span>
              </div>
            ) : complaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No complaints found matching selected filter choices.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/50 dark:bg-slate-800/40 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5">ID</th>
                    {user?.role === 'admin' && <th className="px-5 py-3.5">Student</th>}
                    <th className="px-5 py-3.5">Title</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Priority</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                  {complaints.map(c => (
                    <tr key={c._id} className="hover:bg-slate-100/35 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-500">{c.complaintId}</td>
                      {user?.role === 'admin' && (
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-semibold">
                          {c.isAnonymous ? 'Anonymous' : c.student?.name}
                        </td>
                      )}
                      <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {c.title}
                      </td>
                      <td className="px-5 py-4 text-slate-500">{c.category}</td>
                      <td className="px-5 py-4">{getPriorityBadge(c.priority)}</td>
                      <td className="px-5 py-4">{getStatusBadge(c.status)}</td>
                      <td className="px-5 py-4 text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/complaints/${c._id}`)}
                          className="px-3 py-1.5 bg-slate-200/50 hover:bg-vignan-blue hover:text-white dark:bg-slate-750 dark:hover:bg-vignan-blue dark:hover:text-white rounded-lg transition-colors font-bold"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default ComplaintHistory;
