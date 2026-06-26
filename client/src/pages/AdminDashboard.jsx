import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, FileText, Clock, CheckCircle2, ShieldAlert,
  Search, Filter, Trash2, Check, UserCheck, RefreshCw, XCircle
} from 'lucide-react';

const COLORS = ['#e11d48', '#f59e0b', '#0c59a3', '#10b981', '#6b7280', '#8b5cf6'];

const AdminDashboard = () => {
  const { socket } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Department heads overview
  const departmentsList = ['CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL', 'MCA', 'MBA', 'AI&DS', 'CS', 'General'];

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await axios.get('http://localhost:5000/api/complaints/analytics/stats');
      setStats(statsRes.data);

      // Fetch complaints with active query filters
      let queryStr = `?search=${searchQuery}`;
      if (categoryFilter) queryStr += `&category=${categoryFilter}`;
      if (priorityFilter) queryStr += `&priority=${priorityFilter}`;
      if (statusFilter) queryStr += `&status=${statusFilter}`;
      if (deptFilter) queryStr += `&department=${deptFilter}`;

      const compRes = await axios.get(`http://localhost:5000/api/complaints${queryStr}`);
      setComplaints(compRes.data);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [categoryFilter, priorityFilter, statusFilter, deptFilter, searchQuery]);

  // Set up socket listener for live dashboard refreshes
  useEffect(() => {
    if (socket) {
      socket.on('admin-new-complaint', (newComp) => {
        // Append to local list
        setComplaints(prev => [newComp, ...prev]);
        // Re-trigger stats fetch
        axios.get('http://localhost:5000/api/complaints/analytics/stats').then(res => setStats(res.data));
      });

      socket.on('dashboard-refresh', () => {
        fetchAdminData();
      });

      return () => {
        socket.off('admin-new-complaint');
        socket.off('dashboard-refresh');
      };
    }
  }, [socket]);

  // Admin Quick Resolvers
  const handleQuickStatusUpdate = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}/status`, {
        status,
        adminRemarks: `Quick status update to ${status} by administrator.`
      });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Delete fake complaints
  const handleDeleteComplaint = async (id) => {
    if (window.confirm('Are you sure you want to delete this complaint as fake/spam?')) {
      try {
        await axios.delete(`http://localhost:5000/api/complaints/${id}`);
        fetchAdminData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading && !stats) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col gap-6 justify-center items-center h-[60vh]">
          <div className="h-10 w-10 border-4 border-vignan-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">Loading Administrator Panels...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 text-left animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Admin Control Room</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              System Administration • Global Grievance Management
            </p>
          </div>
          <button 
            onClick={fetchAdminData}
            className="p-2.5 bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-bold w-fit"
          >
            <RefreshCw size={14} /> Refresh Board
          </button>
        </div>

        {/* Admin Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="glass-panel p-4.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-3">
              <div className="p-2.5 bg-vignan-blue/15 text-vignan-blue rounded-xl shrink-0">
                <Users size={18} />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Users</span>
                <span className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{stats.stats.totalUsers}</span>
              </div>
            </div>

            <div className="glass-panel p-4.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/15 text-indigo-500 rounded-xl shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Complaints</span>
                <span className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{stats.stats.total}</span>
              </div>
            </div>

            <div className="glass-panel p-4.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/15 text-amber-500 rounded-xl shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Pending</span>
                <span className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{stats.stats.pending}</span>
              </div>
            </div>

            <div className="glass-panel p-4.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/15 text-emerald-500 rounded-xl shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Resolved</span>
                <span className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{stats.stats.resolved}</span>
              </div>
            </div>

            <div className="glass-panel p-4.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/15 text-rose-500 rounded-xl shrink-0">
                <ShieldAlert size={18} />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">High Priority</span>
                <span className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{stats.stats.highPriority}</span>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Charts */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department distribution */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow lg:col-span-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Department workload metrics</h3>
              <div className="h-64">
                {stats.deptChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.deptChartData}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                      <Bar dataKey="count" fill="#0c59a3" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">No data available</div>
                )}
              </div>
            </div>

            {/* Status distribution */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow lg:col-span-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Overall distribution</h3>
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
                  <span className="text-xs text-slate-400">No active complaints</span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-1 justify-center text-[9px] font-semibold text-slate-400">
                {stats.statusChartData.filter(d => d.value > 0).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Filter Toolbar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, title, or student..."
              className="w-full pl-9 pr-4 py-2 bg-white/60 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-750 rounded-xl text-xs focus:ring-1 focus:ring-vignan-blue outline-none transition-all dark:text-white"
            />
            <Search className="absolute left-3 top-3 text-slate-400" size={14} />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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

            {/* Department filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-2.5 py-2 bg-white/60 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-750 rounded-xl text-xs outline-none focus:ring-1 focus:ring-vignan-blue dark:text-slate-200"
            >
              <option value="">All Departments</option>
              {departmentsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-2 bg-white/60 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-750 rounded-xl text-xs outline-none focus:ring-1 focus:ring-vignan-blue dark:text-slate-200"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
        </div>

        {/* Complaints Admin Table */}
        <div className="glass-panel rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow overflow-hidden">
          <div className="overflow-x-auto">
            {complaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No matching complaints found on the portal.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/50 dark:bg-slate-800/40 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-5 py-3.5">Title</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Priority</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-center">Quick Action</th>
                    <th className="px-5 py-3.5 text-right">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                  {complaints.map(c => (
                    <tr key={c._id} className="hover:bg-slate-100/35 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-500">{c.complaintId}</td>
                      <td className="px-5 py-4 text-slate-700 dark:text-slate-350">
                        {c.isAnonymous ? (
                          <span className="font-semibold italic text-slate-400">Anonymous</span>
                        ) : (
                          <div>
                            <span className="font-semibold block">{c.student?.name}</span>
                            <span className="text-[9px] text-slate-400 uppercase">{c.student?.rollNumber} • {c.student?.department}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                        {c.title}
                      </td>
                      <td className="px-5 py-4 text-slate-500">{c.category}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 border rounded-lg text-[9px] font-bold uppercase ${c.priority === 'Emergency' ? 'bg-red-500/10 border-red-500/20 text-red-500' : c.priority === 'High' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : c.priority === 'Medium' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-slate-500/10 border-slate-500/20 text-slate-500'}`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${c.status === 'Resolved' ? 'bg-emerald-500/15 text-emerald-600' : c.status === 'Rejected' ? 'bg-rose-500/15 text-rose-600' : 'bg-amber-500/15 text-amber-600'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {c.status !== 'Resolved' && (
                            <button 
                              onClick={() => handleQuickStatusUpdate(c._id, 'Resolved')}
                              className="p-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-md transition-all"
                              title="Mark Resolved"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          {c.status !== 'In Progress' && c.status !== 'Resolved' && (
                            <button 
                              onClick={() => handleQuickStatusUpdate(c._id, 'In Progress')}
                              className="p-1 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-md transition-all"
                              title="Set In Progress"
                            >
                              <UserCheck size={12} />
                            </button>
                          )}
                          {c.status !== 'Rejected' && c.status !== 'Resolved' && (
                            <button 
                              onClick={() => handleQuickStatusUpdate(c._id, 'Rejected')}
                              className="p-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-md transition-all"
                              title="Reject Complaint"
                            >
                              <XCircle size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/complaints/${c._id}`)}
                            className="px-2.5 py-1 bg-slate-200/50 hover:bg-vignan-blue hover:text-white dark:bg-slate-750 dark:hover:bg-vignan-blue rounded-md transition-all text-[10px] font-bold"
                          >
                            Manage
                          </button>
                          <button 
                            onClick={() => handleDeleteComplaint(c._id)}
                            className="p-1.5 text-slate-400 hover:text-vignan-red rounded-md hover:bg-red-500/10 transition-all"
                            title="Delete Fake Complaint"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
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

export default AdminDashboard;
