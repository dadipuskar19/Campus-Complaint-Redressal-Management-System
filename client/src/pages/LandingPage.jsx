import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, Zap, MessageSquare, Award, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-vignan-dark overflow-hidden relative">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-vignan-blue/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-vignan-red/10 blur-[150px] pointer-events-none"></div>

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Vignan Logo" className="h-10 w-auto bg-white p-0.5 rounded shadow-sm" />
          <span className="font-extrabold text-sm md:text-base bg-gradient-to-r from-vignan-blue to-vignan-red bg-clip-text text-transparent leading-none">
            VIGNAN'S INSTITUTE
            <span className="block text-[10px] font-medium text-slate-500 mt-0.5">CAMPUS COMPLAINT SYSTEM</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link 
              to={user?.role === 'admin' ? '/admin' : '/dashboard'} 
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl text-white bg-vignan-blue hover:bg-vignan-blue/90 shadow-md hover:shadow-vignan-blue/30 transition-all flex items-center gap-1.5"
            >
              Go to Dashboard <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-vignan-blue transition-colors">
                Log In
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-vignan-blue to-vignan-blue/90 hover:from-vignan-blue/90 hover:to-vignan-blue shadow-md hover:shadow-vignan-blue/20 transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center text-center relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center max-w-4xl"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            className="px-4 py-1.5 rounded-full bg-vignan-red/10 border border-vignan-red/20 text-vignan-red dark:text-red-400 text-[11px] font-bold uppercase tracking-wider mb-6 flex items-center gap-1.5"
          >
            <Sparkles size={12} /> AI-Powered Real-Time Campus Portal
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight"
          >
            Voice-Enabled & AI-Categorized <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vignan-blue via-vignan-blue to-vignan-red">
              Campus Complaint Redressal
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            variants={itemVariants}
            className="text-slate-600 dark:text-slate-350 text-sm md:text-lg mt-6 leading-relaxed max-w-2xl"
          >
            Empowering students of Vignan's Institute of Information Technology (Autonomous) to register grievances, track resolution state in real time, and access automated AI support instantly.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto"
          >
            {isAuthenticated ? (
              <Link 
                to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                className="px-8 py-3.5 font-bold rounded-xl text-white bg-gradient-to-r from-vignan-blue to-vignan-red hover:brightness-110 shadow-lg hover:shadow-vignan-blue/20 transition-all flex items-center justify-center gap-2"
              >
                Access Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link 
                  to="/register"
                  className="px-8 py-3.5 font-bold rounded-xl text-white bg-gradient-to-r from-vignan-blue to-vignan-blue/90 hover:shadow-lg shadow-md shadow-vignan-blue/20 hover:shadow-vignan-blue/30 transition-all flex items-center justify-center gap-2 glowing-btn"
                >
                  Get Started (Register) <ArrowRight size={18} />
                </Link>
                <Link 
                  to="/login"
                  className="px-8 py-3.5 font-bold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-200/30 dark:hover:bg-slate-800/30 transition-all flex items-center justify-center"
                >
                  Faculty & Admin Login
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full"
        >
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col text-left group hover:scale-[1.02] transition-all">
            <div className="h-10 w-10 rounded-xl bg-vignan-blue/10 dark:bg-vignan-blue/20 text-vignan-blue dark:text-sky-400 flex items-center justify-center mb-4 group-hover:bg-vignan-blue group-hover:text-white transition-colors duration-300">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Real-Time Sync</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Powered by WebSockets. Instantly notifies students when an administrator assigns or resolves a ticket. Live dashboard counts refresh automatically.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col text-left group hover:scale-[1.02] transition-all">
            <div className="h-10 w-10 rounded-xl bg-vignan-red/10 dark:bg-vignan-red/20 text-vignan-red dark:text-red-400 flex items-center justify-center mb-4 group-hover:bg-vignan-red group-hover:text-white transition-colors duration-300">
              <Sparkles size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Gemini AI Assistant</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Auto-detects complaint categories, recommends priorities, translates text, and flags spam/abusive entries to optimize administrator review.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col text-left group hover:scale-[1.02] transition-all">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-500 dark:text-violet-400 flex items-center justify-center mb-4 group-hover:bg-violet-500 group-hover:text-white transition-colors duration-300">
              <Shield size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Secure & Anonymous</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Provides students options to post anonymously. All personal data is encrypted with JWT role checks guarding database layers.
            </p>
          </div>
        </motion.section>

        {/* Quick System Stats */}
        <div className="mt-16 py-6 px-8 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/30 dark:border-slate-700/30 flex flex-wrap gap-8 justify-around items-center w-full">
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-vignan-blue">14+</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Complaint Categories</span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-vignan-red">100%</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Real-time status tracking</span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-vignan-blue">AI-Ready</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Gemini 1.5 Framework</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/50 dark:border-slate-800/50 text-center text-xs text-slate-450 dark:text-slate-500 mt-auto">
        &copy; {new Date().getFullYear()} Vignan's Institute of Information Technology (Autonomous), Duvvada. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
