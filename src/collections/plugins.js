define([
    "hr/hr",
    "hr/promise",
    "hr/utils",
    "models/plugin"
], function(hr, Q, _, PluginEntry) {
    var DEFAULT_PLUGINS = [
        "exercises", "quizzes", "mathjax"
    ];
    var PLUGIN_PREFIX = "gitbook-plugin-";

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
            var plugins = that.pluck("name");

            return book.readConfig()

            // Update book.json
            .then(function(config) {
                config.plugins = plugins;
                config.pluginsConfig = _.chain(that.models)
                .map(function(plugin) {
                    var pConfig = plugin.get("config");
                    if (_.size(pConfig) == 0) return null;
                    return [plugin.get("name"), pConfig];
                })
                .object()
                .value();

                return book.writeConfig(config);
            })

            // Update package.json
            .then(function() {
                return book.read("package.json")
                .fail(function() {
                    return "{}";
                })
                .then(JSON.parse);
            })
            .then(function(packageJson) {
                // Generate if non existant package.json
                packageJson.name = packageJson.name || "book";
                packageJson.version = packageJson.version || "0.0.0";
                packageJson.dependencies = packageJson.dependencies || {};

                // Don't add default plugins to package.json
                plugins = _.without.apply(null, [plugins].concat(DEFAULT_PLUGINS));

                // Add plugins dependencies
                _.each(plugins, function(plugin) {
                    plugin = PLUGIN_PREFIX+plugin;
                    packageJson.dependencies[plugin] = packageJson.dependencies[plugin] || "*";
                });

                // Remove unused plugins dependencies
                packageJson.dependencies = _.omit(packageJson.dependencies, function(value, name) {
                    if (name.indexOf(PLUGIN_PREFIX) !== 0) return false;

                    name = name.slice(PLUGIN_PREFIX.length);
                    return !_.contains(plugins, name);
                });

                return book.write("package.json", JSON.stringify(packageJson, null, 4));
            });
        }
    });

    return Plugins;
});