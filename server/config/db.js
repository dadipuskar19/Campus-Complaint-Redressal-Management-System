const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

global.useMockDB = false;

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  
  // Try custom URI, then IPv4 loopback, then localhost (IPv6/OS resolver)
  const connStrings = [];
  if (primaryUri) connStrings.push(primaryUri);
  connStrings.push('mongodb://127.0.0.1:27017/campus_complaints');
  connStrings.push('mongodb://localhost:27017/campus_complaints');

  const maxRetries = 3;
  const retryInterval = 1000;

  for (const connStr of connStrings) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Database] Attempting MongoDB connection to ${connStr} (Attempt ${attempt}/${maxRetries})...`);
        
        const conn = await mongoose.connect(connStr, {
          serverSelectionTimeoutMS: 2000,
        });
        
        console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
        global.useMockDB = false;
        return; // Connection succeeded, exit
      } catch (err) {
        console.warn(`[Database] Connection to ${connStr} failed: ${err.message}`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryInterval));
        }
      }
    }
  }

  // If all connections fail, activate JSON DB fallback
  console.warn(`[Database] All MongoDB connection attempts failed. Activating FALLBACK: Local JSON Database Mode.`);
  global.useMockDB = true;
  
  // Ensure the data directory exists for JSON fallback
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

module.exports = connectDB;
