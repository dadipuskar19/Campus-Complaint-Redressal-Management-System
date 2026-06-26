const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { storageService } = require('../services/storageService');
const aiService = require('../services/aiService');
const xlsx = require('xlsx');
const PDFDocument = require('pdfkit');

// Helper to generate notification
const createNotification = async (userId, title, message, io) => {
  const notifData = { userId, title, message, read: false };
  let notif;
  if (global.useMockDB) {
    notif = storageService.create('notifications', notifData);
  } else {
    const newNotif = new Notification(notifData);
    const saved = await newNotif.save();
    notif = saved.toObject();
  }
  
  if (io) {
    // Send socket notification to specific user
    io.to(userId.toString()).emit('new-notification', notif);
  }
  return notif;
};

// @route   POST api/complaints/submit
// @desc    Submit a new complaint
router.post('/submit', auth, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category: reqCategory, 
      priority: reqPriority, 
      location, 
      isAnonymous, 
      image, 
      document 
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and Description are required' });
    }

    // Fetch existing complaints for duplicate detection
    let existing;
    if (global.useMockDB) {
      existing = storageService.find('complaints');
    } else {
      existing = await Complaint.find().select('complaintId title status');
    }

    // AI Analysis
    const aiAnalysis = await aiService.analyzeComplaint(title, description, existing);

    // AI Suggestions overwrite defaults if user selected "auto" or left blank
    const category = reqCategory && reqCategory !== 'Auto' ? reqCategory : aiAnalysis.category;
    const priority = reqPriority && reqPriority !== 'Auto' ? reqPriority : aiAnalysis.priority;
    
    // Auto-reject if AI flags spam
    let status = 'Pending';
    let adminRemarks = '';
    if (aiAnalysis.isSpam) {
      status = 'Rejected';
      adminRemarks = `AI Spam Detection Warning: ${aiAnalysis.spamReason}`;
    }

    const complaintId = `VIGNAN-COMP-${Math.floor(100000 + Math.random() * 900000)}`;

    const complaintData = {
      complaintId,
      studentId: req.user._id,
      category,
      title,
      description,
      priority,
      status,
      assignedTo: '',
      image: image || '',
      document: document || '',
      location: location || 'Campus',
      isAnonymous: !!isAnonymous,
      feedback: '',
      rating: 0,
      adminRemarks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let complaint;
    if (global.useMockDB) {
      complaint = storageService.create('complaints', complaintData);
      complaint.student = { name: req.user.name, rollNumber: req.user.rollNumber };
    } else {
      const newComplaint = new Complaint(complaintData);
      const saved = await newComplaint.save();
      complaint = saved.toObject();
      complaint.student = { name: req.user.name, rollNumber: req.user.rollNumber };
    }

    const io = req.app.get('io');
    
    // In-App Notification
    await createNotification(
      req.user._id,
      'Complaint Registered',
      `Your complaint ${complaintId} has been successfully registered. Current Status: ${status}`,
      io
    );

    // Notify admins
    if (io) {
      io.to('admins').emit('admin-new-complaint', complaint);
      io.emit('dashboard-refresh');
    }

    res.status(201).json({
      complaint,
      aiAnalysis,
      message: aiAnalysis.isSpam 
        ? 'Complaint registered but flagged as spam and auto-rejected.' 
        : 'Complaint submitted successfully!'
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error submitting complaint', error: err.message });
  }
});

// @route   GET api/complaints
// @desc    Get all complaints (filtered)
router.get('/', auth, async (req, res) => {
  try {
    const { category, priority, status, department, search, date } = req.query;
    let list = [];

    if (global.useMockDB) {
      list = storageService.find('complaints');
      
      // Populate student details
      const users = storageService.find('users');
      list = list.map(c => {
        const u = users.find(usr => usr._id === c.studentId);
        return {
          ...c,
          student: u ? { name: u.name, rollNumber: u.rollNumber, email: u.email, department: u.department } : null
        };
      });

      // Filter by role
      if (req.user.role === 'student') {
        list = list.filter(c => c.studentId === req.user._id);
      }
    } else {
      let query = {};
      if (req.user.role === 'student') {
        query.studentId = req.user._id;
      }
      
      list = await Complaint.find(query).populate('studentId', 'name rollNumber email department');
      list = list.map(c => {
        const obj = c.toObject();
        obj.student = obj.studentId;
        delete obj.studentId;
        return obj;
      });
    }

    // Apply Query Filters
    if (category) {
      list = list.filter(c => c.category === category);
    }
    if (priority) {
      list = list.filter(c => c.priority === priority);
    }
    if (status) {
      list = list.filter(c => c.status === status);
    }
    if (department) {
      list = list.filter(c => c.student && c.student.department === department);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => 
        c.complaintId.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.student && c.student.name.toLowerCase().includes(q))
      );
    }
    if (date) {
      const targetDate = new Date(date).toDateString();
      list = list.filter(c => new Date(c.createdAt).toDateString() === targetDate);
    }

    // Sort descending by date
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(list);

  } catch (err) {
    res.status(500).json({ message: 'Server error fetching complaints', error: err.message });
  }
});

// @route   GET api/complaints/analytics/stats
// @desc    Get dashboard analytics counts and charts data
router.get('/analytics/stats', auth, async (req, res) => {
  try {
    let complaints = [];
    let users = [];

    if (global.useMockDB) {
      complaints = storageService.find('complaints');
      users = storageService.find('users');
      // Populate student details
      const allUsers = storageService.find('users');
      complaints = complaints.map(c => ({
        ...c,
        student: allUsers.find(u => u._id === c.studentId)
      }));
      
      if (req.user.role === 'student') {
        complaints = complaints.filter(c => c.studentId === req.user._id);
      }
    } else {
      let query = {};
      if (req.user.role === 'student') {
        query.studentId = req.user._id;
      }
      complaints = await Complaint.find(query).populate('studentId', 'department');
      complaints = complaints.map(c => {
        const obj = c.toObject();
        obj.student = obj.studentId;
        return obj;
      });
      users = await User.find();
    }

    // General counters
    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'Pending').length,
      underReview: complaints.filter(c => c.status === 'Under Review').length,
      assigned: complaints.filter(c => c.status === 'Assigned').length,
      inProgress: complaints.filter(c => c.status === 'In Progress').length,
      resolved: complaints.filter(c => c.status === 'Resolved').length,
      rejected: complaints.filter(c => c.status === 'Rejected').length,
      highPriority: complaints.filter(c => c.priority === 'High' || c.priority === 'Emergency').length,
      totalUsers: users.length,
      studentsCount: users.filter(u => u.role === 'student').length,
      adminsCount: users.filter(u => u.role === 'admin').length
    };

    // Department counts
    const deptMap = {};
    const statusMap = { Pending: 0, 'Under Review': 0, Assigned: 0, 'In Progress': 0, Resolved: 0, Rejected: 0 };
    
    complaints.forEach(c => {
      // Dept chart
      const deptName = (c.student && c.student.department) || 'General';
      deptMap[deptName] = (deptMap[deptName] || 0) + 1;
      
      // Status chart
      statusMap[c.status] = (statusMap[c.status] || 0) + 1;
    });

    const deptChartData = Object.keys(deptMap).map(k => ({ name: k, count: deptMap[k] }));
    const statusChartData = Object.keys(statusMap).map(k => ({ name: k, value: statusMap[k] }));

    // Monthly aggregation
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = monthNames[d.getMonth()];
      monthlyMap[mName] = 0;
    }

    complaints.forEach(c => {
      const cDate = new Date(c.createdAt);
      const mName = monthNames[cDate.getMonth()];
      if (monthlyMap[mName] !== undefined) {
        monthlyMap[mName]++;
      }
    });

    const monthlyChartData = Object.keys(monthlyMap).map(k => ({ month: k, count: monthlyMap[k] }));

    res.json({
      stats,
      deptChartData,
      statusChartData,
      monthlyChartData
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error fetching analytics', error: err.message });
  }
});

// @route   GET api/complaints/reports/excel
// @desc    Export complaints as excel sheet
router.get('/reports/excel', auth, async (req, res) => {
  try {
    let list = [];
    if (global.useMockDB) {
      list = storageService.find('complaints');
      const users = storageService.find('users');
      list = list.map(c => {
        const u = users.find(usr => usr._id === c.studentId);
        return {
          ...c,
          studentName: u ? u.name : 'Unknown',
          studentRoll: u ? u.rollNumber : 'N/A',
          studentDept: u ? u.department : 'N/A'
        };
      });
      if (req.user.role === 'student') {
        list = list.filter(c => c.studentId === req.user._id);
      }
    } else {
      let query = {};
      if (req.user.role === 'student') {
        query.studentId = req.user._id;
      }
      const dbList = await Complaint.find(query).populate('studentId', 'name rollNumber department');
      list = dbList.map(c => {
        const o = c.toObject();
        return {
          ...o,
          studentName: o.studentId ? o.studentId.name : 'Unknown',
          studentRoll: o.studentId ? o.studentId.rollNumber : 'N/A',
          studentDept: o.studentId ? o.studentId.department : 'N/A'
        };
      });
    }

    // Format data for sheet
    const sheetData = list.map(c => ({
      'Complaint ID': c.complaintId,
      'Title': c.title,
      'Category': c.category,
      'Priority': c.priority,
      'Status': c.status,
      'Student Name': c.studentName,
      'Roll Number': c.studentRoll,
      'Department': c.studentDept,
      'Location': c.location,
      'Assigned To': c.assignedTo || 'Unassigned',
      'Date Submitted': new Date(c.createdAt).toLocaleDateString(),
      'Rating': c.rating || 'N/A'
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(sheetData);
    xlsx.utils.book_append_sheet(wb, ws, 'Complaints Report');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=campus_complaints_report.xlsx');
    res.send(buffer);

  } catch (err) {
    res.status(500).json({ message: 'Error exporting Excel', error: err.message });
  }
});

// @route   GET api/complaints/reports/pdf
// @desc    Export complaints as PDF list
router.get('/reports/pdf', auth, async (req, res) => {
  try {
    let list = [];
    if (global.useMockDB) {
      list = storageService.find('complaints');
      const users = storageService.find('users');
      list = list.map(c => {
        const u = users.find(usr => usr._id === c.studentId);
        return {
          ...c,
          studentName: u ? u.name : 'Unknown',
          studentDept: u ? u.department : 'N/A'
        };
      });
      if (req.user.role === 'student') {
        list = list.filter(c => c.studentId === req.user._id);
      }
    } else {
      let query = {};
      if (req.user.role === 'student') {
        query.studentId = req.user._id;
      }
      const dbList = await Complaint.find(query).populate('studentId', 'name department');
      list = dbList.map(c => {
        const o = c.toObject();
        return {
          ...o,
          studentName: o.studentId ? o.studentId.name : 'Unknown',
          studentDept: o.studentId ? o.studentId.department : 'N/A'
        };
      });
    }

    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=campus_complaints_pdf_report.pdf');
    doc.pipe(res);

    // PDF Title
    doc.fontSize(20).text("Vignan's Institute of Information Technology", { align: 'center' });
    doc.fontSize(14).text("Campus Complaint Management System Report", { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated Date: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.text(`Total Records: ${list.length}`, { align: 'right' });
    doc.moveDown();

    doc.moveTo(30, doc.y).lineTo(580, doc.y).stroke();
    doc.moveDown();

    list.forEach((c, idx) => {
      doc.fontSize(12).fillColor('#b91c1c').text(`${idx + 1}. [${c.complaintId}] - ${c.title}`);
      doc.fontSize(10).fillColor('#000000');
      doc.text(`Category: ${c.category} | Priority: ${c.priority} | Status: ${c.status}`);
      doc.text(`Student: ${c.isAnonymous ? 'Anonymous' : c.studentName} | Department: ${c.studentDept}`);
      doc.text(`Description: ${c.description}`);
      if (c.adminRemarks) {
        doc.fillColor('#1e40af').text(`Admin Remarks: ${c.adminRemarks}`);
      }
      doc.moveDown();
      doc.moveTo(30, doc.y).lineTo(580, doc.y).strokeColor('#e5e7eb').stroke();
      doc.moveDown();
    });

    doc.end();

  } catch (err) {
    res.status(500).json({ message: 'Error exporting PDF', error: err.message });
  }
});

// @route   GET api/complaints/:id
// @desc    Get complaint details
router.get('/:id', auth, async (req, res) => {
  try {
    let complaint;
    if (global.useMockDB) {
      complaint = storageService.findById('complaints', req.params.id);
      if (complaint) {
        const u = storageService.findById('users', complaint.studentId);
        complaint.student = u ? { name: u.name, rollNumber: u.rollNumber, email: u.email, department: u.department } : null;
      }
    } else {
      complaint = await Complaint.findById(req.params.id).populate('studentId', 'name rollNumber email department');
    }

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Auth validation
    const ownerId = global.useMockDB ? complaint.studentId : (complaint.studentId?._id || complaint.studentId);
    if (req.user.role === 'student' && ownerId && ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: not your complaint' });
    }

    // Clean up format for frontend mapping
    if (!global.useMockDB && complaint.studentId) {
      const o = complaint.toObject();
      o.student = o.studentId;
      o.studentId = o.student?._id;
      complaint = o;
    }

    res.json(complaint);

  } catch (err) {
    res.status(500).json({ message: 'Server error fetching complaint details', error: err.message });
  }
});

// @route   PUT api/complaints/:id/status
// @desc    Update status and assignments of complaint (Admin only)
router.put('/:id/status', auth, admin, async (req, res) => {
  try {
    const { status, assignedTo, adminRemarks } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    let updated;
    const updateFields = { 
      status, 
      assignedTo: assignedTo || '', 
      adminRemarks: adminRemarks || '',
      updatedAt: new Date().toISOString()
    };

    if (global.useMockDB) {
      updated = storageService.updateById('complaints', req.params.id, updateFields);
    } else {
      updated = await Complaint.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true }
      );
    }

    if (!updated) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const io = req.app.get('io');
    
    // Notify Student
    await createNotification(
      updated.studentId,
      'Complaint Status Updated',
      `Your complaint ${updated.complaintId} has been updated to "${status}". Remarks: "${adminRemarks || 'None'}"`,
      io
    );

    if (io) {
      io.emit('dashboard-refresh');
    }

    res.json({ complaint: updated, message: 'Complaint updated successfully!' });

  } catch (err) {
    res.status(500).json({ message: 'Server error updating complaint', error: err.message });
  }
});

// @route   PUT api/complaints/:id/rate
// @desc    Submit rating/feedback for a resolved complaint (Student only)
router.put('/:id/rate', auth, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    if (!rating) {
      return res.status(400).json({ message: 'Rating is required' });
    }

    let complaint;
    if (global.useMockDB) {
      complaint = storageService.findById('complaints', req.params.id);
    } else {
      complaint = await Complaint.findById(req.params.id);
    }

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Verify ownership
    if (complaint.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: not your complaint' });
    }

    let updated;
    if (global.useMockDB) {
      updated = storageService.updateById('complaints', req.params.id, { rating, feedback });
    } else {
      complaint.rating = rating;
      complaint.feedback = feedback || '';
      const saved = await complaint.save();
      updated = saved.toObject();
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('dashboard-refresh');
    }

    res.json({ complaint: updated, message: 'Thank you for your rating and feedback!' });

  } catch (err) {
    res.status(500).json({ message: 'Server error rating complaint', error: err.message });
  }
});

// @route   DELETE api/complaints/:id
// @desc    Delete fake or spam complaint (Admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    let deleted = false;
    let complaint;

    if (global.useMockDB) {
      complaint = storageService.findById('complaints', req.params.id);
      if (complaint) {
        deleted = storageService.deleteById('complaints', req.params.id);
      }
    } else {
      complaint = await Complaint.findById(req.params.id);
      if (complaint) {
        await Complaint.findByIdAndDelete(req.params.id);
        deleted = true;
      }
    }

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('dashboard-refresh');
    }

    res.json({ message: `Complaint ${complaint.complaintId} deleted successfully.` });

  } catch (err) {
    res.status(500).json({ message: 'Server error deleting complaint', error: err.message });
  }
});

module.exports = router;
