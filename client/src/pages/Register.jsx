import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, BookOpen, AlertCircle, ArrowRight, Shield } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    rollNumber: '',
    department: 'CSE',
    phone: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const departmentsList = [
    'CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL', 'MCA', 'MBA', 'AI&DS', 'CS', 'General'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, email, password, role, rollNumber, phone } = formData;

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (role === 'student' && !rollNumber) {
      setError('Roll number is required for students.');
      return;
    }

    setLoading(true);
    const res = await register(formData);
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
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-vignan-blue/10 blur-[80px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-vignan-red/10 blur-[80px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glass-panel p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative z-10 my-8"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <img src="/logo.png" alt="Vignan Logo" className="h-14 w-auto object-contain bg-white rounded p-1 shadow-sm mb-3" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Create Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Register yourself to request redressals on campus
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue focus:border-transparent outline-none transition-all dark:text-white"
              />
              <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@vignan.edu"
                className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue focus:border-transparent outline-none transition-all dark:text-white"
              />
              <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Password *
            </label>
            <div className="relative">
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue focus:border-transparent outline-none transition-all dark:text-white"
              />
              <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Portal Role
              </label>
              <div className="relative">
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-3 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue outline-none transition-all dark:text-white appearance-none"
                >
                  <option value="student" className="dark:bg-slate-800">Student</option>
                  <option value="admin" className="dark:bg-slate-800">Administrator</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Department
              </label>
              <select 
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue outline-none transition-all dark:text-white"
              >
                {departmentsList.map(d => (
                  <option key={d} value={d} className="dark:bg-slate-800">{d}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.role === 'student' ? (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Roll Number *
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  placeholder="e.g., 22L31A0501"
                  className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue focus:border-transparent outline-none transition-all dark:text-white"
                />
                <BookOpen className="absolute left-3.5 top-3 text-slate-400" size={16} />
              </div>
            </div>
          ) : (
            <div className="p-3 bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 dark:border-red-500/20 rounded-xl flex items-start gap-2.5">
              <Shield className="text-vignan-red shrink-0 mt-0.5" size={16} />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal text-left">
                <span className="font-bold text-vignan-red block">Faculty Registry Note:</span>
                Admin registrations will automatically receive full dashboard control. Ensure correct credentials.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <div className="relative">
              <input 
                type="text" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit number"
                className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue focus:border-transparent outline-none transition-all dark:text-white"
              />
              <Phone className="absolute left-3.5 top-3 text-slate-400" size={16} />
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
                Register Account <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-200/50 dark:border-slate-800/50 pt-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-vignan-blue dark:text-sky-400 hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
