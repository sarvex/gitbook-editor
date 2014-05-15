define([
    "hr/hr"
], function(hr) {
    var key = "GitBookEditorSettings";
    var SettingsModel = hr.Model.extend({
        defaults: {
            autoFileManagement: true
        },
        getStateFromStorage: function (){
            this.set(hr.Storage.get(key));
        },
        setStateToStorage: function (){
            hr.Storage.set(key, this.toJSON());
        }
    });

    var settings = new SettingsModel({}, {});
    settings.getStateFromStorage();

    return settings;
});