import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const AuthContext = createContext();

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api`;

// Intercept all axios requests to rewrite localhost URLs to production API URLs in hosted environments
axios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('http://localhost:5000/api')) {
    config.url = config.url.replace('http://localhost:5000/api', API_URL);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vignan-token') || null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [liveNotification, setLiveNotification] = useState(null);

  // Configure axios defaults
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Initialize socket when user is logged in
  useEffect(() => {
    if (user && token) {
      const socketConnection = io(BACKEND_URL);
      
      socketConnection.on('connect', () => {
        console.log('[Socket] Connected to server');
        socketConnection.emit('join', user._id);
        if (user.role === 'admin') {
          socketConnection.emit('join-admins');
        }
      });

      socketConnection.on('new-notification', (notif) => {
        console.log('[Socket] Notification received:', notif);
        setLiveNotification(notif);
        // Clear notification from live queue after 5 seconds
        setTimeout(() => setLiveNotification(null), 5000);
      });

      setSocket(socketConnection);

      return () => {
        socketConnection.disconnect();
        console.log('[Socket] Disconnected from server');
      };
    } else {
      setSocket(null);
    }
  }, [user, token]);

  // Load user profile on app load
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get(`${API_URL}/auth/profile`);
          setUser(res.data);
        } catch (err) {
          console.error('[Auth] Failed to load user profile', err);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token: userToken, user: userData } = res.data;
      
      localStorage.setItem('vignan-token', userToken);
      setToken(userToken);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (err) {
      console.error('[Auth] Login error', err);
      const msg = err.response?.data?.message || 'Login failed, check credentials';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      const { token: userToken, user: registeredUser } = res.data;

      localStorage.setItem('vignan-token', userToken);
      setToken(userToken);
      setUser(registeredUser);

      return { success: true, user: registeredUser };
    } catch (err) {
      console.error('[Auth] Registration error', err);
      const msg = err.response?.data?.message || 'Registration failed';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('vignan-token');
    setToken(null);
    setUser(null);
    if (socket) {
      socket.disconnect();
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put(`${API_URL}/auth/profile`, profileData);
      setUser(res.data.user);
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Profile update failed';
      return { success: false, error: msg };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await axios.put(`${API_URL}/auth/change-password`, { currentPassword, newPassword });
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      return { success: false, error: msg };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request OTP';
      return { success: false, error: msg };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await axios.post(`${API_URL}/auth/reset-password`, { email, otp, newPassword });
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password';
      return { success: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      forgotPassword,
      resetPassword,
      socket,
      liveNotification,
      setLiveNotification,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { API_URL };
