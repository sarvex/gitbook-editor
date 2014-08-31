define([
    "hr/hr"
], function(hr) {
    var Plugin = hr.Model.extend({
        idAttribute: "name",
        defaults: {
            name: null,
            config: {}
        }
    });

    return Plugin;
});