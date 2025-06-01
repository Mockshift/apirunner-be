const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

dotenv.config({ path: '.env' });
const app = require('./src/app');

const startServer = async () => {
  try {
    await connectDB();

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log('✅ Server is running on http://localhost:3000');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    throw error;
  }
};

startServer();
