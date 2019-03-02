# JS CSS Compressor
CLI command to compress javascript, css, scss at once. Based on json file to map which files to compress and where to save the result

## how to install
1. install npm (Node Package Manager) = [https://docs.npmjs.com/getting-started/installing-node]
1. install this package `npm install -g esoftplay-packer`

## how to use
You have to use terminal, see the usage example below:

`pack [option] [source] [destination]`

#### compress many files based on config
`pack [option] directory/where/tosave/config.js`

#### compress file and spit out the result
`pack [option] path/to/file/javascript.js`

`pack [option] path/to/file/style.css`

#### compress and save the result to other file
`pack [option] path/to/file/javascript.js path/destination/output.min.js`

`pack [option] path/to/file/style.css path/destination/output.min.css`

#### compress and save result in same directory

this will result jsfilename.min.js :
`pack [option] path/to/file/jsfilename.js ./`

this will result cssfilename.min.css :
`pack [option] path/to/file/cssfilename.css ./`

## options
* no-option     = You can use this command in any directory with `config.js` file inside, so you don't need to use any argument
* -c --compress = Deep compression method to optimize the size, make sure the code is clean with no errors
* -w --watch    = Watch for changes on sources, the packer will be executed each time the file is accessed
* -h --help     = Display help

## example `config.js`
	module.exports = {
		source: "/absolute/path/source/", // determine source path, without this key system will consider in the same directory where this file is placed
		dest: {
			path: __dirname + "/destination/", // determine the destination path if it's the same as the source then empty it or don't use this key
			css: "style.min.css", // specify the compressed filename of all css and scss then save the file in dest.path + "css/", default value is 'style.css'
			js: "script.min.js" // specify the compressed filename of js files then save the file in dest.path + "jss/", default value is 'script.js'
		},
		jscompress : 2, // 1=uglify, 2=packer (compression method)
		watch : 0, // 1=Watch for changes, 0=Exit after compress
		css: [ // retrieve all css along with scss files to compress into one single file as name which is determine in dest.path+"css/"+dest.css
			"relatif/path/to/style1.css",
			"./relatif/path/to/style2.css", // you can also use ../../ to point which file you want to process
			"/absolute/path/to/style3.css"
		],
		scss: [ // retrieve all scss along with css files to compress into one single file as name which is determine in dest.path+"css/"+dest.css
			"relatif/path/to/style1.scss",
			"./relatif/path/to/style2.scss",
			"/absolute/path/to/style3.scss"
		],
		font: [ // retrieve all files to copy into dest.path+"fonts/"
			"relatif/path/to/fonts/*", // use single star like * to process file only
			"/absolute/path/to/fonts/**" // use double star like ** to process recursively
		],
		js: [ // retrieve all javascript files to compress into one single file as name which is determine in dest.path+"js/"+dest.js
			"relatif/path/to/script1.js",
			"./relatif/path/to/script2.js",
			"/absolute/path/to/script3.js"
		],
		copy: { // collect all files to copy or compress
			"css": [ // these files will be placed in dest.path+"css/"
				"relatifORabsolute/path/to/style.css", // copy as the same name
				{ // example how to copy and compress the file as different filename $destination_file : $source_file
					"style.min.css": "relatifORabsolute/path/to/style.css",
				}
			],
			"js": [ // these files will be placed in dest.path+"js/"
				"relatifORabsolute/path/to/script.js", // copy as the same name
				{ // example how to copy and compress the file as different filename $destination_file : $source_file
					"script.min.js": "relatifORabsolute/path/to/script.js"
				}
			],
			"img": [ // copy these files without any compression method and place them in dest.path+"img/"
				"relatif/path/to/img.jpg",// copy a single file
				"./relatif/path/to/*", 		// use single star like * to process file only
				"/absolute/path/to/**",		// use double star like ** to process recursively
				{ // example how to copy file as different filename $destination_file : $source_file
					"othername.jpg": "relatifORabsolute/path/to/anyname.jpg"
				}
			]
			// , "anyfoldername":[... same as above ...]
		}
	}
