var path = require('path');
var extname = path.extname;
var yaml = require('js-yaml');

module.exports = plugin;

var parsers = {
    '.json': JSON.parse,
    '.yaml': yaml.safeLoad,
    '.yml': yaml.safeLoad
};


function plugin(options) {
    options = options || {};
    return function (files, ms, done) {
        var exts = Object.keys(parsers);
        for (var file in files) {
            for (var i in options.metakeys) {
                var metakey = options.metakeys[i];
                if (files[file]["meta-" + metakey]) {
                    var metafile = files[file]["meta-" + metakey].replace(/([\/\\])/g, path.sep);
                    var ext = extname(metafile);
                    if (!~exts.indexOf(ext)) {
                        throw new Error('unsupported metadata type "' + ext + '"');
                    }
                    if (!files[file][metakey] || files[metafile]) {
                        if (!files[metafile]) {
                            throw new Error("file '" + metafile + "' not found")
                        }
                        var parser = parsers[ext];
                        var str = files[metafile].contents.toString();
                        try {
                            var data = parser(str);
                        } catch (e) {
                            return done(new Error("malformed metadata in file '" + metafile + "'"));
                        }
                        files[file][metakey] = data;
                    }
                }
            }
        }
        done()
    }
}

