const express = require('express');

const router = express.Router({ mergeParams: true });

const {
	getAllReviews,
	createReview,
	getReview,
	updateReview,
	deleteReview,
	setBookUserIds,
	isReviewAuthor,
} = require('../controllers/reviewController');
const { protect } = require('../controllers/authController');

router.use(protect);

router.route('/').get(getAllReviews).post(setBookUserIds, createReview);
router
	.route('/:id')
	.get(getReview)
	.patch(isReviewAuthor, updateReview)
	.delete(isReviewAuthor, deleteReview);

module.exports = router;
