define([
    "hr/hr"
], function(hr) {
    var PluginEntry = hr.Model.extend({
        idAttribute: "name",
        defaults: {
            name: null,
            config: {}
        }
    });

    return PluginEntry;
});