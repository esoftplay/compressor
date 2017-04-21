// Essentials
var gulp = require('gulp');
var watch = require('gulp-watch');
var gutil = require('gulp-util');
var cssmin = require('gulp-cssmin');
var concat = require('gulp-concat');

// Sass Requires
var sass = require('gulp-sass');                // Include SASS
var autoprefix = require('gulp-autoprefixer');  // Autoprefixer (always)
var rename = require('gulp-rename');            // Gulp Rename
var sourcemaps = require('gulp-sourcemaps');    // Sourcemaps (for sass)
var merge = require('merge2');    							// merging multi src

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
		var compresor;
		switch(config.jscompress) {
			case 3:
				var uinline = require('gulp-uglify-inline');
				compresor = uinline();
				break;
			case 2:
				var packer = require('gulp-packer')
		  	var streamify = require('gulp-streamify')
				compresor = streamify(packer({base62: true, shrink: true}))
				break;
			default:
				var uglify = require('gulp-uglify');
				compresor = uglify({mangle: true, compress: true, eval: true });
		}

		return gulp.src(config.js)
		.pipe(concat(fileName))
		.pipe(compresor)
		.pipe(gulp.dest(gulpDest));
	}
	return false;
});

gulp.task('copy', function()
{
	if (typeof config.copy!="undefined")
	{
		var gulpDest;
		for (var dir in config.copy)
		{
			if (!config.copy.hasOwnProperty(dir)) continue;
			gulpDest = dest+dir;
			for(var i in config.copy[dir])
			{
				if (!config.copy[dir].hasOwnProperty(i)) continue;
				if (typeof config.copy[dir][i]=="string")
				{
					// console.log([config.copy[dir][i], gulpDest]);
					gulp.src(config.copy[dir][i]).pipe(gulp.dest(gulpDest));
				}else{
					for(var j in config.copy[dir][i])
					{
						if (!config.copy[dir][i].hasOwnProperty(j)) continue;
						// console.log([config.copy[dir][i][j], j]);
						gulp.src(config.copy[dir][i][j]).pipe(concat(j)).pipe(gulp.dest(gulpDest));
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
