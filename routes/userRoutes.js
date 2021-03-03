const express = require('express');

const {
	signup,
	login,
	logout,
	protect,
	restrictTo,
} = require('../controllers/authController');
const {
	getAllUsers,
	createUser,
	getUser,
	updateUser,
	deleteUser,
	getMe,
	updateMe,
	deleteMe,
	uploadUserPhoto,
} = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

// protect all routes below this line
router.use(protect);
router.get('/me', getMe, getUser);
router.patch('/updateMe', uploadUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);

// restrict all routes below this to admin only
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
