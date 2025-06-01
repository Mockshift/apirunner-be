const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const DB = process.env.MONGO_DB_URL.replace('<PASSWORD>', process.env.MONGO_DB_PASSWORD);
    const conn = await mongoose.connect(DB, {});

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ DB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
