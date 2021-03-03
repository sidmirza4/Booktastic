const multer = require('multer');
const path = require('path');
const DataUriPasrser = require('datauri/parser');

const AppError = require('../utils/appError');

const dUri = new DataUriPasrser();

const storage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else cb(new AppError('Please upload image file only', 400), false);
};

exports.upload = multer({
	storage: storage,
	fileFilter: multerFilter,
});

exports.dataUri = buffer => {
	return dUri.format('.jpg', buffer);
};
