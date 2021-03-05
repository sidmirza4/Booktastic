const { uploader, api } = require('cloudinary').v2;
const factory = require('./factory');
const Book = require('../models/bookModel');
const catchAsync = require('../utils/catchAsync');
const { upload, dataUri } = require('../middlewares/multer');
const AppError = require('../utils/appError');

exports.getAllBooks = factory.getAll(Book);
exports.getBook = factory.getOne(Book);

exports.processBookImages = upload.fields([
	{ name: 'cover', maxCount: 1 },
	{ name: 'images' },
]);

exports.uploadBookImages = catchAsync(async (req, res, next) => {
	if (!req.files) return next();
	if (!req.files.cover || !req.files.images) return next();

	// cover images
	const coverImageFile = dataUri(req.files.cover[0].buffer).content;
	const coverImage = await uploader.upload(coverImageFile, {
		folder: 'books/cover',
		public_id: `${req.body.title}-cover`,
	});
	req.body.cover = { url: coverImage.url, publicId: coverImage.public_id };

	// images
	req.body.images = [];
	const filesArray = req.files.images.map(
		file => dataUri(file.buffer).content
	);

	const imagesArray = [];
	await Promise.all(
		filesArray.map(async (image, i) => {
			imagesArray.push(
				await uploader.upload(image, {
					folder: 'books/books_images',
					public_id: `${req.body.title}-image-${i + 1}`,
				})
			);
		})
	);

	imagesArray.forEach(image =>
		req.body.images.push({ url: image.url, publicId: image.public_id })
	);

	next();
});

exports.deleteImagesFromCloudinary = catchAsync(async (req, res, next) => {
	const book = await Book.findById(req.params.id);
	if (!book) return next(new AppError('No book found with that id.'));

	const publicIds = book.images.map(image => image.publicId);
	publicIds.push(book.cover.publicId);
	await api.delete_resources(publicIds);
	next();
});

exports.createBook = factory.createOne(Book);
exports.updateBook = factory.updateOne(Book);
exports.deleteBook = factory.deleteOne(Book);
