const mongoose = require('mongoose');

const Book = require('./bookModel');

const reviewSchema = new mongoose.Schema({
	review: {
		type: String,
		required: [true, 'Review cannot be empty.'],
	},

	rating: {
		type: Number,
		required: [true, 'A review must have a rating.'],
		min: 1,
		max: 5,
	},

	createdAt: { type: Date, default: Date.now() },

	book: {
		type: mongoose.Schema.ObjectId,
		ref: 'Book',
		required: [true, 'A review must belong to a book'],
	},

	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: [true, 'A review must belong to a user'],
	},
});

reviewSchema.pre(/^find/, function (next) {
	this.populate({ path: 'user', select: 'name image' });
	next();
});

reviewSchema.statics.calcAverageRating = async function (bookId) {
	// in static method this keyword points to the model but not to the document

	const stats = await this.aggregate([
		{
			$match: { book: bookId },
		},
		{
			$group: {
				_id: '$book',
				nRatings: { $sum: 1 },
				avgRating: { $avg: '$rating' },
			},
		},
	]);

	if (stats.length > 0) {
		await Book.findByIdAndUpdate(bookId, {
			ratingsCount: stats[0].nRatings,
			ratingsAverage: stats[0].avgRating,
		});
	} else {
		await Book.findByIdAndUpdate(bookId, {
			ratingsCount: 0,
			ratingsAverage: 4,
		});
	}
};

module.exports = mongoose.model('Review', reviewSchema);
