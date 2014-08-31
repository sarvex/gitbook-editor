define([
    "hr/hr",
    "hr/promise",
    "hr/utils",
    "models/plugin"
], function(hr, Q, _, PluginEntry) {
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
            var that = this;

            return book.readConfig()
            .then(function(config) {
                config.plugins = that.pluck("name");
                config.pluginsConfig = _.chain(that.models)
                .map(function(plugin) {
                    var pConfig = plugin.get("config");
                    if (_.size(pConfig) == 0) return null;
                    return [plugin.get("name"), pConfig];
                })
                .object()
                .value();

                return book.writeConfig(config);
            });
        }
    });

    return Plugins;
});