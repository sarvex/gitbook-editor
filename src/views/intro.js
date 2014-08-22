define([
    "hr/hr",
    "hr/utils",
    "hr/promise",
    "hr/dom",
    "text!resources/templates/intro.html"
], function(hr, _, Q, $, templateFile) {
    var Intro = hr.View.extend({
        className: "editor-intro",
        template: templateFile,
        events: {

        },

        initialize: function() {
            Intro.__super__.initialize.apply(this, arguments);
        },

        // Toggle visibility of introduction
        toggle: function(st) {
            this.$el.toggle(st);
        }
    });

    return Intro;
});