define([
    "hr/dom",
    "hr/utils",
    "hr/promise",
    "hr/hr"
], function($, _, Q, hr) {
    var LoadingBar = hr.View.extend({
        className: "loadingbar",

        initialize: function() {
            LoadingBar.__super__.initialize.apply(this, arguments);

            this.$message = $("<span>", {
                'class': "message"
            });
            this.$message.appendTo(this.$el);

            this.listenTo(this.model, "change", this.update);
        },
        render: function() {
            this.$message.text(this.model.get("content"));
            return this.ready();
        },

        // Show/Hide loading bar
        toggle: function(st) {
            $("body").toggleClass("show-loadingbar", st);
        },

        // Show loading promise
        show: function(p, msg) {
            var that = this;

            this.toggle(true);
            this.model.set("content", msg);

            p.then(function() {
                return Q.delay(300);
            })
            .fin(function() {
                that.toggle(false);
            });

            return p;
        }
    });

    var loading = new LoadingBar({
        model: new hr.Model()
    });

    return loading;
});