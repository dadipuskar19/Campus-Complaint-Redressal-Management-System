import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-vignan-dark flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-vignan-blue/10 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-vignan-red/10 blur-[150px]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-panel p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl text-center z-10"
      >
        <div className="h-16 w-16 bg-vignan-red/10 rounded-full flex items-center justify-center mx-auto mb-6 text-vignan-red">
          <HelpCircle size={32} />
        </div>
        <h1 className="text-6xl font-black text-slate-900 dark:text-white">404</h1>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-2">Page Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-450 mt-2 leading-relaxed">
          The requested page might have been removed, had its name changed, or is temporarily unavailable. Let's get you back.
        </p>

        <Link 
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-vignan-blue hover:bg-vignan-blue/90 text-white rounded-xl font-bold text-xs shadow-md transition-all"
        >
          <Home size={14} /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
