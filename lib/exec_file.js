const fs = require('fs');
const compress_js = require('./compress_js');
const read_file = require('./read_file');
const compress_css = require('./compress_css');

module.exports = (input, output, type, baseDir) => {
	if (/\.js$/.test(input)) {
		Out = compress_js(read_file(input), type, input)
	}else
	if (/\.s?css$/.test(input)) {
		Out = compress_css(input, type)
	}
	if (Out) {
		if (output) {
			fs.writeFileSync(output, Out);
			console.log("file has been compressed to '"+output.replace(baseDir, "")+"'");
			return true;
		}else{
			console.log(Out);
		}
	}
	return false;
};
