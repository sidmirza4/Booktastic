const AppError = require('../utils/appError');

const handleMulterError = err => {
	const message = `${err.field} can only have one image.`;

	return new AppError(message, 400);
};

const handleCastErrorDB = err => {
	const message = `Invalid ${err.path}: ${err.value}.`;

	return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
	const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

	const message = `Duplicate field value: ${value}. Please use another one.`;
	return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
	const errors = Object.values(err.errors).map(el => el.message);

	const message = `Invalid input data. ${errors.join('. ')}`;
	return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
	return res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
	});
};

const sendErrorProd = (err, req, res) => {
	if (err.isOperational) {
		return res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	}

	return res.status(500).json({
		status: 'error',
		message: 'something went wrong',
	});
};

const handleJWTError = () =>
	new AppError('Invalid token, please login again.', 401);
const handleJWTExpired = () =>
	new AppError('Session has expired, please login again.', 401);

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, req, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = { ...err };
		error.message = err.message;

		if (error.name === 'CastError') error = handleCastErrorDB(error);
		if (error.code === 11000) error = handleDuplicateFieldsDB(error);
		if (error.name === 'ValidationError')
			error = handleValidationErrorDB(error);
		if (error.name === 'JsonWebTokenError') error = handleJWTError();
		if (error.name === 'TokenExpiredError') error = handleJWTExpired();
		if (error.code === 'LIMIT_UNEXPECTED_FILE')
			error = handleMulterError(error);
		sendErrorProd(error, req, res);
	}
};
