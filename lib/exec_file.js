const fs = require('fs');
const beautify_css = require('./beautify_css');
const beautify_html = require('./beautify_html');
const beautify_js = require('./beautify_js');
const compress_css = require('./compress_css');
const compress_js = require('./compress_js');
const read_file = require('./read_file');

module.exports = (input, output, baseDir, unpack, type) => {
	if (/\.html?$/.test(input)) {
		if (unpack) {
			Out = beautify_html(read_file(input), type, input)
		}else{
			console.error("you cannot pack htm or html file, please use '-u' option for unpacking!!");
		}
	}else
	if (/\.js$/.test(input)) {
		if (unpack) {
			Out = beautify_js(read_file(input), type, input)
		}else{
			Out = compress_js(read_file(input), type, input)
		}
	}else
	if (/\.s?css$/.test(input)) {
		if (unpack) {
			Out = beautify_css(read_file(input), type)
		}else{
			Out = compress_css(input, type)
		}
	}
	if (Out) {
		if (output) {
			fs.writeFileSync(output, Out);
			var ok = unpack ? "uncompress" : "compressed";
			console.log("file has been "+ok+" to '"+output.replace(baseDir, "")+"'");
			return true;
		}else{
			console.log(Out);
		}
	}
	return false;
};
