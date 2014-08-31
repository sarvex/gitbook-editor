define([
    "hr/hr"
], function(hr) {
    var GlossaryEntry = hr.Model.extend({
        defaults: {
            id: null,
            name: null,
            description: null
        }
    });

    return GlossaryEntry;
});