const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const { ERROR_CODES } = require('./constants/errorCodes');

const app = express();

// * MIDDLEWARES
// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware to parse incoming JSON requests
app.use(express.json({ limit: '10kb' }));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// * ROUTES
app.use('/api/v1/users', userRouter);

// For all unspecified routes
app.all('*', (req, _res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server!`,
      404,
      ERROR_CODES.ROUTES.ROUTE_NOT_FOUND,
    ),
  );
});

// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;
