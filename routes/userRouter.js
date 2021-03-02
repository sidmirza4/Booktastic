const express = require('express');

const {
	signup,
	login,
	logout,
	protect,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', protect, logout);

module.exports = router;
