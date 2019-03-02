const uglifycss = require('uglifycss');

module.exports = (input, type=0) => {
	var out = "";
	if (/\.s?css$/.test(input)) {
		out = uglifycss.processFiles([input], { maxLineLen: 0, expandVars: true, uglyComments: true });
	}
	return out;
};