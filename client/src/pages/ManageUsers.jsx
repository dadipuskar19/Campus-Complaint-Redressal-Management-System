import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Users, Search, Filter, Edit, Trash2, ShieldCheck, 
  AlertCircle, X, Check, Save 
} from 'lucide-react';

const ManageUsers = () => {
  const { user } = useAuth();
  
  const [usersList, setUsersList] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    role: 'student',
    department: '',
    rollNumber: '',
    phone: ''
  });

  const departmentsList = ['CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL', 'MCA', 'MBA', 'AI&DS', 'CS', 'General'];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/auth/users');
      setUsersList(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      setError('Failed to fetch user database.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter application
  useEffect(() => {
    let result = usersList;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.rollNumber && u.rollNumber.toLowerCase().includes(q))
      );
    }

    if (roleFilter) {
      result = result.filter(u => u.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [search, roleFilter, usersList]);

  const handleEditClick = (u) => {
    setEditingUser(u);
    setEditForm({
      name: u.name,
      role: u.role,
      department: u.department || '',
      rollNumber: u.rollNumber || '',
      phone: u.phone || ''
    });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await axios.put(`http://localhost:5000/api/auth/users/${editingUser._id}`, editForm);
      setSuccess(`User ${editForm.name} updated successfully!`);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user details.');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the user account for ${name}? This action cannot be undone.`)) {
      setError('');
      setSuccess('');
      try {
        await axios.delete(`http://localhost:5000/api/auth/users/${id}`);
        setSuccess(`User account deleted.`);
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user.');
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 text-left animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="text-vignan-blue" /> User Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System Administration Portal • View and manage access roles for all campus students and faculty.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 dark:text-green-400 text-xs flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or roll number..."
              className="w-full pl-9 pr-4 py-2 bg-white/60 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-750 rounded-xl text-xs focus:ring-1 focus:ring-vignan-blue outline-none transition-all dark:text-white"
            />
            <Search className="absolute left-3 top-3 text-slate-400" size={14} />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-2 bg-white/60 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-750 rounded-xl text-xs outline-none focus:ring-1 focus:ring-vignan-blue dark:text-slate-200"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Table List */}
        <div className="glass-panel rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <span className="inline-block h-6 w-6 border-2 border-vignan-blue border-t-transparent rounded-full animate-spin"></span>
                <span>Loading registry...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No users found in system registry.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/50 dark:bg-slate-800/40 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Roll Number</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Phone</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                  {filteredUsers.map(u => (
                    <tr key={u._id} className="hover:bg-slate-100/35 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={u.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`} 
                            alt={u.name}
                            className="h-7 w-7 rounded-full border bg-white"
                          />
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${u.role === 'admin' ? 'bg-indigo-500/15 text-indigo-500' : 'bg-slate-500/15 text-slate-600 dark:text-slate-350'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-500">{u.rollNumber || 'N/A'}</td>
                      <td className="px-5 py-4 text-slate-500">{u.department || 'N/A'}</td>
                      <td className="px-5 py-4 text-slate-500">{u.phone || 'N/A'}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleEditClick(u)}
                            className="p-1.5 bg-slate-200/50 hover:bg-vignan-blue dark:bg-slate-750 dark:hover:bg-vignan-blue text-slate-600 dark:text-slate-300 hover:text-white rounded-md transition-all"
                            title="Edit User"
                          >
                            <Edit size={12} />
                          </button>
                          {/* Protect active user from self deletion */}
                          {user?._id !== u._id && (
                            <button 
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-md transition-all"
                              title="Delete User"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Edit User Modal Dialog */}
        {editingUser && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-150 text-left">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Modify User Access Details</h3>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>

              <form onSubmit={handleEditSave} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-xs outline-none dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Role Type</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-xs outline-none dark:text-white"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Department</label>
                    <select
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-xs outline-none dark:text-white"
                    >
                      {departmentsList.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {editForm.role === 'student' && (
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Roll Number</label>
                    <input 
                      type="text" 
                      value={editForm.rollNumber}
                      onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                      className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-xs outline-none dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-xs outline-none dark:text-white"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-700">
                  <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-xl font-bold">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-vignan-blue text-white rounded-xl font-bold flex items-center gap-1 shadow"><Save size={12} /> Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default ManageUsers;
