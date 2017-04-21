// Essentials
var gulp = require('gulp');
var watch = require('gulp-watch');
var gutil = require('gulp-util');
var cssmin = require('gulp-cssmin');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var gulpeval = require('gulp-eval');
// var compress = require('gulp-compressor');

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

gulp.task('scripts', function()
{
	var gulpDest = dest+"/js";
	if (myfiles.js.length > 0)
	{
		return gulp.src(myfiles.js)
		.pipe(concat('script.js'))
		// .pipe(gulpeval())
		// .pipe(compress({type:"js"}))
		.pipe(uglify({mangle: false, compress: true }))
		.pipe(gulp.dest(gulpDest));
	}
	return false;
});

gulp.task('watch', function() {
	for (var i = 0; i < myfiles.css.length; i++) {
		gulp.watch(myfiles.css[i], ['styles']);
	}
	for (var i = 0; i < myfiles.scss.length; i++) {
		gulp.watch(myfiles.scss[i], ['styles']);
	}
	for (var i = 0; i < myfiles.font.length; i++) {
		gulp.watch(myfiles.font[i], ['fonts']);
	}
	for (var i = 0; i < myfiles.js.length; i++) {
		gulp.watch(myfiles.js[i], ['scripts']);
	}
});

gulp.task('default', ['styles', 'fonts', 'scripts', 'watch']);
