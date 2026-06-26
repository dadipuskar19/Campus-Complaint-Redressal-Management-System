import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { 
  FileText, Calendar, MapPin, User, ChevronRight, 
  ArrowLeft, Download, ShieldCheck, Star, AlertCircle, RefreshCw 
} from 'lucide-react';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Rating feedback form
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [rateSuccess, setRateSuccess] = useState('');

  // Admin update fields
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/complaints/${id}`);
      setComplaint(res.data);
      setStatus(res.data.status);
      setAssignedTo(res.data.assignedTo || '');
      setAdminRemarks(res.data.adminRemarks || '');
    } catch (err) {
      setError('Failed to fetch complaint details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRateSuccess('');
    try {
      const res = await axios.put(`http://localhost:5000/api/complaints/${id}/rate`, { rating, feedback });
      setComplaint(res.data.complaint);
      setRateSuccess('Thank you for rating our resolution!');
    } catch (err) {
      setError('Failed to submit rating.');
    }
  };

  const handleAdminUpdateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAdminSuccess('');
    try {
      const res = await axios.put(`http://localhost:5000/api/complaints/${id}/status`, {
        status,
        assignedTo,
        adminRemarks
      });
      setComplaint(res.data.complaint);
      setAdminSuccess('Status updated and notification dispatched successfully!');
    } catch (err) {
      setError('Failed to update complaint status.');
    }
  };

  // Browser print layout trigger
  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col gap-6 justify-center items-center h-[60vh]">
          <div className="h-10 w-10 border-4 border-vignan-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">Fetching Complaint Logs...</span>
        </div>
      </Layout>
    );
  }

  if (error || !complaint || !complaint.complaintId) {
    return (
      <Layout>
        <div className="max-w-md mx-auto glass-panel p-6 rounded-2xl border border-red-500/20 text-center space-y-4">
          <AlertCircle className="text-vignan-red mx-auto" size={32} />
          <h2 className="font-extrabold text-slate-900 dark:text-white">Error Loading details</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error || 'Complaint not found.'}</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-vignan-blue text-white rounded-xl font-bold text-xs">
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  // Active status timeline list
  const statuses = ['Pending', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
  const currentStatusIndex = statuses.indexOf(complaint.status);
  const isRejected = complaint.status === 'Rejected';

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 text-left animate-in fade-in duration-300 print:bg-white print:p-0 print:text-black">
        
        {/* Print only Header */}
        <div className="hidden print:flex flex-col items-center border-b pb-4 mb-6">
          <img src="/logo.png" alt="Vignan Logo" className="h-12 w-auto bg-white p-0.5 rounded mb-2" />
          <h1 className="text-lg font-black uppercase text-center">Vignan's Institute of Information Technology</h1>
          <h2 className="text-sm font-bold text-center">Grievance Receipt - {complaint.complaintId}</h2>
        </div>

        {/* Back and actions toolbar */}
        <div className="flex justify-between items-center print:hidden">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft size={16} /> Back to history
          </button>
          
          <button 
            onClick={handlePrintReceipt}
            className="px-4 py-2 bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold w-fit"
          >
            <Download size={14} /> Download Receipt (PDF)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main details Panel */}
          <div className="lg:col-span-2 space-y-6 print:w-full">
            {/* Details Card */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow relative overflow-hidden">
              {/* Corner priority ribbon */}
              <div className={`absolute top-0 right-0 px-4 py-1 text-[9px] font-black uppercase rounded-bl-xl tracking-wider text-white ${complaint.priority === 'Emergency' ? 'bg-red-500 animate-pulse' : complaint.priority === 'High' ? 'bg-orange-500' : complaint.priority === 'Medium' ? 'bg-blue-500' : 'bg-slate-500'}`}>
                {complaint.priority} Priority
              </div>

              <div className="text-[10px] font-bold text-vignan-blue dark:text-sky-400 uppercase tracking-widest">{complaint.category}</div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 pr-20 leading-tight">
                {complaint.title}
              </h2>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar size={13} /> {new Date(complaint.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {complaint.location}
                </span>
                <span className="flex items-center gap-1">
                  <User size={13} /> {complaint.isAnonymous ? 'Anonymous' : complaint.student?.name || 'Registered User'}
                </span>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-750 mt-4 pt-4">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Grievance Description</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {complaint.description}
                </p>
              </div>

              {/* Attachments preview */}
              {(complaint.image || complaint.document) && (
                <div className="border-t border-slate-100 dark:border-slate-750 mt-4 pt-4 space-y-3 print:hidden">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Supporting Attachments</span>
                  <div className="flex flex-wrap gap-4">
                    {complaint.image && (
                      <div className="relative group border dark:border-slate-700 rounded-xl overflow-hidden bg-slate-105">
                        <img src={complaint.image} alt="Attachment" className="h-20 w-auto object-cover" />
                        <a href={complaint.image} download={`complaint_img_${complaint.complaintId}.png`} className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition-opacity">
                          Download
                        </a>
                      </div>
                    )}
                    {complaint.document && (
                      <a 
                        href={complaint.document} 
                        download={`complaint_doc_${complaint.complaintId}.pdf`}
                        className="p-3 border border-dashed dark:border-slate-700 rounded-xl flex items-center gap-2 text-xs font-semibold hover:border-vignan-blue"
                      >
                        <FileText size={16} className="text-vignan-red" />
                        <span>Download PDF Document</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Remarks section if resolved */}
              {complaint.adminRemarks && (
                <div className="border-t border-slate-100 dark:border-slate-750 mt-4 pt-4 text-xs text-left bg-vignan-blue/5 dark:bg-vignan-blue/10 p-3 rounded-xl border border-vignan-blue/10">
                  <span className="font-bold text-[10px] uppercase text-vignan-blue dark:text-sky-400 block mb-1">Administrative remarks</span>
                  <p className="text-slate-600 dark:text-slate-300 italic">"{complaint.adminRemarks}"</p>
                  {complaint.assignedTo && (
                    <span className="block mt-2 text-[10px] font-semibold text-slate-450 dark:text-slate-500">
                      Assigned to: {complaint.assignedTo}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Status Timeline Progress */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">{t('timeline')}</h3>
              
              {isRejected ? (
                <div className="flex items-center gap-4 text-red-500">
                  <div className="h-8 w-8 rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center font-bold">X</div>
                  <div>
                    <h4 className="font-extrabold text-sm">Complaint Rejected</h4>
                    <p className="text-xs text-slate-400 mt-0.5">This complaint was screened or rejected by portal admin.</p>
                  </div>
                </div>
              ) : (
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {/* Connect line */}
                  <div className="absolute left-4 md:left-[10%] right-[10%] top-4 bottom-4 md:bottom-auto md:h-0.5 bg-slate-200 dark:bg-slate-700 -z-10 hidden md:block"></div>
                  
                  {statuses.map((s, idx) => {
                    const isActive = idx <= currentStatusIndex;
                    const isCurrent = idx === currentStatusIndex;
                    return (
                      <div key={s} className="flex md:flex-col items-center gap-3 md:gap-1.5 text-left md:text-center md:flex-1">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all border ${isActive ? 'bg-vignan-blue border-vignan-blue text-white shadow-md shadow-vignan-blue/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'} ${isCurrent ? 'scale-110 ring-4 ring-vignan-blue/25' : ''}`}>
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className={`font-bold text-xs ${isActive ? 'text-slate-800 dark:text-slate-250' : 'text-slate-400'}`}>{s}</h4>
                          <span className="text-[9px] text-slate-400 block md:hidden">Status Completed</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ratings & Feedback Form for students when Resolved */}
            {complaint.status === 'Resolved' && user?.role === 'student' && (
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow print:hidden">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Star className="text-amber-500 fill-amber-500" size={18} /> {t('rating')}
                </h3>

                {rateSuccess && (
                  <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 dark:text-green-400 text-xs flex items-center gap-2 mb-4">
                    <ShieldCheck size={16} />
                    <span>{rateSuccess}</span>
                  </div>
                )}

                {complaint.rating > 0 ? (
                  <div className="space-y-2">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={18} className={star <= complaint.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
                      ))}
                    </div>
                    {complaint.feedback && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 p-3 rounded-xl">
                        "{complaint.feedback}"
                      </p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleRateSubmit} className="space-y-4">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          type="button" 
                          key={star} 
                          onClick={() => setRating(star)}
                          className="text-slate-300 hover:scale-110 transition-transform"
                        >
                          <Star size={24} className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
                        </button>
                      ))}
                    </div>
                    <div>
                      <textarea 
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Write your feedback regarding the resolution quality..."
                        rows={2}
                        className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-vignan-blue outline-none transition-all dark:text-white"
                      ></textarea>
                    </div>
                    <button type="submit" className="px-4 py-2 bg-vignan-blue text-white rounded-xl text-xs font-bold shadow-md hover:brightness-105">
                      Submit Review
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: QR Code and Admin controllers */}
          <div className="space-y-6 print:hidden">
            {/* QR Card */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-4">Grievance QR ID</span>
              {complaint.complaintId ? (
                <QRCodeSVG value={complaint.complaintId} size={110} className="bg-white p-1 rounded border shadow-sm" />
              ) : (
                <div className="h-[110px] w-[110px] bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center text-[10px] text-slate-400 rounded border">No QR Code</div>
              )}
              <span className="font-extrabold text-sm text-slate-900 dark:text-white mt-4">{complaint.complaintId || 'N/A'}</span>
              <span className="text-[10px] text-slate-400 mt-1">Scan to inspect credentials in-person</span>
            </div>

            {/* Admin Response controller Form */}
            {user?.role === 'admin' && (
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw size={14} /> Action Panel
                </h3>

                {adminSuccess && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 dark:text-green-400 text-xs flex items-center gap-2">
                    <ShieldCheck size={16} />
                    <span>{adminSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleAdminUpdateSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Update Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-vignan-blue dark:text-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Assign Handled By</label>
                    <input 
                      type="text" 
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      placeholder="Name of personnel/staff"
                      className="w-full px-2.5 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-vignan-blue dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Remarks & Reply</label>
                    <textarea
                      value={adminRemarks}
                      onChange={(e) => setAdminRemarks(e.target.value)}
                      placeholder="Add administrative review remarks..."
                      rows={3}
                      className="w-full px-2.5 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-vignan-blue dark:text-white"
                    ></textarea>
                  </div>

                  <button type="submit" className="w-full py-2.5 bg-vignan-blue text-white rounded-xl font-bold shadow-md hover:brightness-105">
                    Save Action
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default ComplaintDetails;
