
// const errorHandler = (err, req, res, next) => {
//     if (!err) next()
//   console.log(err)
//     if (req.headers.accept.includes('text/html')) next()
  
//     // de-construct stack variable
//     const { code, statusCode, message } = err
  
//     // winston.error(err)
  
//     let temp_m =
//       message.trim() == "Cannot read property 'settingValue' of undefined"
//         ? 'Invoice Printing not allowed'
//         : message
  
//     const errCode = code || 400
//     return res.status(errCode).jsend.error({
//       code: errCode,
//       message: temp_m || 'error',
//       data: null
//     })
//   }
const winston = require('winston');

// Configure winston logger
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log' })
  ]
});

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    message: err.message || 'Internal Server Error',
    stack: err.stack,
    path: req?.path,
    method: req?.method
  });

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: err.message,
        errors: err.errors
      }
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 401,
        message: 'Invalid token'
      }
    });
  }

  // Default error response
  const statusCode = err.code || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message: process.env.NODE_ENV === 'production' ? 'An error occurred' : message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
