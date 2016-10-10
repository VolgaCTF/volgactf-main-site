Metalsmith = require('metalsmith');
less = require('metalsmith-less');
uglify = require('metalsmith-uglify');
filter = require('metalsmith-filter');
serve = require('metalsmith-serve');


Metalsmith(__dirname)
    .use(less())
    .use(uglify({concat:"js/main.js"}))
    .use(filter(['*','**/*', '!**/*.less']))
    .use(serve())
    .build(function(err) {
        if (err){
          console.log(err);
        }
        console.log("Build finished!!!");
    });
