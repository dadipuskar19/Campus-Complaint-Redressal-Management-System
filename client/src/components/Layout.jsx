import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { 
  Menu, X, Bell, Sun, Moon, LogOut, LayoutDashboard, FilePlus, 
  History, User, Settings, FileBarChart2, Info, PhoneCall, ChevronRight, Globe, Users
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, liveNotification, setLiveNotification } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { locale, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Sync new socket notification
  useEffect(() => {
    if (liveNotification) {
      setNotifications(prev => [liveNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  }, [liveNotification]);

  const handleMarkAllRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (id, complaintId) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotificationsOpen(false);
      navigate('/history');
    } catch (err) {
      console.error(err);
    }
  };

  const menuItems = [
    { name: t('dashboard'), path: user?.role === 'admin' ? '/admin' : '/dashboard', icon: LayoutDashboard },
    { name: t('newComplaint'), path: '/submit', icon: FilePlus, role: 'student' },
    { name: t('history'), path: '/history', icon: History },
    { name: "Manage Users", path: "/admin/users", icon: Users, role: 'admin' },
    { name: "Manage Contacts", path: "/admin/contacts", icon: PhoneCall, role: 'admin' },
    { name: t('reports'), path: '/reports', icon: FileBarChart2, role: 'admin' },
    { name: t('profile'), path: '/profile', icon: User },
    { name: t('settings'), path: '/settings', icon: Settings },
    { name: t('about'), path: '/about', icon: Info },
    { name: t('contact'), path: '/contact', icon: PhoneCall },
  ];

  const activeItem = menuItems.find(item => location.pathname === item.path);

  const filteredMenuItems = menuItems.filter(item => {
    if (item.role === 'student' && user?.role !== 'student') return false;
    if (item.role === 'admin' && user?.role !== 'admin') return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-vignan-dark">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 md:hidden rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <Menu size={20} />
          </button>
          
          {/* Logo with path link */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Vignan Logo" 
              className="h-10 w-auto object-contain bg-white rounded p-0.5" 
            />
            <span className="hidden md:inline-block font-extrabold text-sm lg:text-base leading-tight tracking-wide bg-gradient-to-r from-vignan-blue to-vignan-red bg-clip-text text-transparent">
              VIGNAN'S INSTITUTE
              <span className="block text-[10px] font-medium tracking-normal text-slate-500 dark:text-slate-400">
                (AUTONOMOUS) • DUVVADA, VISAKHAPATNAM
              </span>
            </span>
          </Link>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Language Selector */}
          <div className="relative group">
            <button className="p-2 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-1">
              <Globe size={18} />
              <span className="text-xs uppercase font-semibold">{locale}</span>
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 w-28 overflow-hidden z-50">
              <button onClick={() => changeLanguage('en')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 flex justify-between items-center">
                English {locale === 'en' && '✓'}
              </button>
              <button onClick={() => changeLanguage('hi')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 flex justify-between items-center">
                हिंदी {locale === 'hi' && '✓'}
              </button>
              <button onClick={() => changeLanguage('te')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 flex justify-between items-center">
                తెలుగు {locale === 'te' && '✓'}
              </button>
            </div>
          </div>

          {/* Theme Toggler */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-vignan-red text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{t('notifications')}</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-xs text-vignan-blue dark:text-sky-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <button
                        key={n._id}
                        onClick={() => handleNotificationClick(n._id, n.complaintId)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700/30 flex flex-col gap-0.5 transition-colors ${!n.read ? 'bg-slate-100/40 dark:bg-slate-700/20' : ''}`}
                      >
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                          {n.title}
                          {!n.read && <span className="h-2 w-2 rounded-full bg-vignan-red"></span>}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {n.message}
                        </p>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">
                          {new Date(n.createdAt).toLocaleTimeString()}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-3">
            <img 
              src={user?.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'V')}`} 
              alt={user?.name}
              className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{user?.name}</span>
              <span className="text-[10px] text-slate-400 capitalize">{user?.role}</span>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-slate-400 hover:text-vignan-red dark:hover:text-vignan-red rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors ml-1"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex relative">
        {/* Sidebar Navigation */}
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 glass-panel border-r border-slate-200 dark:border-slate-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex md:flex-col transition-transform duration-300 ease-in-out pt-16 md:pt-0`}>
          <div className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
            {/* Sidebar Branding details */}
            <div className="px-3 mb-6 hidden md:block">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Portal Navigation</span>
            </div>
            {filteredMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-vignan-blue to-vignan-blue/80 text-white shadow-md shadow-vignan-blue/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto" />}
                </Link>
              );
            })}
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
              VIIT Campus Safety App v1.0
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 text-center">
              Powered by Node + Gemini AI
            </span>
          </div>
        </aside>

        {/* Backdrop for mobile drawer */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 md:hidden"
          ></div>
        )}

        {/* Content Panel */}
        <main className="flex-1 flex flex-col overflow-x-hidden p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Floating Real-Time Socket Toast Popup Alert */}
      {liveNotification && (
        <div className="fixed bottom-6 right-6 max-w-sm w-full bg-slate-900 text-white rounded-xl shadow-2xl p-4 border border-vignan-blue/30 z-50 flex items-start gap-3 animate-bounce">
          <Bell className="text-sky-400 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm">{liveNotification.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{liveNotification.message}</p>
          </div>
          <button 
            onClick={() => setLiveNotification(null)}
            className="text-slate-400 hover:text-white ml-auto"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Layout;
