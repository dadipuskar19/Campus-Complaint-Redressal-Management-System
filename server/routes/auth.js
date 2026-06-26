const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth, admin } = require('../middleware/auth');
const User = require('../models/User');
const { storageService } = require('../services/storageService');

// In-memory OTP storage for password resets
const otpStore = new Map();

// Helper to sign JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET || 'supersecretkeyvignan2026', 
    { expiresIn: '7d' }
  );
};

// @route   POST api/auth/register
// @desc    Register a student/admin
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, department, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    // Check if user exists
    let existingUser;
    if (global.useMockDB) {
      existingUser = storageService.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    } else {
      existingUser = await User.findOne({ email: email.toLowerCase() });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    let user;
    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'student',
      rollNumber: role === 'student' ? rollNumber : undefined,
      department: department || '',
      phone: phone || '',
      photo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    };

    if (global.useMockDB) {
      user = storageService.create('users', userData);
      // Omit password in response
      delete user.password;
    } else {
      const newUser = new User(userData);
      const savedUser = await newUser.save();
      user = savedUser.toObject();
      delete user.password;
    }

    const token = generateToken(user._id);
    res.status(201).json({ token, user, message: 'Registration successful!' });

  } catch (err) {
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user and get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Fetch user
    let user;
    if (global.useMockDB) {
      user = storageService.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    } else {
      const dbUser = await User.findOne({ email: email.toLowerCase() });
      if (dbUser) {
        user = dbUser.toObject();
      }
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials: user not found' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials: password incorrect' });
    }

    const token = generateToken(user._id);
    delete user.password;

    res.json({ token, user, message: 'Logged in successfully!' });

  } catch (err) {
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

// @route   GET api/auth/profile
// @desc    Get current user profile
router.get('/profile', auth, async (req, res) => {
  res.json(req.user);
});

// @route   PUT api/auth/profile
// @desc    Update user profile details
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, department, rollNumber, photo } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (department !== undefined) updateData.department = department;
    if (rollNumber !== undefined) updateData.rollNumber = rollNumber;
    if (photo !== undefined) updateData.photo = photo;

    let updatedUser;
    if (global.useMockDB) {
      updatedUser = storageService.updateById('users', req.user._id, updateData);
      if (updatedUser) delete updatedUser.password;
    } else {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true }
      ).select('-password');
    }

    res.json({ user: updatedUser, message: 'Profile updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating profile', error: err.message });
  }
});

// @route   PUT api/auth/change-password
// @desc    Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please enter current and new password' });
    }

    // Refetch user with password
    let user;
    if (global.useMockDB) {
      user = storageService.findById('users', req.user._id);
    } else {
      user = await User.findById(req.user._id);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    if (global.useMockDB) {
      storageService.updateById('users', req.user._id, { password: hashedPassword });
    } else {
      user.password = hashedPassword;
      await user.save();
    }

    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error changing password', error: err.message });
  }
});

// @route   POST api/auth/forgot-password
// @desc    Initiate password reset, send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    let user;
    if (global.useMockDB) {
      user = storageService.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    } else {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email address' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email.toLowerCase(), {
      otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
    });

    console.log(`[AUTH] Password Reset OTP for ${email}: ${otp}`);

    // Return OTP in dev mode for easy testing, or console output
    res.json({
      message: 'OTP sent to your email (for this demo, check the server console or the otp field in response)',
      otp: process.env.NODE_ENV === 'development' ? otp : otp, // Always return it for ease of client demo!
      email
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error initiating password reset', error: err.message });
  }
});

// @route   POST api/auth/reset-password
// @desc    Verify OTP and update password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const storedData = otpStore.get(email.toLowerCase());
    if (!storedData) {
      return res.status(400).json({ message: 'No OTP requested or session expired' });
    }

    if (storedData.expires < Date.now()) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    if (global.useMockDB) {
      const updated = storageService.update('users', u => u.email.toLowerCase() === email.toLowerCase(), { password: hashedPassword });
      if (!updated) return res.status(500).json({ message: 'Failed to update password' });
    } else {
      const user = await User.findOne({ email: email.toLowerCase() });
      user.password = hashedPassword;
      await user.save();
    }

    // Clear OTP
    otpStore.delete(email.toLowerCase());

    res.json({ message: 'Password reset successful! You can now log in.' });

  } catch (err) {
    res.status(500).json({ message: 'Server error resetting password', error: err.message });
  }
});

// @route   GET api/auth/users
// @desc    Get all users (Admin only)
router.get('/users', auth, admin, async (req, res) => {
  try {
    let list;
    if (global.useMockDB) {
      list = storageService.find('users');
      // Omit passwords
      list = list.map(u => {
        const copy = { ...u };
        delete copy.password;
        return copy;
      });
    } else {
      list = await User.find().select('-password');
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching users', error: err.message });
  }
});

// @route   PUT api/auth/users/:id
// @desc    Update any user details (Admin only)
router.put('/users/:id', auth, admin, async (req, res) => {
  try {
    const { name, role, department, rollNumber, phone } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (rollNumber !== undefined) updateData.rollNumber = rollNumber;
    if (phone !== undefined) updateData.phone = phone;

    let updatedUser;
    if (global.useMockDB) {
      updatedUser = storageService.updateById('users', req.params.id, updateData);
      if (updatedUser) delete updatedUser.password;
    } else {
      updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      ).select('-password');
    }

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: updatedUser, message: 'User updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating user', error: err.message });
  }
});

// @route   DELETE api/auth/users/:id
// @desc    Delete a user (Admin only)
router.delete('/users/:id', auth, admin, async (req, res) => {
  try {
    let deleted = false;
    if (global.useMockDB) {
      deleted = storageService.deleteById('users', req.params.id);
    } else {
      const exists = await User.findById(req.params.id);
      if (exists) {
        await User.findByIdAndDelete(req.params.id);
        deleted = true;
      }
    }

    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting user', error: err.message });
  }
});

module.exports = router;
