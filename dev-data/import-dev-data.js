const fs = require('fs');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../src/models/userModel');

dotenv.config({ path: './.env' });

// READ JSON FILE
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const importData = async () => {
  try {
    connectDB();

    await User.create(users);

    console.log('💥 DATA succesfully loaded!');

    disconnectDB();
  } catch (error) {
    disconnectDB();
    console.error(`❌ ${error.message}`);
    throw error;
  }
};

const deleteData = async () => {
  try {
    connectDB();

    await User.deleteMany();

    console.log('💥 DATA succesfully deleted!');

    disconnectDB();
  } catch (error) {
    disconnectDB();

    console.error(`❌ ${error.message}`);
    throw error;
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
