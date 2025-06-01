const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });
const app = require('./app');

const DB = process.env.MONGO_DB_URL.replace('<PASSWORD>', process.env.MONGO_DB_PASSWORD);

mongoose.connect(DB, {}).then(() => console.log('DB connection succesful!'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server is running on http://localhost:3000');
});
