const mongoose = require('mongoose');
const slugify = require('slugify');

const bookSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'A book must have a name'],
		trim: true,
		maxLength: [
			100,
			'A book cannot have title of more than 100 characters',
		],
		minLength: [3, 'book title must be at least 3 characters long'],
	},
	subtitle: String,
	createdAt: {
		type: Date,
		default: Date.now(),
		select: false,
	},

	isbn: { type: String, required: [true, 'A book must have an ISBN'] },
	pages: {
		type: String,
		required: [true, 'A book must have number of pages'],
	},

	cover: {
		url: { type: String, required: [true, 'A book must have a cover'] },
		publicId: String,
	},

	images: Array,

	genres: Array,

	downloadUrl: String,

	ratingsAverage: {
		type: Number,
		default: 4,
		min: [1, 'Rating must be above 1.0'],
		max: [5, 'Rating must be below 5.0'],
		set: val => Math.round(val * 10) / 10,
	},

	ratingsCount: {
		type: Number,
		default: 0,
	},

	authors: {
		type: Array,
		required: [true, 'a book must have one or more author(s)'],
	},
	publisher: {
		type: String,
		required: [true, 'A book must have a publisher'],
	},
	publishYear: { type: Number, required: [true, 'Publish year is required'] },
	description: {
		type: String,
		required: [true, 'a book must have a description'],
	},
	website: String,
	slug: {
		type: String,
		unique: true,
	},
});

bookSchema.index({ ratingsAverage: -1 });
bookSchema.index({ slug: 1 });

bookSchema.pre('save', function (next) {
	this.slug = slugify(this.title, { lower: true });
	next();
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
