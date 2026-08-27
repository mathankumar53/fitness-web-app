const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI || mongoURI.trim() === '' || mongoURI.includes('YOUR_MONGODB_ATLAS')) {
    console.log('\n=============================================================');
    console.log('⚠️ MONGODB_URI is not set in .env or contains default placeholder.');
    console.log('💡 The server will start in DEMO / HYBRID MEMORY MODE.');
    console.log('   All API endpoints will work seamlessly for testing/presentation!');
    console.log('   To connect to your live MongoDB Atlas database, update .env file.');
    console.log('=============================================================\n');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // Fast timeout if IP/connection is blocked
    });
    isConnected = true;
    console.log(`\n✅ MongoDB Atlas Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.error(`\n❌ MongoDB Atlas Connection Failed: ${err.message}`);
    console.log('💡 Falling back to In-Memory Demo Storage for testing.\n');
    isConnected = false;
    return false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
