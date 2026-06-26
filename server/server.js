const express = require('express'); 
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { initStorage } = require('./services/storageService');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config();

// Initialize Express & Create Server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
});

// Set global Socket.io instance
app.set('io', io);

// Connect to Database
connectDB().then(() => {
  if (!global.useMockDB) {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    User.countDocuments().then(count => {
      if (count === 0) {
        console.log('[Database] Seeding default users...');
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync('123456', salt);
        User.insertMany([
          {
            name: 'VIIT Principal Office',
            email: 'admin@vignan.edu',
            password: hash,
            role: 'admin',
            department: 'General',
            phone: '08912755111',
            photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin'
          },
          {
            name: 'Vignan Student Council',
            email: 'student@vignan.edu',
            password: hash,
            role: 'student',
            rollNumber: '22L31A0501',
            department: 'CSE',
            phone: '08912755222',
            photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Student'
          }
        ]).then(() => {
          console.log('[Database] Default users seeded successfully.');
        }).catch(err => {
          console.error('[Database] Seeding failed:', err.message);
        });
      }
    });

    const Department = require('./models/Department');
    Department.countDocuments().then(count => {
      if (count === 0) {
        console.log('[Database] Seeding default departments...');
        Department.insertMany([
          { name: 'Academic', head: 'Dr. A. K. Rao', email: 'academic.head@vignan.edu', phone: '+91 89127 55111', availability: '9:00 AM - 5:00 PM' },
          { name: 'Hostel', head: 'Prof. M. Prasad', email: 'hostel.warden@vignan.edu', phone: '+91 89127 55222', availability: '24/7 Helpline' },
          { name: 'Transport', head: 'Mr. S. Kumar', email: 'transport.incharge@vignan.edu', phone: '+91 89127 55333', availability: '8:00 AM - 6:00 PM' },
          { name: 'Library', head: 'Mrs. P. Shanti', email: 'librarian@vignan.edu', phone: '+91 89127 55444', availability: '8:00 AM - 8:00 PM' },
          { name: 'Examination', head: 'Dr. Y. Srinivas', email: 'coe@vignan.edu', phone: '+91 89127 55555', availability: '9:30 AM - 4:30 PM' },
          { name: 'WiFi & IT', head: 'Mr. K. Ravi', email: 'it.admin@vignan.edu', phone: '+91 89127 55666', availability: '9:00 AM - 5:30 PM' },
          { name: 'Security', head: 'Capt. R. Singh', email: 'security.head@vignan.edu', phone: '+91 89127 55777', availability: '24/7 Emergencies' }
        ]).then(() => {
          console.log('[Database] Default departments seeded successfully.');
        }).catch(err => {
          console.error('[Database] Departments seeding failed:', err.message);
        });
      }
    });
  }
});
initStorage();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support base64 image data upload
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static assets in client if they exist
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/departments', require('./routes/departments'));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: global.useMockDB ? 'JSON Fallback Mode' : 'Mongoose MongoDB Connected',
    time: new Date()
  });
});

// Error handling middleware
app.use(errorHandler);

// Socket.io Real-Time Synchronization
io.on('connection', (socket) => {
  console.log(`[Socket] New client connected: ${socket.id}`);

  // Join private room (User ID)
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`[Socket] Client ${socket.id} joined private room: ${userId}`);
  });

  // Join admin updates room
  socket.on('join-admins', () => {
    socket.join('admins');
    console.log(`[Socket] Client ${socket.id} joined admin updates room`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`SERVER RUNNING IN ${process.env.NODE_ENV || 'development'} MODE ON PORT ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Database Status: ${global.useMockDB ? 'OFFLINE FALLBACK (JSON MODE)' : 'ONLINE (MongoDB)'}`);
  console.log(`=========================================`);
});
