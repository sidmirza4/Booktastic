const express = require('express');

const bookController = require('../controllers/bookController');
const { restrictTo } = require('../controllers/authController');

const router = express.Router();

router
	.route('/')
	.get(bookController.getAllBooks)
	.post(restrictTo('editor'), bookController.createBook);

router
	.route('/:id')
	.get(bookController.getBook)
	.patch(restrictTo('editor'), bookController.updateBook)
	.delete(restrictTo('admin'), bookController.deleteBook);

module.exports = router;
