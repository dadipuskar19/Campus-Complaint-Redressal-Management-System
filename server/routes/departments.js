const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Department = require('../models/Department');
const { storageService } = require('../services/storageService');

// @route   GET api/departments
// @desc    Get all departments
router.get('/', async (req, res) => {
  try {
    let list;
    if (global.useMockDB) {
      list = storageService.find('departments');
    } else {
      list = await Department.find();
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching departments', error: err.message });
  }
});

// @route   POST api/departments
// @desc    Create a new department (Admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const { name, head, email, phone, availability } = req.body;
    if (!name || !head || !email) {
      return res.status(400).json({ message: 'All fields name, head, and email are required' });
    }

    let dep;
    const depData = { name, head, email, phone: phone || '', availability: availability || '9:00 AM - 5:00 PM' };
    
    if (global.useMockDB) {
      const exists = storageService.findOne('departments', d => d.name.toLowerCase() === name.toLowerCase());
      if (exists) return res.status(400).json({ message: 'Department already exists' });
      dep = storageService.create('departments', depData);
    } else {
      const exists = await Department.findOne({ name });
      if (exists) return res.status(400).json({ message: 'Department already exists' });
      const newDep = new Department(depData);
      dep = await newDep.save();
    }
    res.status(201).json({ department: dep, message: 'Department added successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error creating department', error: err.message });
  }
});

// @route   PUT api/departments/:id
// @desc    Update department contact details (Admin only)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const { name, head, email, phone, availability } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (head) updateData.head = head;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (availability !== undefined) updateData.availability = availability;

    let updated;
    if (global.useMockDB) {
      updated = storageService.updateById('departments', req.params.id, updateData);
    } else {
      updated = await Department.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );
    }

    if (!updated) {
      return res.status(404).json({ message: 'Department contact not found' });
    }
    res.json({ department: updated, message: 'Department contact updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating department', error: err.message });
  }
});

// @route   DELETE api/departments/:id
// @desc    Remove department contact (Admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    let deleted = false;
    if (global.useMockDB) {
      deleted = storageService.deleteById('departments', req.params.id);
    } else {
      const exists = await Department.findById(req.params.id);
      if (exists) {
        await Department.findByIdAndDelete(req.params.id);
        deleted = true;
      }
    }

    if (!deleted) {
      return res.status(404).json({ message: 'Department contact not found' });
    }
    res.json({ message: 'Department contact removed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting department', error: err.message });
  }
});

module.exports = router;
