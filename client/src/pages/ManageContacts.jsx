import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  PhoneCall, Phone, Mail, Clock, Plus, Edit, 
  Trash2, X, Check, Save, AlertCircle, ShieldCheck 
} from 'lucide-react';

const ManageContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals Toggles
  const [editingContact, setEditingContact] = useState(null);
  const [addingContact, setAddingContact] = useState(false);

  // Form states
  const [form, setForm] = useState({
    name: '',
    head: '',
    email: '',
    phone: '',
    availability: '9:00 AM - 5:00 PM'
  });

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/departments');
      setContacts(res.data);
    } catch (err) {
      setError('Failed to fetch departments contact directory.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleEditClick = (c) => {
    setEditingContact(c);
    setForm({
      name: c.name,
      head: c.head,
      email: c.email,
      phone: c.phone || '',
      availability: c.availability || '9:00 AM - 5:00 PM'
    });
  };

  const handleAddClick = () => {
    setAddingContact(true);
    setForm({
      name: '',
      head: '',
      email: '',
      phone: '',
      availability: '9:00 AM - 5:00 PM'
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingContact) {
        // Edit PUT
        await axios.put(`http://localhost:5000/api/departments/${editingContact._id}`, form);
        setSuccess(`Helpline for ${form.name} updated successfully!`);
        setEditingContact(null);
      } else {
        // Add POST
        await axios.post('http://localhost:5000/api/departments', form);
        setSuccess(`New contact ${form.name} added successfully!`);
        setAddingContact(false);
      }
      fetchContacts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save helpline contact details.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove the contact card for the ${name} Department?`)) {
      setError('');
      setSuccess('');
      try {
        await axios.delete(`http://localhost:5000/api/departments/${id}`);
        setSuccess(`Helpline contact card removed.`);
        fetchContacts();
      } catch (err) {
        setError('Failed to delete department contact.');
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 text-left animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <PhoneCall className="text-vignan-red" /> Helpline & Contact Registry
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Campus Administration Portal • Create or edit emergency contacts directory displayed to students.
            </p>
          </div>
          <button 
            onClick={handleAddClick}
            className="px-4 py-2.5 bg-gradient-to-r from-vignan-blue to-vignan-blue/90 hover:shadow-md transition-all rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 w-fit"
          >
            <Plus size={16} /> Add Contact Card
          </button>
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

        {/* Contacts Cards Directory Grid */}
        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <span className="inline-block h-6 w-6 border-2 border-vignan-blue border-t-transparent rounded-full animate-spin"></span>
            <span>Loading contact list...</span>
          </div>
        ) : contacts.length === 0 ? (
          <div className="glass-panel p-8 text-center text-xs text-slate-400">No departments or helpline contacts registered in the system.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((c) => (
              <div key={c._id} className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow flex flex-col justify-between relative group hover:border-vignan-blue/20 transition-all">
                
                {/* Admin actions overlay */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button 
                    onClick={() => handleEditClick(c)}
                    className="p-1 bg-slate-100 hover:bg-vignan-blue dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-white rounded transition-colors"
                    title="Edit Contact"
                  >
                    <Edit size={10} />
                  </button>
                  <button 
                    onClick={() => handleDelete(c._id, c.name)}
                    className="p-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded transition-colors"
                    title="Delete Contact"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-extrabold tracking-wider text-vignan-blue dark:text-sky-400">
                    {c.name} Department
                  </span>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-1 pr-12">
                    {c.head}
                  </h4>
                  
                  <div className="space-y-2 mt-4 text-xs">
                    {c.phone && (
                      <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span>{c.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                      <Mail size={13} className="text-slate-400 shrink-0" />
                      <span className="break-all">{c.email}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700/50 mt-4 pt-3 flex items-center gap-2 text-[10px] text-slate-400">
                  <Clock size={12} />
                  <span>{c.availability || '9:00 AM - 5:00 PM'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit/Add Contact Modal Dialog */}
        {(editingContact || addingContact) && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-150 text-left">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {editingContact ? 'Edit Department Contact' : 'Register New Contact Card'}
                </h3>
                <button onClick={() => { setEditingContact(null); setAddingContact(false); }} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Department / Contact Group Name</label>
                  <input 
                    type="text" 
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. WiFi & IT, Security, Hostel Warden"
                    disabled={!!editingContact} // Prevent editing name as it connects categories
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-xs outline-none dark:text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Contact Officer Name / Head</label>
                  <input 
                    type="text" 
                    value={form.head}
                    onChange={(e) => setForm({ ...form, head: e.target.value })}
                    placeholder="e.g. Dr. K. Rao"
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-xs outline-none dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Helpline Email Address</label>
                  <input 
                    type="email" 
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. warden@vignan.edu"
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-xs outline-none dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Helpline Phone / Ext</label>
                  <input 
                    type="text" 
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +91 89127 55222"
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-xs outline-none dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Availability Window</label>
                  <input 
                    type="text" 
                    value={form.availability}
                    onChange={(e) => setForm({ ...form, availability: e.target.value })}
                    placeholder="e.g. 24/7 Helpline, 9:00 AM - 5:00 PM"
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-xs outline-none dark:text-white"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-700">
                  <button type="button" onClick={() => { setEditingContact(null); setAddingContact(false); }} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-xl font-bold">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-vignan-blue text-white rounded-xl font-bold flex items-center gap-1 shadow"><Save size={12} /> Save Contact</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default ManageContacts;
