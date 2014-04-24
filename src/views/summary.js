define([
    "hr/hr",
    "models/article",
    "utils/dragdrop",
    "utils/dialogs",
    "views/articles",
    "text!resources/templates/summary.html"
], function(hr, Article, dnd, dialogs, ArticlesView, templateFile) {
    var SummaryTrash = hr.View.extend({
        className: "trash",
        initialize: function() {
            var that = this;
            SummaryTrash.__super__.initialize.apply(this, arguments);

            this.summary = this.parent;

            this.$el.html('<i class="fa fa-trash-o"></i> Remove');

            // Drop tabs to order
            this.dropArea = new dnd.DropArea({
                view: this,
                dragType: this.summary.drag,
                handler: function(article) {
                    article.destroy();
                    that.summary.save();
                }
            });
        },
    })

    var Summary = hr.View.extend({
        className: "summary",
        template: templateFile,
        events: {
            "click .add-chapter": "addChapter",
            "click .open-readme": "openReadme"
        },

        initialize: function() {
            Summary.__super__.initialize.apply(this, arguments);

            // Drag and drop of tabs
            this.drag = new dnd.DraggableType();
            this.listenTo(this.drag, "drag:start", function() {
                this.$el.toggleClass("with-trash", true);
            });
            this.listenTo(this.drag, "drag:end", function() {
                this.$el.toggleClass("with-trash", false);
            });

            // Trash
            this.trash = new SummaryTrash({}, this);

            this.articles = new ArticlesView({}, this);

            this.load();
        },

        finish: function() {
            this.articles.$el.appendTo(this.$(".inner"));
            this.trash.$el.appendTo(this.$el);
            return Summary.__super__.finish.apply(this, arguments);
        },

        /*
         * Load summary from SUMMARY.md
         */
        load: function() {
            var that = this;

            this.parent.fs.read("SUMMARY.md")
            .then(function(content) {
                that.articles.collection.parseSummary(content);
            }, function(err) {
                console.log("error", err);
            });
        },

        /*
         * Save summary content
         */
        save: function() {
            var that = this;
            
            return this.parent.fs.write("SUMMARY.md", this.articles.collection.toMarkdown())
            .then(function() {
                return that.load();
            });
        },

        /*
         * Add a new main chapter
         */
        addChapter: function(e) {
            var that = this;
            if (e) e.preventDefault();

            dialogs.prompt("Add New Chapter", "Enter a title for the new chapter", "Chapter")
            .then(function(title) {
                that.articles.collection.add({'title': title});
                that.save();
            });
        },

        /*
         * Open README.md introduction
         */
        openReadme: function(e) {
            if (e) e.preventDefault();
            this.parent.openReadme();
        },

        /*
         * Get article by its path
         */
        getArticle: function(_path, collection) {
            var that = this;
            collection = collection || this.articles.collection;

            if (_path == "README.md") {
                return new Article({}, {
                    title: "Introduction",
                    path: "README.md"
                });
            }

            // Search in this collection
            var article = collection.find(function(_article) {
                console.log("->", _article.get("path"), _path)
                return _article.get("path") == _path;
            });
            if (article) return article;

            // Search in sub collection
            collection.each(function(_article) {
                article = article || that.getArticle(_path, _article.articles);
                if (article) return false;
            });

            return article;
        },
    });

    return Summary;
});