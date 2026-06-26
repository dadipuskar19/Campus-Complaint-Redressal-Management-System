const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');
const { storageService } = require('../services/storageService');

// @route   GET api/notifications
// @desc    Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    let list;
    if (global.useMockDB) {
      list = storageService.find('notifications', n => n.userId === req.user._id);
      // Sort desc by date
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      list = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching notifications', error: err.message });
  }
});

// @route   PUT api/notifications/mark-all-read
// @desc    Mark all notifications of user as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    if (global.useMockDB) {
      const list = storageService.find('notifications', n => n.userId === req.user._id);
      list.forEach(n => {
        storageService.updateById('notifications', n._id, { read: true });
      });
    } else {
      await Notification.updateMany({ userId: req.user._id }, { $set: { read: true } });
    }
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating notifications', error: err.message });
  }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark a specific notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    if (global.useMockDB) {
      storageService.updateById('notifications', req.params.id, { read: true });
    } else {
      await Notification.findByIdAndUpdate(req.params.id, { $set: { read: true } });
    }
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating notification', error: err.message });
  }
});

module.exports = router;
