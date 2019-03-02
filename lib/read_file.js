const fs = require('fs')

module.exports = (file) => {
	var out =  fs.readFileSync(file, "utf8");
	var reg = [
		/\/\*[\s\S]*?\*\//gm,
		// /([^\\:]|^)\/\/.*$/gm // kadang ada comment di dalam string
		];
	for (var i = 0; i < reg.length; i++) {
		out = out.replace(reg[i], "");
	}
	out = out.trim();
	return out;
};