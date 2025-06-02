const express = require('express');
const userRouter = require('./routes/userRoutes');

const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json({ limit: '10kb' }));

// * ROUTES
app.use('/api/v1/users', userRouter);

module.exports = app;
