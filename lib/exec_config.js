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

	/* SCRIPT BEFORE */
	if (cfg.script) {
		if (cfg.script.before) {
			var sys = require('util')
			var exec = require('child_process').exec;
			// code script
			if (cfg.script.before.code) {
				dir = exec(cfg.script.before.code, function(err, stdout, stderr) {
					if (err) {
						console.error(err)
					}
					if (stdout) {
						console.log(stdout)
					}
				});
			}
			// file script
			if (cfg.script.before.file) {
				script = cfg.script.before.file;
				if (script.substr(0,1)=="/") {
					srcScript = script;
				}else{
					scripts = script.split("../");
					scriptLength = scripts.length;
					if (scriptLength==1) {
						srcScript = cfg.dest.path+script;
					}else{
						srcScript = cfg.dest.path;
						for(var i=1; i < scriptLength;i++) {
							srcScript = srcScript.replace(/[^\/]+\/$/, "");
						}
						srcScript += scripts[scriptLength-1];
					}
				}
				if (fs.existsSync(srcScript)) {
					var doit = "";
					var format = srcScript.match(/\.([^\.]+)/);
					if (format[1]) {
						switch(format[1].toLowerCase()) {
							case 'js':
								doit = "node ";
								break;
							default:
								doit = format[1].toLowerCase()+" ";
								break;
						}
					}
					dir = exec(doit+srcScript, function(err, stdout, stderr) {
						if (err) {
							console.error(err)
						}
						if (stdout) {
							console.log(stdout)
						}
					});
				}
			}
		}
	}

	/* CSS */
	var css = [];
	var scss = [];
	var outcss="";
	var pathDest = cfg.dest.path+"css/";
	// normal css
	if (cfg.css.length) {
		for (var i = 0; i < cfg.css.length; i++) {
			filepath = cfgdir(cfg.css[i], baseDir);
			if (filepath) {
				css.push(filepath)
				output.push(filepath)
			}
		}
	}
	// compile sass
	if (cfg.scss.length) {
		var sass = require('node-sass');
		for (var i = 0; i < cfg.scss.length; i++) {
			filepath = cfgdir(cfg.scss[i], baseDir);
			if (filepath) {
				var result = sass.renderSync({
					file: filepath,
					sourceMap: false
				});
				var buf = Buffer.from(result.css);
				outcss += buf.toString();
				scss.push(filepath)
				output.push(filepath)
			}
		}
	}
	if (css.length||scss.length) {
		console.log('...compress styles...');
		fs.mkdirSync(pathDest, {recursive: true, mode: 0755});
		if (css.length) {
			outcss = uglifycss.processFiles(css, { maxLineLen: 0, expandVars: false, uglyComments: true }) + outcss;
		}
		write_file(
		           pathDest+cfg.dest.css,
		           uglifycss.processString(outcss, { maxLineLen: 0, expandVars: cfg.jscompress==2?true:false, uglyComments: true })
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
				if (cfg.jsnocheck) {
					if (jscript.length) {
						tmpcode = jscript.trim()
						if (tmpcode.substr(-1)!=';') {
							tmpcode += ';';
						}
					}
				}else{
					cmp = uglifyjs.minify(jscript, {
						compress: false,
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
						tmpcode = jscript.trim();
					}
					if (tmpcode.length) {
						if (tmpcode.substr(-1)!=';') {
							tmpcode += ';';
						}
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
		var keys,keyLength;
		for(key in cfg.copy) {
			files = cfg.copy[key];
			if (files.length) {
				// strip first "/"
				if (key.substr(0,1)=="/") {
					key = key.substr(1);
				}
				console.log("...copying '"+key+"'...");
				keys = key.split("../");
				keyLength = keys.length;
				if (keyLength==1) {
					pathDest = cfg.dest.path+key;
				}else{
					pathDest = cfg.dest.path;
					for(var i=1; i < keyLength;i++) {
						pathDest = pathDest.replace(/[^\/]+\/$/, "");
					}
					pathDest += keys[keyLength-1];
				}
				pathDest += "/";
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
								files1 = fs.readdirSync(curDir);
								for (var j = 0; j < files1.length; j++) {
									file1 = files1[j]
									if (file!="." && file1!="..") {
										if (fs.statSync(curDir+file1).isFile()) {
											fs.copyFile(curDir+file1, pathDest+file1, (err) => {
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

	/* SCRIPT AFTER */
	if (cfg.script) {
		if (!cfg.script.after) {
			if (cfg.script.code) {
				cfg.script.after = {
					"code": cfg.script.code
				}
			}
			if (cfg.script.file) {
				if (!cfg.script.after) {
					cfg.script.after = {};
				}
				cfg.script.after["file"] = cfg.script.file;
			}
		}
		if (cfg.script.after) {
			var sys = require('util')
			var exec = require('child_process').exec;
			// code script
			if (cfg.script.after.code) {
				dir = exec(cfg.script.after.code, function(err, stdout, stderr) {
					if (err) {
						console.error(err)
					}
					if (stdout) {
						console.log(stdout)
					}
				});
			}
			// file script
			if (cfg.script.after.file) {
				script = cfg.script.after.file;
				if (script.substr(0,1)=="/") {
					srcScript = script;
				}else{
					scripts = script.split("../");
					scriptLength = scripts.length;
					if (scriptLength==1) {
						srcScript = cfg.dest.path+script;
					}else{
						srcScript = cfg.dest.path;
						for(var i=1; i < scriptLength;i++) {
							srcScript = srcScript.replace(/[^\/]+\/$/, "");
						}
						srcScript += scripts[scriptLength-1];
					}
				}
				if (fs.existsSync(srcScript)) {
					var doit = "";
					var format = srcScript.match(/\.([^\.]+)/);
					if (format[1]) {
						switch(format[1].toLowerCase()) {
							case 'js':
								doit = "node ";
								break;
							default:
								doit = format[1].toLowerCase()+" ";
								break;
						}
					}
					dir = exec(doit+srcScript, function(err, stdout, stderr) {
						if (err) {
							console.error(err)
						}
						if (stdout) {
							console.log(stdout)
						}
					});
				}
			}
		}
	}
	return output;
};