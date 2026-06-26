const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure files exist
const initializeFile = (fileName, defaultData = []) => {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
  }
};

const bcrypt = require('bcryptjs');

const initStorage = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  initializeFile('departments.json', [
    { name: 'Academic', head: 'Dr. A. K. Rao', email: 'academic.head@vignan.edu', phone: '+91 89127 55111', availability: '9:00 AM - 5:00 PM' },
    { name: 'Hostel', head: 'Prof. M. Prasad', email: 'hostel.warden@vignan.edu', phone: '+91 89127 55222', availability: '24/7 Helpline' },
    { name: 'Transport', head: 'Mr. S. Kumar', email: 'transport.incharge@vignan.edu', phone: '+91 89127 55333', availability: '8:00 AM - 6:00 PM' },
    { name: 'Library', head: 'Mrs. P. Shanti', email: 'librarian@vignan.edu', phone: '+91 89127 55444', availability: '8:00 AM - 8:00 PM' },
    { name: 'Examination', head: 'Dr. Y. Srinivas', email: 'coe@vignan.edu', phone: '+91 89127 55555', availability: '9:30 AM - 4:30 PM' },
    { name: 'WiFi & IT', head: 'Mr. K. Ravi', email: 'it.admin@vignan.edu', phone: '+91 89127 55666', availability: '9:00 AM - 5:30 PM' },
    { name: 'Security', head: 'Capt. R. Singh', email: 'security.head@vignan.edu', phone: '+91 89127 55777', availability: '24/7 Emergencies' }
  ]);

  // Seed default admin and student if empty
  const usersPath = path.join(DATA_DIR, 'users.json');
  if (!fs.existsSync(usersPath) || JSON.parse(fs.readFileSync(usersPath, 'utf8')).length === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('123456', salt);
    const defaultUsers = [
      {
        _id: 'admin123',
        name: 'VIIT Principal Office',
        email: 'admin@vignan.edu',
        password: hash,
        role: 'admin',
        department: 'General',
        phone: '08912755111',
        photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'student123',
        name: 'Vignan Student Council',
        email: 'student@vignan.edu',
        password: hash,
        role: 'student',
        rollNumber: '22L31A0501',
        department: 'CSE',
        phone: '08912755222',
        photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(usersPath, JSON.stringify(defaultUsers, null, 2), 'utf8');
  }

  initializeFile('users.json');
  initializeFile('complaints.json');
  initializeFile('notifications.json');
};

initStorage();

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

const readCollection = (collection) => {
  try {
    const filePath = getFilePath(collection);
    if (!fs.existsSync(filePath)) {
      initializeFile(`${collection}.json`);
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading collection ${collection}:`, err);
    return [];
  }
};

const writeCollection = (collection, data) => {
  try {
    const filePath = getFilePath(collection);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing collection ${collection}:`, err);
    return false;
  }
};

const storageService = {
  find: (collection, filterFn = () => true) => {
    const list = readCollection(collection);
    return list.filter(filterFn);
  },

  findOne: (collection, filterFn) => {
    const list = readCollection(collection);
    return list.find(filterFn);
  },

  findById: (collection, id) => {
    const list = readCollection(collection);
    return list.find(item => item._id === id || item.id === id);
  },

  create: (collection, item) => {
    const list = readCollection(collection);
    const newItem = {
      _id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item
    };
    list.push(newItem);
    writeCollection(collection, list);
    return newItem;
  },

  update: (collection, filterFn, updateData) => {
    const list = readCollection(collection);
    let updatedItem = null;
    const newList = list.map(item => {
      if (filterFn(item)) {
        updatedItem = {
          ...item,
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        return updatedItem;
      }
      return item;
    });
    writeCollection(collection, newList);
    return updatedItem;
  },

  updateById: (collection, id, updateData) => {
    return storageService.update(collection, item => (item._id === id || item.id === id), updateData);
  },

  delete: (collection, filterFn) => {
    const list = readCollection(collection);
    const filtered = list.filter(item => !filterFn(item));
    writeCollection(collection, filtered);
    return list.length !== filtered.length;
  },

  deleteById: (collection, id) => {
    return storageService.delete(collection, item => (item._id === id || item.id === id));
  }
};

module.exports = { storageService, initStorage };
