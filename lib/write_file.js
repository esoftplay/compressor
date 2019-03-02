const fs = require('fs')

module.exports = (file, data) => {
	if (data) {
		path = file.replace(/[^\/\\]+$/i, "");
		fs.mkdirSync(path, {recursive: true, mode: 0755});
		fs.writeFileSync(file, data);
	}else{
		console.warn('data result is empty...');
	}
};