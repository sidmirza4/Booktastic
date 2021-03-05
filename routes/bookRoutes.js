const express = require('express');

const bookController = require('../controllers/bookController');
const reviewRoutes = require('./reviewRoutes');
const { restrictTo, protect } = require('../controllers/authController');

const router = express.Router();

router.use('/:bookId/reviews', reviewRoutes);

router
	.route('/')
	.get(bookController.getAllBooks)
	.post(
		protect,
		restrictTo('editor', 'admin'),
		bookController.processBookImages,
		bookController.uploadBookImages,
		bookController.createBook
	);

router
	.route('/:id')
	.get(bookController.getBook)
	.patch(protect, restrictTo('editor', 'admin'), bookController.updateBook)
	.delete(
		protect,
		restrictTo('admin'),
		bookController.deleteImagesFromCloudinary,
		bookController.deleteBook
	);

module.exports = router;
