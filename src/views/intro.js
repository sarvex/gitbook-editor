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
            "click .action-open": "doOpen",
            "click .action-quit": "doQuit"
        },

        initialize: function() {
            Intro.__super__.initialize.apply(this, arguments);
        },

        // Toggle visibility of introduction
        toggle: function(st) {
            this.$el.toggle(st);
        },

        // Open a book
        doOpen: function(e) {
            if (e) e.preventDefault();

            this.parent.openFolderSelection();
        },

        // Quit the application
        doQuit: function(e) {
            if (e) e.preventDefault();

            node.gui.Window.get().close();
        }
    });

    return Intro;
});