var gulp = require('gulp');
var watch = require('gulp-watch');
var gutil = require('gulp-util');
var cssmin = require('gulp-cssmin');
var concat = require('gulp-concat');

var uglify = require('gulp-uglify');
var Packer = require('./packer');
var streamify = require('gulp-streamify');
var pump = require('pump');

var sass = require('gulp-sass');
var autoprefix = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var merge = require('merge2');

var config = require('./config');
var dest = (typeof config.dest.path=="undefined") ? "dest" : (config.dest.path=="" ? "dest" : config.dest.path);
var watcher = (typeof config.watch=="undefined") ? 0 : config.watch;

var getExt = function(filename) {
	var match = /\.([^\.]+)$/.exec(filename);
	if (match) {
		return match[1].toLowerCase();
	}
	return "none";
};
if (typeof config.source!="undefined" && config.source!="") {
	var fixPath = function(file) {
		if (file.substr(0, 1)=="/" || file.substr(0, 2)=="./") {
			return file;
		// }else
		// if (/^(?:f|ht)tps?:\/\//i.test(file)) {
		// 	var ext = getExt(file);
		// 	return request(file).pipe(writeStream('temp.'+ext));
		}
		return config.source+file;
	};
	var loops = ["css", "scss", "font", "js"];
	for (var i = 0; i < loops.length; i++) {
		if (config[loops[i]]) {
			for (var j = 0; j < config[loops[i]].length; j++) {
				config[loops[i]][j] = fixPath(config[loops[i]][j]);
			}
		}else{
			config[loops[i]] = [];
		}
	}
	if (config.copy) {
		for(var path in config.copy) {
			for (var file in config.copy[path]) {
				if (typeof config.copy[path][file]=="object") {
					for (var name in config.copy[path][file]) {
						config.copy[path][file][name] = fixPath(config.copy[path][file][name]);
					}
				}else{
					config.copy[path][file] = fixPath(config.copy[path][file]);
				}
			}
		}
	}else{
		config.copy = {};
	}
}
var Execute = function(cb, files, dest, type, name=null) {
	if (name) {
		var tasks = [files];
		tasks.push(concat(name));
		switch(type) {
			case 'css':
				tasks.push(cssmin());
				break;
			case 'scss':
				tasks.push(sass());
				tasks.push(cssmin());
				break;
			case 'js':
				if (config.jscompress) {
					tasks.push(uglify({mangle: false, compress: true }));
					switch(config.jscompress) {
						case 2:
							tasks.push(streamify(Packer({base62: true, shrink: true})));
							break;
					}
				}
				break;
		}
		tasks.push(gulp.dest(dest));
		if (watcher) {
			pump(tasks, cb);
		}else{
			pump(tasks);
		}
	}else{
		files.pipe(gulp.dest(dest));
	}
	return true;
};
gulp.task('styles', function(cb) {
	var gulpDest = dest+"/css";
	var fileName = config.dest.css||'style.css';
	if (config.css.length > 0 && config.scss.length > 0) {
		var cssStream = gulp.src(config.css).pipe(concat('css-files.css'));
		var scssStream = gulp.src(config.scss).pipe(sass()).pipe(concat('scss-files.css'));
		return Execute(cb, merge(cssStream, scssStream), gulpDest, "css", fileName);
	}else
	if (config.css.length > 0) {
		return Execute(cb, gulp.src(config.css), gulpDest, "css", fileName);
	}else
	if (config.scss.length > 0) {
		return Execute(cb, gulp.src(config.scss), gulpDest, "scss", fileName);
	}
	return false;
});

gulp.task('fonts', function(cb) {
	var gulpDest = dest+"/fonts";
	if (config.font.length > 0) {
		return Execute(cb, gulp.src(config.font), gulpDest, "font");
	}
	return false;
});
gulp.task('scripts', function(cb) {
	var gulpDest = dest+"/js";
	var fileName = config.dest.js||'script.js';
	if (config.js.length > 0) {
		Execute(cb, gulp.src(config.js), gulpDest, "js", fileName);
	}
	return false;
});
gulp.task('copy', function(cb) {
	var gulpDest, file, src, match;
	for (var dir in config.copy) {
		if (!config.copy.hasOwnProperty(dir)) continue;
		gulpDest = dest+dir;
		for(var i in config.copy[dir]) {
			if (!config.copy[dir].hasOwnProperty(i)) continue;
			file = config.copy[dir][i];
			if (typeof file=="string") {
				Execute(cb, gulp.src(file), gulpDest, getExt(file));
			}else{
				for(var name in file) {
					if (!file.hasOwnProperty(name)) continue;
					Execute(cb, gulp.src(file[name]), gulpDest, getExt(file[name]), name);
				}
			}
		}
	}
	return false;
});
gulp.task('watch', function() {
	if (watcher) {
		gulp.watch(config.css, ['styles']);
		gulp.watch(config.scss, ['styles']);
		gulp.watch(config.font, ['fonts']);
		gulp.watch(config.js, ['scripts']);
	}
});

gulp.task('default', ['styles', 'fonts', 'scripts', 'copy', 'watch']);
