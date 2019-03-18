const fs = require('fs')
const ncp = require('ncp').ncp
const uglifycss = require('uglifycss')
const uglifyjs = require('uglify-js')
const cfgdir = require('./cfgdir')
const compress_js = require('./compress_js')
const read_file = require('./read_file')
const write_file = require('./write_file')

module.exports = (cfg, baseDir) => {
	var filepath = "";
	var output = [];
	/* CSS */
	var css = [];
	var pathDest = cfg.dest.path+"css/";
	for (var i = 0; i < cfg.css.length; i++) {
		filepath = cfgdir(cfg.css[i], baseDir);
		if (filepath) {
			css.push(filepath)
			output.push(filepath)
		}
	}
	for (var i = 0; i < cfg.scss.length; i++) {
		filepath = cfgdir(cfg.scss[i], baseDir);
		if (filepath) {
			css.push(filepath)
			output.push(filepath)
		}
	}
	if (css.length) {
		console.log('...compress styles...');
		fs.mkdirSync(pathDest, {recursive: true, mode: 0755});
		write_file(
		           pathDest+cfg.dest.css,
		           uglifycss.processFiles(css, { maxLineLen: 0, expandVars: cfg.jscompress==2?true:false, uglyComments: true })
		           );
	}

	/* JavaScript */
	if (cfg.js.length) {
		var jses = "";
		pathDest = cfg.dest.path+"js/";
		console.log('...compress javascripts...');
		for (var i = 0; i < cfg.js.length; i++) {
			filepath = cfgdir(cfg.js[i], baseDir);
			if (filepath) {
				output.push(filepath)
				jscript = read_file(filepath);
				tmpcode = "";
				cmp = uglifyjs.minify(jscript, {
					compress: true,
					mangle: true,
					output: {
						ast: true,
						code: true
					}
				});
				if (cmp.error) {
					console.error([filepath, cmp.error])
				}
				if (cmp.code) {
					tmpcode = cmp.code.trim();
				}else{
					tmpcode = jscript;
				}
				if (tmpcode.length) {
					if (!/\;$/.test(tmpcode)) {
						tmpcode += ';';
					}
				}
				jses += tmpcode;
			}
		}
		if (jses) {
			fs.mkdirSync(pathDest, {recursive: true, mode: 0755});
			jses = compress_js(jses, cfg.jscompress);
			write_file(pathDest+cfg.dest.js, jses);
		}
	}

	/* FONTs */
	if (cfg.font.length) {
		console.log('...copying fonts...');
		pathDest = cfg.dest.path+"fonts/";
		fs.mkdirSync(pathDest, {recursive: true, mode: 0755});
		for (var i = 0; i < cfg.font.length; i++) {
			filepath = cfgdir(cfg.font[i], baseDir);
			if (filepath) {
				output.push(filepath.replace(/\*+$/, ""))
				var ilength = filepath.length;
				if (filepath.substr(-2)=="**") {
					ncp(filepath.substr(0, ilength-2), pathDest);
				}else
				if (filepath.substr(-1)=="*") {
					curDir = filepath.substr(0, ilength-1);
					files = fs.readdirSync(curDir);
					for (var j = 0; j < files.length; j++) {
						file = files[j]
						if (file!="." && file!="..") {
							if (fs.statSync(curDir+file).isFile()) {
								fs.copyFile(curDir+file, pathDest+file, (err) => {
									if (err) throw err;
								});
							}
						}
					}
				}else{
					filename = filepath.replace(/^.*?([^\/]+)$/, "$1");
					fs.copyFile(filepath, pathDest+filename, (err) => {
						if (err) throw err;
					});
				}
			}
		}
	}

	/* COPY */
	if (cfg.copy) {
		for(key in cfg.copy) {
			files = cfg.copy[key];
			if (files.length) {
				console.log("...copying "+key+"...");
				if (key.substr(0,1)=="/") {
					key = key.substr(1);
				}
				pathDest = cfg.dest.path+key+"/";
				fs.mkdirSync(pathDest, {recursive: true, mode: 0755});
				for (var i = 0; i < files.length; i++) {
					curFile = files[i];
					// if it's a string not an object
					if (typeof curFile == "string") {
						curFile = cfgdir(curFile, baseDir);
						if (curFile) {
							output.push(curFile.replace(/\*+$/, ""))
							var ilength = curFile.length;
							// copy directory recursively
							if (curFile.substr(-3)=="/**") {
								ncp(curFile.substr(0, ilength-2), pathDest);
							}else
							// copy only files inside directory
							if (curFile.substr(-2)=="/*") {
								curDir = curFile.substr(0, ilength-1);
								files = fs.readdirSync(curDir);
								for (var j = 0; j < files.length; j++) {
									file = files[j]
									if (file!="." && file!="..") {
										if (fs.statSync(curDir+file).isFile()) {
											fs.copyFile(curDir+file, pathDest+file, (err) => {
												if (err) throw err;
											});
										}
									}
								}
							}else{
								// copy normal file
								filename = curFile.replace(/^.*?([^\/]+)$/, "$1");
								fs.copyFile(curFile, pathDest+filename, (err) => {
									if (err) throw err;
								});
							}
						}
					}else{
						// if it's an object not a string
						for(destname in curFile) {
							srcFile = cfgdir(curFile[destname], baseDir);
							if (srcFile) {
								output.push(srcFile)
								dstFile = pathDest+destname;
								switch(key) {
									case "css":
										source = uglifycss.processFiles([srcFile], { maxLineLen: 0, expandVars: cfg.jscompress==2?true:false, uglyComments: true });
										write_file(dstFile, source);
										break;
									case "js":
										source = compress_js(read_file(srcFile), cfg.jscompress, srcFile);
										write_file(dstFile, source);
										break;
									default:
										fs.copyFile(srcFile, dstFile, (err) => {
											if (err) throw err;
										});
										break;
								}
							}
						}
					}
				}
			}
		}
	}
	return output;
};