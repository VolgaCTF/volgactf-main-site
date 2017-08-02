/**
 * BICYCLE!
 */
var ext = require('path').extname;

module.exports = function (options) {
    var lang = new Multilanguage(options);
    return lang.getPlugin();
};

function Multilanguage(options) {
    this.default = options.default;
    this.locales = options.locales;
    this.pattern = new RegExp('.*_(' + options.locales.join('|') + ')(?:\..*)?$');
    this.pathPattern = new RegExp('/(' + options.locales.join('|') + ')/');
}

Multilanguage.prototype.getAltFilename = function (file, fromLocale, toLocale) {
    var extension = ext(file);

    // Locale in the path.
    if (this.pathPattern.test(file)) {
        return file.replace('/' + fromLocale + '/', '/' + toLocale + '/');
    }

    // Locale in the filename.
    return file.replace('_' + fromLocale + extension, '_' + toLocale + extension);
};

// Returns the name of the main filename
// It's usefull to know which file is the main when merging properties
//
// Given { default: 'es', locales: ['ca', 'es'] }
// And file_ca.md as argument
// Returns file_es.md
Multilanguage.prototype.getBaseFilename = function (file) {

    // Locale in the path.
    if (this.pathPattern.test(file)) {
        return file.replace(new RegExp('/(' + this.locales.join('|') + ')/'), '/' + this.default + '/');
    }

    // Locale in the filename.
    var extension = ext(file);
    return file.replace(new RegExp('_(' + this.locales.join('|') + ')(?:' + extension + ')?$'), '_' + this.default + extension);
};

Multilanguage.prototype.getLocale = function (file) {
    // Locale in the path.
    if (this.pathPattern.test(file)) {
        return file.match(this.pathPattern)[1];
    }

    // Locale in the filename.
    return file.match(this.pattern)[1];
};

Multilanguage.prototype.getPlugin = function () {
    var self = this;

    function lang(locale) {
        if (locale in this.altFiles) {
            return this.altFiles[locale];
        } else {
            throw new Error('Unknown locale "' + locale + '".');
        }
    }

    return function (files, ms, done) {
        ms.metadata().locales = self.locales;
        ms.metadata().defaultLocale = self.default;

        for (var file in files) {
            if (self.pattern.test(file)) {
                var base = self.getBaseFilename(file);

                files[file].locale = self.getLocale(file);

                // Add missing properties from base locale
                // This lets to have base some generic properties
                // applied only in the 'default' locale, e.g.: template
                if (base !== file) {
                    self.merge(files[base], files[file]);
                }
            } else {
                files[file].locale = self.default;
            }

            // Generate altFiles map
            files[file].altFiles = {};

            self.locales.forEach(function (locale) {
                if (locale !== files[file].locale) {
                    files[file].altFiles[locale] = files[self.getAltFilename(file, files[file].locale, locale)];
                } else {
                    files[file].altFiles[files[file].locale] = files[file];
                }
            });

            // Bind lang()
            files[file].lang = lang.bind(files[file]);
            files[file].defaultLocale = this.default;
        }

        // Folder handling
        // Default locale will go in root
        // Other files in '/:locale/<file>.html'
        for (file in files) {
            if (self.pattern.test(file)) {
                var extension = ext(file);
                var name = file.replace(extension,"");
                if (files[file].locale === self.default) {
                    name = name.replace("_"+files[file].locale,"");
                    files[file].path = '';
                    files[name + extension] = files[file];
                } else {
                    files[file].path = files[file].locale + '/';
                    name = name.replace("_"+files[file].locale,"");
                    files[files[file].locale + '/' + name + extension] = files[file];
                }

                // Remove old entry
                delete files[file];
            }
        }

        done();
    };
};

Multilanguage.prototype.merge = function (src, dest) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) {
            if (!dest.hasOwnProperty(key)) {
                dest[key] = src[key];
            }
        }
    }
};