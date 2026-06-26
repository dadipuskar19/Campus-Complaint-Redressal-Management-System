import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Phone, Mail, Clock, HelpCircle, MapPin } from 'lucide-react';
import axios from 'axios';

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/departments');
        setContacts(res.data);
      } catch (err) {
        console.error('Error fetching contact directory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Intro */}
        <div className="text-left max-w-xl">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Emergency Help & Contact</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Reach out to department heads or emergency cell wardens directly. You can also file a ticket in this app for tracked resolutions.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-8 text-xs text-slate-400">
              <span className="inline-block h-6 w-6 border-2 border-vignan-blue border-t-transparent rounded-full animate-spin mr-2"></span>
              Loading contacts directory...
            </div>
          ) : contacts.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-xs text-slate-450">No helpline contacts registered.</div>
          ) : (
            contacts.map((c, idx) => (
              <div key={c._id || idx} className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow hover:shadow-lg transition-all text-left flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-vignan-blue dark:text-sky-400">
                    {c.name} Department
                  </span>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                    {c.head}
                  </h4>
                  
                  <div className="space-y-2 mt-4 text-xs">
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 hover:text-vignan-blue dark:hover:text-sky-400 transition-colors">
                        <Phone size={14} className="shrink-0 text-slate-400" />
                        <span>{c.phone}</span>
                      </a>
                    )}
                    <a href={`mailto:${c.email}`} className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 hover:text-vignan-blue dark:hover:text-sky-400 transition-colors">
                      <Mail size={14} className="shrink-0 text-slate-400" />
                      <span className="break-all">{c.email}</span>
                    </a>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700/50 mt-4 pt-3 flex items-center gap-2 text-[10px] text-slate-400">
                  <Clock size={12} />
                  <span>{c.availability || '9:00 AM - 5:00 PM'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Location Info */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="text-left max-w-lg">
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="text-vignan-red animate-pulse" size={18} /> Location & Office hours
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Main Administrative Block, Vignan's Institute of Information Technology (Autonomous), Duvvada, Visakhapatnam. Open Monday through Saturday, 9:00 AM to 5:00 PM.
            </p>
          </div>
          <a 
            href="https://maps.google.com" 
            target="_blank" 
            rel="noreferrer"
            className="px-5 py-2.5 text-xs font-bold text-white bg-vignan-blue hover:bg-vignan-blue/90 rounded-xl shadow-md shrink-0"
          >
            Open in Google Maps
          </a>
        </div>

      </div>
    </Layout>
  );
};

export default Contact;
