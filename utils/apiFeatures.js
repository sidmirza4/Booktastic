class APIFeatures {
	constructor(query, queryStringsObj) {
		this.query = query;
		this.queryStringsObj = queryStringsObj;
	}

	filter() {
		const queryObj = { ...this.queryStringsObj };
		const excludedFields = ['page', 'sort', 'limit', 'fields'];
		excludedFields.forEach(el => delete queryObj[el]);

		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(
			/\b(gte|gt|lte|lt)\b/g,
			match => `$${match}`
		);

		this.query = this.query.find(JSON.parse(queryStr));

		return this;
	}

	sort() {
		if (this.queryStringsObj.sort) {
			const sortBy = this.queryStringsObj.sortBy.split(',').join(' ');
			this.query = this.query.sort(sortBy);
		} else {
			this.query = this.query.sort('-createdAt');
		}

		return this;
	}

	limitFields() {
		if (this.queryStringsObj.fields) {
			const fields = this.queryStringsObj.fields.split(',').join(' ');
			this.query = this.query.select(fields);
		} else {
			this.query = this.query.select('-__v');
		}

		return this;
	}

	paginate() {
		const page = this.queryStringsObj.page * 1 || 1;
		const limit = this.queryStringsObj.limit * 1 || 100;
		const skip = (page - 1) * limit;

		this.query = this.query.skip(skip).limit(limit);

		return this;
	}
}

module.exports = APIFeatures;
