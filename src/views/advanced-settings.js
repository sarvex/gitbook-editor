define([
  "hr/hr",
  "utils/dialogs",
  "core/fs",
  "hr/dom",
  "text!resources/templates/advanced-settings.html",
  ], function(hr, dialogs, fs, $, templateFile) {
    var key = "GitBookEditorSettings";
    var SettingsModel = hr.Model.extend({
      defaults: {
        autoFileManagement: true
      },
      getStateFromStorage: function (){
        try{
          var o = JSON.parse(localStorage.getItem(key));
          var v, m = this;
          for (k in o){
            v = o[k];
            if (v !== m.get(k))
              m.set(k,v);
          }
        }catch(err){
          console.log(err);
        }
      },
      setStateToStorage: function (){
        localStorage.setItem(key, JSON.stringify(this));
      }
    });
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
        this.model = new SettingsModel({}, {});
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