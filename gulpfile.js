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

var myfiles = require('./files');
var dest = (typeof myfiles.destination=="undefined") ? "dest" : (myfiles.destination=="" ? "dest" : myfiles.destination);



gulp.task('styles', function()
{
	var gulpDest = dest+"/css";
	if (myfiles.css.length > 0 && myfiles.scss.length > 0)
	{
		var cssStream = gulp.src(myfiles.css).pipe(concat('css-files.css'));
		var scssStream = gulp.src(myfiles.scss).pipe(sass()).pipe(concat('scss-files.css'));
		return merge(cssStream, scssStream)
		.pipe(concat('style.css'))
		.pipe(cssmin())
		.pipe(gulp.dest(gulpDest));
	}else
	if (myfiles.css.length > 0)
	{
		return gulp.src(myfiles.css)
		.pipe(concat('style.css'))
		.pipe(cssmin())
		.pipe(gulp.dest(gulpDest));
	}else
	if (myfiles.scss.length > 0)
	{
		return gulp.src(myfiles.css)
		.pipe(concat('style.css'))
		.pipe(sass())
		.pipe(cssmin())
		.pipe(gulp.dest(gulpDest));
	}
	return false;
});

gulp.task('fonts', function()
{
	var gulpDest = dest+"/fonts";
	if (myfiles.font.length > 0)
	{
		return gulp.src(myfiles.font).pipe(gulp.dest(gulpDest));
	}
	return false;
});

gulp.task('scripts', function(cb)
{
	var gulpDest = dest+"/js";
	if (myfiles.js.length > 0)
	{
		var compresor;
		switch(myfiles.jscompress) {
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

		return gulp.src(myfiles.js)
		.pipe(concat('script.js'))
		.pipe(compresor)
		.pipe(gulp.dest(gulpDest));
	}
	return false;
});

gulp.task('watch', function() {
	gulp.watch(myfiles.css, ['styles']);
	gulp.watch(myfiles.scss, ['styles']);
	gulp.watch(myfiles.font, ['fonts']);
	gulp.watch(myfiles.js, ['scripts']);
});

gulp.task('default', ['styles', 'fonts', 'scripts', 'watch']);
