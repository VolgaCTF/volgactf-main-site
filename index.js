Metalsmith = require('metalsmith');
less = require('metalsmith-less');
uglify = require('metalsmith-uglify');
filter = require('metalsmith-filter');
watch = require('metalsmith-watch');
serve = require('metalsmith-serve');
layouts = require('metalsmith-layouts');
markdown = require('metalsmith-markdown');
multiLanguage = require('./metalsmith-multilang');
metadata = require('metalsmith-metadata');

const DEFAULT_LANG = "ru";
const LANGS = ['ru', 'en'];


readFileSync = require('fs').readFileSync;
basename = require('path').basename;


var env = process.env.NODE_ENV;


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
};

var baseBuild = Metalsmith(__dirname)
    .use(metadata({
        teams: 'meta/teams.yaml',
        partners: 'meta/partners.yaml'
    }))
    .use(multiLanguage({
      default: DEFAULT_LANG,
      locales: LANGS
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
    .use(layouts({
        engine: 'pug'
    }));

if(env === "development"){
    baseBuild.use(
        watch({
            paths: {
                "layouts/**/*": "**/*",
                "src/css/**/*": "**/*",
                "src/*.md": "**/*"
            },
            livereload: true,
        })
    )
        .use(serve())
        .build(function(err) {
            if (err) {
                console.log(err);
            }
            console.log("Build finished!!!");
        });
}
else{
    baseBuild.use(imagemin({
        optimizationLevel: 3,
        svgoPlugins: [{ removeViewBox: true }]
    })).build(function(err) {
        if (err) {
            console.log(err);
        }
        console.log("Build finished!!!");
    });

}
