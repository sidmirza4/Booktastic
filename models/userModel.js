const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, 'Please provide your email address'],
		trim: true,
		validate: [validator.isEmail, 'Please provide a valid email address'],
		unique: true,
		lowercase: true,
	},

	name: {
		type: String,
		required: [true, 'Please provide us a name'],
		trim: true,
	},

	role: {
		type: String,
		enum: ['admin', 'user', 'editor'],
		defaul: 'user',
	},

	password: {
		type: String,
		required: [true, 'Please provide a password'],
		trim: true,
		minlength: 8,
		select: false,
	},

	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password'],
		trim: true,
		validate: {
			validator: function (value) {
				return value === this.password;
			},
			message: 'Passwords are not same',
		},
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
	active: {
		type: Boolean,
		default: true,
		select: false,
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
});

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	this.password = await bcrypt.hash(this.password, 12);

	this.passwordConfirm = undefined;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
