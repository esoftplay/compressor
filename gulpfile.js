var gulp = require('gulp');
var watch = require('gulp-watch');
var gutil = require('gulp-util');
var cssmin = require('gulp-cssmin');
var concat = require('gulp-concat');

var uglify = require('gulp-uglify');
var Packer = require('./packer');
var streamify = require('gulp-streamify');

var sass = require('gulp-sass');
var autoprefix = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var merge = require('merge2');

var config = require('./config');
var dest = (typeof config.dest.path=="undefined") ? "dest" : (config.dest.path=="" ? "dest" : config.dest.path);



gulp.task('styles', function()
{
	var gulpDest = dest+"/css";
	var fileName = config.dest.css||'style.css';
	if (config.css.length > 0 && config.scss.length > 0)
	{
		var cssStream = gulp.src(config.css).pipe(concat('css-files.css'));
		var scssStream = gulp.src(config.scss).pipe(sass()).pipe(concat('scss-files.css'));
		return merge(cssStream, scssStream)
		.pipe(concat(fileName))
		.pipe(cssmin())
		.pipe(gulp.dest(gulpDest));
	}else
	if (config.css.length > 0)
	{
		return gulp.src(config.css)
		.pipe(concat(fileName))
		.pipe(cssmin())
		.pipe(gulp.dest(gulpDest));
	}else
	if (config.scss.length > 0)
	{
		return gulp.src(config.css)
		.pipe(concat(fileName))
		.pipe(sass())
		.pipe(cssmin())
		.pipe(gulp.dest(gulpDest));
	}
	return false;
});

gulp.task('fonts', function()
{
	var gulpDest = dest+"/fonts";
	if (config.font.length > 0)
	{
		return gulp.src(config.font).pipe(gulp.dest(gulpDest));
	}
	return false;
});

gulp.task('scripts', function(cb)
{
	var gulpDest = dest+"/js";
	var fileName = config.dest.js||'script.js';
	if (config.js.length > 0)
	{
		switch(config.jscompress) {
			case 2:
		  	return gulp.src(config.js)
					.pipe(concat(fileName))
					.pipe(uglify({mangle: false, compress: true }))
					.pipe(streamify(Packer({base62: true, shrink: true})))
					.pipe(gulp.dest(gulpDest));
				break;
			default:
				return gulp.src(config.js)
					.pipe(concat(fileName))
					.pipe(uglify({mangle: true, compress: true }))
					.pipe(gulp.dest(gulpDest));
				break;
		}
	}
	return false;
});
gulp.task('copy', function()
{
	function exec(files, dest, name=null)
	{
		if (name)
		{
			var doMinify = false;
			if (typeof files=="string")
			{
				var match = /\.([^\.]+)$/.exec(files);
				if (match!=null) {
					switch(match[1]) {
						case 'js':
								doMinify = true;
								gulp.src(files)
								.pipe(concat(name))
								.pipe(uglify({mangle: false, compress: true }))
								.pipe(streamify(Packer({base62: true, shrink: true})))
								.pipe(gulp.dest(dest));
							break;
						case 'scss':
								doMinify = true;
								gulp.src(files)
								.pipe(concat(name))
								.pipe(sass())
								.pipe(cssmin())
								.pipe(gulp.dest(dest));
							break;
						case 'css':
								doMinify = true;
								gulp.src(files)
								.pipe(concat(name))
								.pipe(cssmin())
								.pipe(gulp.dest(dest));
							break;
					}
				}
			}
			if (!doMinify)
			{
				gulp.src(file).pipe(concat(name)).pipe(gulp.dest(dest));
			}
		}else{
			gulp.src(file).pipe(gulp.dest(dest));
		}
	}
	if (typeof config.copy!="undefined")
	{
		var gulpDest, file, src, match;
		for (var dir in config.copy)
		{
			if (!config.copy.hasOwnProperty(dir)) continue;
			gulpDest = dest+dir;
			for(var i in config.copy[dir])
			{
				if (!config.copy[dir].hasOwnProperty(i)) continue;
				file = config.copy[dir][i];
				if (typeof file=="string")
				{
					exec(file, gulpDest);
				}else{
					for(var name in config.copy[dir][i])
					{
						if (!config.copy[dir][i].hasOwnProperty(name)) continue;
						exec(config.copy[dir][i][name], gulpDest, name);
					}
				}
			}
		}
	}
	return false;
});

gulp.task('watch', function() {
	gulp.watch(config.css, ['styles']);
	gulp.watch(config.scss, ['styles']);
	gulp.watch(config.font, ['fonts']);
	gulp.watch(config.js, ['scripts']);
});

gulp.task('default', ['styles', 'fonts', 'scripts', 'copy', 'watch']);
