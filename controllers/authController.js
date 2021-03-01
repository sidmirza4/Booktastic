const jwt = require('jsonwebtoken');

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
		expires: new Date(
			Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
		secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
	});

	user.password = undefined;

	res.status(statusCode).json({
		status: 'success',
		token,
		data: user,
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
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});
	res.status(200).json({ status: 'success' });
};
