const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) {
    console.warn('[db] MONGODB_URI is not set — running without a database connection.');
    return null;
  }
  mongoose.set('strictQuery', true);
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[db] Connected to MongoDB at ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('[db] Connection failed:', err.message);
    throw err;
  }
}

module.exports = { connectDB };
