define([
    "hr/hr",
    "hr/utils",
    "models/plugin"
], function(hr, _, PluginEntry) {
    var Plugins = hr.Collection.extend({
        model: PluginEntry,

        /*
         *  Parse list of plugins from a book
         */
        parsePlugins: function(book) {
            var that = this;

            return book.readConfig()
            .then(function(config) {
                var plugins = config.plugins;
                var pluginsConfig = config.pluginsConfig || {};
                if (_.isString(plugins)) plugins = plugins.split(",");

                that.reset(_.map(plugins, function(plugin) {
                    return {
                        name: plugin,
                        config: pluginsConfig[plugin] || {}
                    };
                }));
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