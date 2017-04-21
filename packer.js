var es = require('event-stream')
  , packer = require('packer')
  , Buffer = require('buffer').Buffer

module.exports = function (opt) {
  opt = opt || {}
  opt.base62 = opt.base62 || false
  opt.shrink = opt.shrink || false

  function minifyFile(file) {
    if (file.isNull()) return this.emit('data', file) // pass along
    if (file.isStream()) return this.emit('error', new Error('gulp-packer: Streaming not supported'))

    var str = file.contents.toString('utf8')
      , data = packer.pack(str, opt.base62, opt.shrink)

    file.contents = new Buffer(data)

    this.emit('data', file)
  }

  return es.through(minifyFile)
}
