const express = require('express');

const bookController = require('../controllers/bookController');
const { restrictTo, protect } = require('../controllers/authController');

const router = express.Router();

router
	.route('/')
	.get(bookController.getAllBooks)
	.post(protect, restrictTo('editor', 'admin'), bookController.createBook);

router
	.route('/:id')
	.get(bookController.getBook)
	.patch(protect, restrictTo('editor', 'admin'), bookController.updateBook)
	.delete(protect, restrictTo('admin'), bookController.deleteBook);

module.exports = router;
