const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { storageService } = require('../services/storageService');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyvignan2026');
    
    let user;
    if (global.useMockDB) {
      user = storageService.findById('users', decoded.id);
    } else {
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
        return res.status(401).json({ message: 'Invalid session token format. Please log in again.' });
      }
      user = await User.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found, authorization failed' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is invalid or expired', error: err.message });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin role required' });
  }
};

module.exports = { auth, admin };
