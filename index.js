Metalsmith = require('metalsmith');
less = require('metalsmith-less');
uglify = require('metalsmith-uglify');
filter = require('metalsmith-filter');
serve = require('metalsmith-serve');
layouts = require('metalsmith-layouts');
markdown = require('metalsmith-markdown');


readFileSync = require('fs').readFileSync;
basename = require('path').basename


//simple metalsmith plugin for assets copy
copy_assets = function(assets, dist_dir) {
    return function(files, metalsmith, done) {
        assets.forEach(function(file) {
            contents = readFileSync(file);
            files[dist_dir + "/" + (basename(file))] = {
                contents: contents
            };
        });
        done();
    }
}

Metalsmith(__dirname)
    .use(uglify({
        concat: "js/main.min.js"
    }))
    .use(copy_assets(["node_modules/foundation-sites/dist/foundation.min.css"], "css"))
    .use(copy_assets(["node_modules/jquery/dist/jquery.min.js", "node_modules/foundation-sites/dist/foundation.min.js"], "js"))
    .use(less())
    .use(filter(['*', '**/*', '!**/*.less']))
    .use(markdown())
    .use(layouts({
        engine: 'handlebars',
        partials: 'partials'
    }))
    .use(serve())
    .build(function(err) {
        if (err) {
            console.log(err);
        }
        console.log("Build finished!!!");
    });
