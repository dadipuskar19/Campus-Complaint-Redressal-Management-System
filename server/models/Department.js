const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  head: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  availability: {
    type: String,
    default: '9:00 AM - 5:00 PM'
  }
});

module.exports = mongoose.model('Department', DepartmentSchema);
