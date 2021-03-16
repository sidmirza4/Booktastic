exports.filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach(key => {
		if (allowedFields.includes(key)) newObj[key] = obj[key];
	});
	return newObj;
};

exports.escapreRegExp = string => {
	return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\^$&');
};
