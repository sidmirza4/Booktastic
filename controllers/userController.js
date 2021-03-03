const { uploader } = require('cloudinary').v2;
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const { getAll, getOne, updateOne, deleteOne } = require('./factory');
const catchAsync = require('../utils/catchAsync');
const { filterObj } = require('../utils/utilities');
const { upload, dataUri } = require('../middlewares/multer');

exports.getAllUsers = getAll(User);
exports.getOneUser = getOne(User);
exports.createUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not defined! Please use /signup instead',
	});
};
exports.getMe = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};

exports.uploadUserPhoto = upload.single('image');

exports.updateMe = catchAsync(async (req, res, next) => {
	if (req.body.password || req.body.passwordConfirm)
		next(
			new AppError(
				'You cannot change password through this route, please use /updateMyPassword',
				400
			)
		);

	const filteredBody = filterObj(req.body, 'email', 'name');

	if (req.file) {
		const file = dataUri(req).content;
		const image = await uploader.upload(file, {
			folder: 'books/users_images',
			public_id: `${req.user.id}`,
		});
		filteredBody.image = image.url;
	}

	const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		status: 'success',
		data: updateUser,
	});
});

exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false });

	res.status(204).json({
		status: 'success',
		data: null,
	});
});

exports.getUser = getOne(User);
exports.updateUser = updateOne(User);
exports.deleteUser = deleteOne(User);
