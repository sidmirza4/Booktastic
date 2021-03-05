const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const {
	getAll,
	getOne,
	createOne,
	updateOne,
	deleteOne,
} = require('./factory');

exports.setBookUserIds = (req, res, next) => {
	if (!req.body.book) req.body.book = req.params.bookId;
	if (!req.body.user) req.body.user = req.user.id;
	next();
};

exports.isReviewAuthor = catchAsync(async (req, res, next) => {
	const review = await Review.findById(req.params.id);

	if (review.user.equals(req.user.id) || req.user.role === 'admin')
		return next();

	return next(new AppError('You do not have permission', 401));
});

exports.getAllReviews = getAll(Review);
exports.getReview = getOne(Review);
exports.createReview = createOne(Review);
exports.updateReview = updateOne(Review);
exports.deleteReview = deleteOne(Review);
