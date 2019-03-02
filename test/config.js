'use strict';

module.exports = {
	css: [
		"custom/bootstrap-pre.css",
		"github/bootstrap/dist/css/bootstrap.css",
		"custom/bootstrap-post.css"
		],
	scss: [],
	font: [
		"github/bootstrap/dist/fonts/*",
		"github/Font-Awesome/fonts/*"
		],
	js: [
		"custom/bootstrap-pre.js",
		"custom/jquery.js",
		"github/bootstrap/dist/js/bootstrap.js",
		"custom/bootstrap-post.js",
		],
	copy: {
		"css": [
			// COPY ONLY
			"css/alert.css",
			"css/datepicker.css",
			"css/datetimepicker.css",
			// COPY AND COMPRESS
			{
				"bootstrap-theme.min.css": "github/bootstrap/dist/css/bootstrap-theme.css",
				"font-awesome.min.css": "github/Font-Awesome/css/font-awesome.css",
				"colorpicker.css": "github/bootstrap-colorpicker/dist/css/bootstrap-colorpicker.css"
			}
		],
		"js": [
			// COPY AND COMPRESS
			{
				"alert.js": "js/alert.js",
				"colorpicker.js": "github/bootstrap-colorpicker/dist/js/bootstrap-colorpicker.js",
				"datepicker.js": "js/datepicker.js",
				"datetimepicker.js": "js/datetimepicker.js",
				"rating.js": "js/rating.js",
			}
		],
		"img": [
			"img/spinner.gif",
			"github/bootstrap-colorpicker/dist/img/**"
		]
	},
	source: "/Users/me/Sites/php/bootstrap/",
	dest: {
		path: "/var/www/html/master/templates/admin/bootstrap/",
		css: "bootstrap.min.css",
		js: "bootstrap.min.js"
	},
	jscompress : 2, // 1=uglify, 2=packer
	watch : 0 // 1=uglify, 2=packer
}