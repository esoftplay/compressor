#!/usr/bin/env node

const fs = require('fs');
const exec_config = require('./lib/exec_config');
const exec_file = require('./lib/exec_file');
var Dir = process.cwd()+"/";
var jsCompress = 1;
var isWatch = 0;

var program = require('commander');
var info = require("./package.json");

program
  .version(info.name + " v" + info.version)
  .option('-c, --compress', 'Deep compression method to optimize the size, make sure the code is clean with no errors')
  .option('-w, --watch', 'Watch for changes on sources, the compressor will be executed each time the file is accessed')
  .parse(process.argv);
if (program.compress) {
	jsCompress = 2;
}
if (program.watch) {
	isWatch = 1;
}
var args = program.args;
var fl1= args[0]||Dir+"config.js"
var fl2= args[1]||""
var file1 = /^\//.test(fl1) ? fl1 : Dir+fl1;
if (fl2=="./") {
	var file2 = file1.replace(/(\.[^\.]+)$/, '.min$1')
}else{
	var file2 = fl2=="" ? "" : (/^\//.test(fl2) ? fl2 : Dir+fl2);
}
var Out = "";

if (/config\.js$/.test(file1)) {
	if (!fs.existsSync(file1)) {
		if (file1==Dir+"config.js") {
			console.error("config.js is not found in this directory!");
		}else{
			console.error("sorry, '"+file1+"' is not found!!")
		}
	}else{
		Dir = file1.replace(/config\.js$/, '');
		const def = {css:[],scss:[],font:[],js:[],copy:{},source:Dir,dest:{path:Dir,css:"style.css",js:"script.js"},jscompress:jsCompress,watch:0};
		var cfg = require(file1);
		cfg = {...def, ...cfg};
		for(c in def.dest) {
			if (!cfg.dest[c]) {
				cfg.dest[c] = def.dest[c];
			}
		}
		if (program.compress) {
			cfg.jscompress = 2;
			jsCompress = 2;
		}
		if (program.watch) {
			cfg.watch = 1;
			isWatch = 1
		}
		Dir = cfg.source;
		var files = exec_config(cfg, Dir);
		if (cfg.watch && files.length) {
			var options = {persistent: true, recursive: false, encoding: 'utf8'};
			var reconfig = function(eventType, filename) {
				if(filename) {
					filename += " has been";
				}else{
					filename = "some files have been";
				}
				console.warn(filename+" "+eventType);
				exec_config(cfg, Dir);
			};
			for (var i = 0; i < files.length; i++) {
				path = files[i];
				options.recursive = (path.substr(-1)=="/") ? true : false;
				fs.watch(path, options, reconfig);
			}
		}
	}
}else
if (fs.existsSync(file1)) {
	exec_file(file1, file2, jsCompress, Dir);
	if (isWatch) {
		fs.watch(file1, {
			persistent: true,
			recursive: false,
			encoding: 'utf8'
		}, (eventType, filename) => {
			if(filename) {
				filename += " has been";
			}else{
				filename = "some files have been";
			}
			console.warn(filename+" "+eventType);
			exec_file(file1, file2, jsCompress, Dir);
		});
	}
}else{
	console.error(file1+" is not found!!");
}