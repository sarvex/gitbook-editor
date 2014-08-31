define([
    "hr/hr",
    "hr/utils",
    "models/plugin"
], function(hr, _, GlossaryEntry) {
    var Plugins = hr.Collection.extend({
        model: Plugin,

        /*
         *  Parse list of plugins from a book
         */
        parsePlugins: function(book) {
            return book.read("book.json")
            .fail(function() {
                return "{}"
            });
        },

        /*
         *  Add plugins to the books
         *      - extend book.json
         *      - extend package.json
         */
        toFs: function(book) {

        }
    });

    return Plugins;
});