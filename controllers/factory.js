const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getAll = Model => {
	return catchAsync(async (req, res, next) => {
		let filter = {};
		// for the nested review route
		if (req.params.bookId) filter = { book: req.params.bookId };

		const features = new APIFeatures(Model.find(filter), req.query)
			.filter()
			.sort()
			.limitFields()
			.paginate();

		const docs = await features.query;

		res.status(200).json({
			status: 'success',
			results: docs.length,
			data: docs,
		});
	});
};

exports.createOne = Model =>
	catchAsync(async (req, res, next) => {
		const newDoc = await Model.create(req.body);

		res.status(201).json({
			status: 'success',
			data: newDoc,
		});
	});

exports.getOne = Model =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findById(req.params.id);

		if (!doc) return next(new AppError('No document found with that id'));

		res.json({
			status: 'success',
			data: doc,
		});
	});

exports.updateOne = Model =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});

		if (!doc)
			return next(new AppError('No document found with that ID', 404));

		res.status(200).json({
			status: 'success',
			data: doc,
		});
	});

exports.deleteOne = Model =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id);

		if (!doc)
			return next(new AppError('No document found with that ID', 404));

		res.status(204).json({
			status: 'success',
		});
	});
