const JSUglify = require("uglify-js");
const JSPacker = require("./packer");

module.exports = (input, type=0, filename="") => {
	var out = input;
	switch(type) {
		case 1: // uglify-js
			cmp = JSUglify.minify(out, {
				compress: true,
				mangle: true,
				output: {
					ast: true,
					code: true
				}
			});
			if (cmp.error) {
				console.error(filename, cmp.error)
			}
			if (cmp.code) {
				out = cmp.code;
			}
			break;
		case 2: // compress
			if (filename) {
				cmp = JSUglify.minify(out, {
					compress: false,
					mangle: true,
					output: {
						ast: true,
						code: true
					}
				});
				if (cmp.error) {
					console.error([filename, cmp.error])
				}
				if (cmp.code) {
					out = JSPacker.pack(cmp.code, base62=true, shrink=false);
				}
			}else{
				out = JSPacker.pack(out, base62=true, shrink=true);
			}
			break;
	}
	return out;
};