import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.5.1' && window.location.hostname !== '127.0.0.1';
  const isUsingLocalhostApi = API_URL.includes('localhost') || API_URL.includes('127.0.0.1') || API_URL.includes('127.0.5.1');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-vignan-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background design accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-vignan-blue/10 blur-[80px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-vignan-red/10 blur-[80px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glass-panel p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative z-10"
      >
        {/* Branding header */}
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/logo.png" alt="Vignan Logo" className="h-16 w-auto object-contain bg-white rounded p-1 shadow-sm mb-4" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Sign In to Portal</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">
            Campus Complaint & Redressal Management System
          </p>
        </div>

        {isProduction && isUsingLocalhostApi && (
          <div className="mb-4 p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs rounded-xl space-y-1 text-left">
            <span className="font-extrabold block text-amber-600 dark:text-amber-400">⚠️ Live Deploy Configuration Alert:</span>
            <p className="leading-relaxed text-[11px] text-slate-500 dark:text-slate-400">
              The frontend is running live on Vercel but is still pointing to a local backend API (<code className="bg-slate-200 dark:bg-slate-800 px-1 rounded text-red-500">localhost</code>).
              To connect it, please add the <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded text-red-500">VITE_API_URL</code> environment variable in your **Vercel Project Settings** pointing to your deployed backend (e.g. Render/Railway URL).
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rollnumber@vignan.edu or faculty@vignan.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue focus:border-transparent outline-none transition-all dark:text-white"
              />
              <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <Link 
                to="/forgot-password"
                className="text-[11px] font-bold text-vignan-blue dark:text-sky-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue focus:border-transparent outline-none transition-all dark:text-white"
              />
              <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-vignan-blue to-vignan-blue/90 hover:from-vignan-blue/90 hover:to-vignan-blue hover:shadow-lg transition-all rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Continue <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-vignan-red dark:text-red-400 hover:underline">
              Create student account
            </Link>
          </p>
        </div>

        {/* Demo Credentials Tip */}
        <div className="mt-6 p-3 bg-vignan-blue/5 dark:bg-vignan-blue/10 border border-vignan-blue/10 dark:border-vignan-blue/20 rounded-xl flex items-start gap-2.5">
          <ShieldCheck className="text-vignan-blue shrink-0 mt-0.5" size={16} />
          <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal text-left">
            <span className="font-bold block text-vignan-blue dark:text-sky-400">Quick Testing Accounts:</span>
            Admin: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-red-500">admin@vignan.edu</code> / <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-red-500">123456</code><br/>
            Student: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-red-500">student@vignan.edu</code> / <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-red-500">123456</code>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
