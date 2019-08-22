// Handles operational errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Flag to distinguis between operational errors and other errors (programming errors, 3rd party modules etc.)

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
