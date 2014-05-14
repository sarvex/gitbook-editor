define([
    "hr/hr",
    "utils/dialogs",
    "core/settings",
    "core/fs",
    "hr/dom",
    "text!resources/templates/advanced-settings.html",
], function(hr, dialogs, settings, fs, $, templateFile) {
    var Settings = hr.View.extend({
        className: "advanced-settings",
        template: templateFile,
        events: {
            "click > #advanced-settings-form li input": "warn",
            "click > .setting-actions .action-save": "save",
            "click > .setting-actions .action-cancel": "toggle"
        },
        defaults: {
                    fs: null
        },
        initialize: function () {
            var that = this;
            Settings.__super__.initialize.apply(this, arguments);
            this.model = settings;
            this.model.getStateFromStorage();
        },
        templateContext: function() {
            var that = this;
            return {
                'settings': that.model
            };
        },
        toggle: function (){
            this.model.getStateFromStorage();
            $(".advanced-settings").toggleClass("displayed");
            $(".setting-actions .action-save").removeClass("btn-warning");
        },
        save: function (){
            var fields = $("#advanced-settings-form").find("input"), value;
            for (var i = 0; i < fields.length; i++) {
                switch (fields[i].type){
                    case "checkbox":
                        value = fields[i].checked;
                        break;
                    default:
                        value = fields[i].value;
                }
                this.model.set(fields[i].name, value);
            };
            this.model.setStateToStorage();
            this.toggle();
        },
        warn: function (){
            $(".setting-actions .action-save").addClass("btn-warning");
        }
    });
    return Settings;
});