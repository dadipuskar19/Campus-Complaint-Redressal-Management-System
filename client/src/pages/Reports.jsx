import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth, API_URL } from '../context/AuthContext';
import { 
  FileSpreadsheet, FileText, Download, Calendar, 
  Filter, AlertCircle, ShieldAlert 
} from 'lucide-react';

const Reports = () => {
  const { token, user } = useAuth();

  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [date, setDate] = useState('');

  const departmentsList = ['CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL', 'MCA', 'MBA', 'AI&DS', 'CS', 'General'];

  // Construct filtered report download urls
  const getDownloadUrl = (format) => {
    let base = `${API_URL}/complaints/reports/${format}?token=${token}`;
    if (category) base += `&category=${category}`;
    if (priority) base += `&priority=${priority}`;
    if (status) base += `&status=${status}`;
    if (department) base += `&department=${department}`;
    if (date) base += `&date=${date}`;
    return base;
  };

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="max-w-md mx-auto glass-panel p-6 rounded-2xl border border-red-500/20 text-center space-y-4">
          <ShieldAlert className="text-vignan-red mx-auto" size={32} />
          <h2 className="font-extrabold text-slate-900 dark:text-white">Access Denied</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Reports and analytics generation are restricted to administrators.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 text-left animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Reports & Logbooks</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate and export official records of grievances in Excel sheet formats or printed PDF books.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Filters Card */}
          <div className="md:col-span-1 glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
              <Filter size={14} /> Filter Dataset
            </h3>

            {/* Category Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-vignan-blue dark:text-white"
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
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Student Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-2.5 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-vignan-blue dark:text-white"
              >
                <option value="">All Departments</option>
                {departmentsList.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-2.5 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-vignan-blue dark:text-white"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-vignan-blue dark:text-white"
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

            {/* Specific Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <Calendar size={10} /> Specific Date
              </label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-vignan-blue dark:text-white"
              />
            </div>
          </div>

          {/* Download cards */}
          <div className="md:col-span-2 space-y-4">
            {/* Excel Card */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:border-emerald-500/30 transition-all">
              <div className="text-left space-y-1">
                <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                  <FileSpreadsheet size={20} />
                </div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white mt-3">Export MS Excel Spreadsheet</h4>
                <p className="text-[10px] text-slate-400 leading-normal max-w-sm">
                  Downloads an active `.xlsx` sheet packed with full columns (Complaint IDs, Student registration info, details, status track, dates, and ratings).
                </p>
              </div>
              <a 
                href={getDownloadUrl('excel')}
                download="vignan_complaints_report.xlsx"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 shrink-0"
              >
                <Download size={14} /> Export Excel
              </a>
            </div>

            {/* PDF Card */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:border-vignan-red/30 transition-all">
              <div className="text-left space-y-1">
                <div className="h-10 w-10 bg-vignan-red/10 text-vignan-red rounded-xl flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white mt-3">Export PDF Document Logbook</h4>
                <p className="text-[10px] text-slate-400 leading-normal max-w-sm">
                  Creates a formatted PDF report suitable for administrative reviews and meetings. Lists descriptions, details, dates, and Remarks.
                </p>
              </div>
              <a 
                href={getDownloadUrl('pdf')}
                download="vignan_complaints_logbook.pdf"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-vignan-red hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 shrink-0"
              >
                <Download size={14} /> Export PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
