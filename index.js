Metalsmith = require('metalsmith');
less = require('metalsmith-less');
uglify = require('metalsmith-uglify');
filter = require('metalsmith-filter');
watch = require('metalsmith-watch');
serve = require('metalsmith-serve');
layouts = require('metalsmith-layouts');
markdown = require('metalsmith-markdown');
multiLanguage = require('./metalsmith-multilang');
expose_markdown = require('./metalsmith-expose-markdown');
page_metadata = require('./metalsmith-pagemetadata');
metadata = require('metalsmith-metadata');
imagemin = require('metalsmith-imagemin');
filename = require('metalsmith-filenames');


const DEFAULT_LANG = "ru";
const LANGS = ['ru', 'en'];


readFileSync = require('fs').readFileSync;
basename = require('path').basename;


var env = process.env.NODE_ENV;


//simple metalsmith plugin for assets copy
copy_assets = function (assets, dist_dir) {
    return function (files, metalsmith, done) {
        assets.forEach(function (file) {
            contents = readFileSync(file);
            files[dist_dir + "/" + (basename(file))] = {
                contents: contents
            };
        });
        done();
    }
};

var baseBuild = Metalsmith(__dirname)
    .use(metadata({
        menu: 'meta/menu.yaml'
    }))
    .use(multiLanguage({
        default: DEFAULT_LANG,
        locales: LANGS
    }))
    .use(expose_markdown())
    .use(page_metadata({
        metakeys: ["schedule", "partners", "teams", "scoreboard"]
    }))
    .use(uglify({
        concat: "js/main.min.js"
    }))
    .use(copy_assets(["node_modules/foundation-sites/dist/css/foundation.min.css"], "css"))
    .use(copy_assets(["node_modules/jquery/dist/jquery.min.js", "node_modules/foundation-sites/dist/js/foundation.min.js"], "js"))
    .use(less({
        pattern: [
            '**/main.less'
        ],
        render: {
            paths: [
                'src/css/'
            ]
        }
    }))
    .use(filter(['*', '**/*', '!**/*.less']))
    .use(markdown())
    .use(filename())
    .use(layouts({
        engine: 'pug'
    }));

if (env === "development") {
    baseBuild.use(
        watch({
            paths: {
                "layouts/**/*": "**/*",
                "src/css/**/*": "**/*",
                "src/**/*.md": "**/*",
                "src/meta/*": "**/*"
            },
            livereload: true,
        })
    )
        .use(serve())
        .build(function (err) {
            if (err) {
                console.log(err);
            }
            console.log("Build finished!!!");
        });
}
else {
    baseBuild.use(imagemin({
        optimizationLevel: 3,
        svgoPlugins: [{removeViewBox: true}]
    })).build(function (err) {
        if (err) {
            console.log(err);
        }
        console.log("Build finished!!!");
    });

}
