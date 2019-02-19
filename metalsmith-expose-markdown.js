var markdown_it = require('markdown-it')();
var markdown_it_plugin = require('markdown-it-attrs');

module.exports = function (options) {
    function markdown_text(text) {
        try {
            markdown_it.use(markdown_it_plugin);
            return markdown_it.render(text, {
                linkify: true,
                typographer: true,
                break: true,
                inline: true
            })
        }
        catch (e) {
            console.error("Markdown error", e);
            return "";
        }
    }

    return function (files, ms, done) {
        for (var file in files) {
            files[file].markdown_text = markdown_text.bind(files[file]);
        }
        done();
    }
};