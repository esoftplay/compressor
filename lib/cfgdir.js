const fs = require('fs')

module.exports = (file, baseDir) => {
	if (file.substr(0,1)=='/') {
		out = file;
	}else
	if (file.substr(0,2)=='./') {
		out = baseDir+file.substr(2);
	}else{
		out = baseDir+file;
	}
	if (fs.existsSync(out.replace(/\*+$/, ""))) {
		return out;
	}else{
		console.error(file+" is not found!");
		return "";
	}
};