const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

const signToken = id =>
	jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});

const createSendToken = (user, statusCode, req, res) => {
	const token = signToken(user._id);

	res.cookie('jwt', token, {
		maxAge: parseInt(process.env.JWT_EXPIRES_IN, 10),
		httpOnly: true,
		secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
	});

	user.password = undefined;

	res.status(statusCode).json({
		status: 'success',
		token,
		data: { email: user.email, name: user.name, image: user.image },
	});
};

exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
	});

	// logging user in after signing up
	createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password)
		return next(new AppError('Please provide email and password', 400));

	const user = await User.findOne({ email }).select('+password');

	if (!user || !(await user.isPasswordCorrect(password, user.password))) {
		return next(new AppError('Email or password is incorrect', 401));
	}

	createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
	res.cookie('jwt', 'loggedOut', {
		maxAge: 1000,
		httpOnly: true,
	});
	res.status(200).json({ status: 'success' });
};

exports.updatePassword = catchAsync(async (req, res, next) => {
	const { currentPassword, newPassword, confirmPassword } = req.body;
	const user = await User.findById(req.user.id).select('+password');
	if (!user) return new AppError('Something went wrong', 404);
	const isPasswordCorrect = await user.isPasswordCorrect(
		currentPassword,
		user.password
	);
	if (!isPasswordCorrect)
		return next(
			new AppError('Please enter current password correctly', 401)
		);

	user.password = newPassword;
	user.passwordConfirm = confirmPassword;
	await user.save();

	createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
	}

	if (!token) return next(new AppError('You are not logged in...', 401));

	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	const currentUser = await User.findById(decoded.id);

	if (!currentUser)
		return next(new AppError('The user no longer exists', 400));

	// iat == issued at.
	if (currentUser.changedPasswordAfter(decoded.iat)) {
		return next(
			new AppError(
				'User recently changed password, please login again.',
				401
			)
		);
	}

	req.user = currentUser;
	next();
});

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(new AppError('You do not have permission', 403));
		}
		next();
	};
};
