const mongoose = require('mongoose');
const slugify = require('slugify');

const bookSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'A book must have a name'],
		trim: true,
		unique: true,
		maxLength: [100, 'A book cannot have title of more than 100 characters'],
		minLength: [3, 'book title must be at least 3 characters long'],
	},
	createdAt: {
		type: Date,
		default: Date.now(),
		select: false,
	},
	authors: {
		type: Array,
		required: [true, 'a book must have one or more author(s)'],
	},
	description: {
		type: String,
		required: [true, 'a book must have a description'],
	},
	slug: {
		type: String,
		required: true,
		unique: true,
	},
});

bookSchema.pre('save', function (next) {
	this.slug = slugify(this.title, { lower: true });
	next();
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
