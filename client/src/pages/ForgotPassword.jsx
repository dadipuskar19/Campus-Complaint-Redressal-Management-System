import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, ShieldCheck, Key, Lock, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = request, 2 = verify & reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState(''); // Exposed in UI for testing

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    const res = await forgotPassword(email);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('OTP code sent successfully!');
      if (res.data.otp) {
        setReceivedOtp(res.data.otp); // Save the OTP so user can copy it directly!
      }
      setStep(2);
    } else {
      setError(res.error);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(email, otp, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-vignan-dark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-vignan-blue/10 blur-[80px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-vignan-red/10 blur-[80px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glass-panel p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <img src="/logo.png" alt="Vignan Logo" className="h-14 w-auto object-contain bg-white rounded p-1 shadow-sm mb-3" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {step === 1 ? 'Reset Password' : 'Verify OTP'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">
            {step === 1 
              ? 'Enter your email to receive a password reset verification code'
              : 'Enter the verification code and set your new account password'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 dark:text-green-400 text-xs flex items-center gap-2.5">
            <ShieldCheck size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., student@vignan.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue focus:border-transparent outline-none transition-all dark:text-white"
                />
                <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-vignan-blue to-vignan-blue/90 hover:from-vignan-blue/90 hover:to-vignan-blue hover:shadow-lg transition-all rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading ? (
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  Send OTP Code <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {receivedOtp && (
              <div className="p-3 bg-vignan-blue/5 border border-vignan-blue/20 rounded-xl text-xs text-left mb-2">
                <span className="font-bold text-vignan-blue dark:text-sky-400 block mb-0.5">Demo Reset Code:</span>
                Copy this OTP code: <code className="font-bold text-sm bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-vignan-red">{receivedOtp}</code>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                6-Digit OTP Code
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue focus:border-transparent outline-none transition-all dark:text-white"
                />
                <Key className="absolute left-3.5 top-3 text-slate-400" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                New Password
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue focus:border-transparent outline-none transition-all dark:text-white"
                />
                <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue focus:border-transparent outline-none transition-all dark:text-white"
                />
                <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-vignan-blue to-vignan-blue/90 hover:from-vignan-blue/90 hover:to-vignan-blue hover:shadow-lg transition-all rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading ? (
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  Update Password <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 flex justify-between items-center border-t border-slate-200/50 dark:border-slate-800/50 pt-5 text-xs">
          <Link to="/login" className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-950 font-bold transition-colors">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
          {step === 2 && (
            <button 
              onClick={() => { setStep(1); setOtp(''); }}
              className="text-vignan-blue font-bold hover:underline"
            >
              Resend Code?
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
