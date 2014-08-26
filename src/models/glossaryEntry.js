define([
    "hr/hr"
], function(hr) {
    var path = node.require("path");

    var GlossaryEntry = hr.Model.extend({
        defaults: {
            id: null,
            name: null,
            description: null
        }
    });

    return GlossaryEntry;
});