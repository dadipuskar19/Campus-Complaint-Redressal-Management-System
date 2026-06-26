import React from 'react';
import Layout from '../components/Layout';
import { Award, ShieldCheck, Heart, Users, MapPin, CheckCircle } from 'lucide-react';

const About = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Banner Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden shadow-xl text-center">
          <div className="absolute top-[-20%] right-[-10%] w-60 h-60 rounded-full bg-vignan-blue/15 blur-[50px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-60 h-60 rounded-full bg-vignan-red/15 blur-[50px] pointer-events-none"></div>
          
          <img src="/logo.png" alt="Vignan Logo" className="mx-auto h-20 w-auto bg-white p-1 rounded-xl shadow-md mb-4" />
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">About Campus Safety Portal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto">
            Developed for Vignan's Institute of Information Technology (Autonomous), Visakhapatnam to automate and digitize everyday campus grievance resolution.
          </p>
        </div>

        {/* System Core Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-200/30 dark:border-slate-800/30">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="text-vignan-blue" size={20} /> System Objective
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Our core objective is to replace traditional paper-based/complaint-box systems with a state-of-the-art secure dashboard. Students get direct access to their heads of department and receive status feeds via instant Socket notifications.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-200/30 dark:border-slate-800/30">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="text-vignan-red" size={20} /> Transparency & Safety
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              All complaint workflows go through designated statuses (Pending, Under Review, Assigned, In Progress, Resolved, Rejected) ensuring transparency. Anonymity switches prevent retaliation while ratings and feedback enforce accountability.
            </p>
          </div>
        </div>

        {/* Development Tech Details */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">Core Technology Implementation</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl flex flex-col items-center text-center">
              <span className="text-sm font-bold text-vignan-blue">Vite + React</span>
              <span className="text-[10px] text-slate-400 mt-1">Frontend UI</span>
            </div>
            <div className="p-3.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl flex flex-col items-center text-center">
              <span className="text-sm font-bold text-vignan-red">Tailwind CSS</span>
              <span className="text-[10px] text-slate-400 mt-1">Responsive Styling</span>
            </div>
            <div className="p-3.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl flex flex-col items-center text-center">
              <span className="text-sm font-bold text-vignan-blue">Node + Express</span>
              <span className="text-[10px] text-slate-400 mt-1">REST backend</span>
            </div>
            <div className="p-3.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl flex flex-col items-center text-center">
              <span className="text-sm font-bold text-vignan-red">Google Gemini</span>
              <span className="text-[10px] text-slate-400 mt-1">Artificial Intelligence</span>
            </div>
          </div>
        </div>

        {/* Institution Info */}
        <div className="p-5 bg-vignan-blue/5 border border-vignan-blue/15 dark:border-vignan-blue/30 rounded-2xl flex items-start gap-4">
          <MapPin className="text-vignan-blue shrink-0 mt-0.5" size={20} />
          <div className="text-left">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Vignan's Institute of Information Technology (Autonomous)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
              Duvvada, Visakhapatnam, Andhra Pradesh 530049. <br/>
              Affiliated to JNTUGV Vizianagaram, Approved by AICTE, Accredited by NAAC (A+ Grade).
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default About;
