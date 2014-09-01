define([
    "hr/hr",
    "hr/dom",
    "ace",
    "core/settings",
    "utils/dialogs",
    "text!resources/templates/editor.html"
], function(hr, $, ace, settings, dialogs, templateFile) {
    var aceconfig = ace.require("ace/config");
    aceconfig.set("basePath", "static/ace");

    var textAction = function(before, after) {
        return function() {
            if (this.editor.selection.isEmpty()) {
                this.editor.insert(before+after);
                this.editor.selection.moveCursorBy(0, -(after.length));
            } else {
                var c = this.editor.session.getTextRange(this.editor.getSelectionRange());
                this.editor.session.replace(this.editor.getSelectionRange(), before+c+after);
            }

            this.editor.focus();
        };
    };

    var textInteractiveAction = function(title, fields, getter) {
        return function() {
            var that = this;

            dialogs.fields(title, fields)
            .then(getter.bind(this))
            .then(function(o) {
                return textAction(o[0], o[1]).call(that);
            })
            .fail(function(err) {
                console.error(err);
            })
        };
    };

    var ACTIONS = {
        "bold": {
            bindKey: {
                win: "Ctrl-B",
                mac: "Command-B"
            },
            action: textAction("**", "**")
        },
        "italic": {
            bindKey: {
                win: "Ctrl-I",
                mac: "Command-I"
            },
            action: textAction("*", "*")
        },
        "strikethrough": {
            bindKey: {
                win: "Alt-Shift-5",
                mac: "Alt-Shift-5"
            },
            action: textAction("~~", "~~")
        },
        "title-1": {
            bindKey: {
                win: "Ctrl-Alt-1",
                mac: "Command-Alt-1"
            },
            action: textAction("# ", "\n")
        },
        "title-2": {
            bindKey: {
                win: "Ctrl-Alt-2",
                mac: "Command-Alt-2"
            },
            action: textAction("## ", "\n")
        },
        "title-3": {
            bindKey: {
                win: "Ctrl-Alt-3",
                mac: "Command-Alt-3"
            },
            action: textAction("### ", "\n")
        },
        "title-4": {
            bindKey: {
                win: "Ctrl-Alt-4",
                mac: "Command-Alt-4"
            },
            action: textAction("#### ", "\n")
        },
        "list-ul": {
            bindKey: {
                win: "Ctrl-Alt-7",
                mac: "Command-Alt-7"
            },
            action: textAction("* ", "\n")
        },
        "list-ol": {
            bindKey: {
                win: "Ctrl-Alt-8",
                mac: "Command-Alt-8"
            },
            action: textAction("1. ", "\n")
        },
        "code": {
            bindKey: {
                win: "Ctrl-Alt-9",
                mac: "Command-Alt-9"
            },
            action: textAction("```\n", "```\n")
        },
        "table": {
            action: textInteractiveAction("Add a table", {
                "rows": {
                    'label': "Rows",
                    'type': "number",
                    'default': 2
                },
                "columns": {
                    'label': "Columns",
                    'type': "number",
                    'default': 2
                }
            }, function(info) {
                var before = "";
                var after = "";

                for (var y = 0; y <= info.rows; y++) {
                    var line = "|";

                    for (var x = 0; x < info.columns; x++) {
                        line = line + (y == 1 ? " -- |": " "+x+":"+y+" |");
                    }

                    before = before+line+"\n";
                }

                return [after, before]
            })
        },
        "link": {
            bindKey: {
                win: "Ctrl-K",
                mac: "Command-K"
            },
            action: textInteractiveAction("Add a link", {
                "href": {
                    'label': "Link",
                    'type': "text",
                    'default': "http://"
                }
            }, function(info) {
                return ["[", "]("+info.href+")"];
            })
        },
        "image": {
            action: textInteractiveAction("Add an image", {
                "href": {
                    'label': "Link",
                    'type': "text",
                    'default': "http://"
                }
            }, function(info) {
                return ["![", "]("+info.href+")"];
            })
        }
    }


    var Editor = hr.View.extend({
        className: "book-section editor",
        template: templateFile,
        events: {
            "click .action-save": "doSave",
            "click .action-glossary-edit": "glossaryEdit",
            "click .action-text-bold": ACTIONS["bold"].action,
            "click .action-text-italic": ACTIONS["italic"].action,
            "click .action-text-strikethrough": ACTIONS["strikethrough"].action,
            "click .action-text-title-1": ACTIONS["title-1"].action,
            "click .action-text-title-2": ACTIONS["title-2"].action,
            "click .action-text-title-3": ACTIONS["title-3"].action,
            "click .action-text-title-4": ACTIONS["title-4"].action,
            "click .action-text-list-ul": ACTIONS["list-ul"].action,
            "click .action-text-list-ol": ACTIONS["list-ol"].action,
            "click .action-text-code": ACTIONS["code"].action,
            "click .action-text-table": ACTIONS["table"].action,
            "click .action-text-link": ACTIONS["link"].action,
            "click .action-text-image": ACTIONS["image"].action,
            "click .action-help": "doOpenHelp"
        },

        initialize: function() {
            Editor.__super__.initialize.apply(this, arguments);

            this.book = this.parent;

            this.$editor = $("<div>", {'class': "editor"});
            this.$editor.appendTo(this.$el);

            this.ignoreChange = false;

            this.editor = ace.edit(this.$editor.get(0));

            this.editor.on("change", function() {
                if (this.ignoreChange || !this.book.currentArticle) return;

                var content = this.editor.getValue();
                this.book.writeArticle(this.book.currentArticle, content);
            }.bind(this));

            this.editor.setTheme({
                'isDark': false,
                'cssClass': "ace-tm",
                'cssText': "",
                'padding': 10
            });
            this.editor.getSession().setMode("ace/mode/markdown");
            this.editor.setOption("showGutter", false);
            this.editor.setShowPrintMargin(false);
            this.editor.setHighlightActiveLine(false);
            this.editor.session.setUseWrapMode(true);
            this.editor.commands.addCommand({
                name: 'save',
                bindKey: {
                    win: 'Ctrl-S',
                    mac: 'Command-S'
                },
                exec: function(editor) {
                    this.doSave();
                }.bind(this),
                readOnly: false
            });
            this.editor.commands.addCommands([{
                name: "showSettingsMenu",
                bindKey: {
                    win: "Ctrl-Shift-P",
                    mac: "Command-Shift-P"
                },
                exec: function(editor, line) {
                    return false;
                },
                readOnly: true
            }]);

            _.each(ACTIONS, function(action, name) {
                if (!action.bindKey) return;

                this.editor.commands.addCommands([{
                    name: "editor-"+name,
                    bindKey: action.bindKey,
                    exec: action.action.bind(this),
                    readOnly: true
                }]);
            }, this);

            this.editor.renderer.scrollBarV.element.addEventListener("scroll",  _.throttle(function(e) {
                var h = this.scrollTop();
                var th = this.$(".content").height();
                if (this.parent.preview.autoScroll) this.parent.preview.scrollTop((h*100)/th);
            }, 50).bind(this));

            this.on("grid:layout", function() {
                this.editor.resize();
                this.editor.renderer.updateFull();
            }, this);

            this.listenTo(this.book, "article:open", this.onArticleChange);
            this.listenTo(this.book, "article:state", this.onArticleState);
            this.listenTo(this.book, "article:save", this.onArticleSave);
            this.listenTo(settings, "change:autoSave", this.update);
            this.listenTo(settings, "change:keyboardHandler", this.updateEditorOptions);
            this.listenTo(settings, "change:wordWrap", this.updateEditorOptions);
            this.listenTo(settings, "change:editorFontSize", this.updateEditorOptions);

            this.updateEditorOptions();
        },

        templateContext: function() {
            return {
                autosave: settings.get("autoSave")
            }
        },

        updateEditorOptions: function() {
            var wordWrap = settings.get("wordWrap");
            var editorFontSize = settings.get("editorFontSize");

            if (wordWrap == "off") {
                this.editor.session.setUseWrapMode(false);
            } else {
                wordWrap = wordWrap == "free" ? null : Number(wordWrap);
                this.editor.session.setUseWrapMode(true);
                this.editor.session.setWrapLimitRange(wordWrap, wordWrap);
            }

            this.editor.setKeyboardHandler("ace/keyboard/"+settings.get("keyboardHandler"));
            this.editor.setFontSize(editorFontSize);
        },

        scrollTop: function() {
            return $(this.editor.renderer.scrollBarV.element).scrollTop();
        },

        render: function() {
            this.$editor.detach();
            return Editor.__super__.render.apply(this, arguments);
        },

        finish: function() {
            // Add ace editpr
            this.$editor.appendTo(this.$(".content"));

            // Tooltip
            this.$('.toolbar button').tooltip({
                container: 'body'
            });

            return Editor.__super__.finish.apply(this, arguments);
        },

        glossaryEdit: function(e) {
            if (this.editor.selection.isEmpty()) {
                this.book.editGlossaryTerm();
            } else {
                var c = this.editor.session.getTextRange(this.editor.getSelectionRange());
                this.book.editGlossaryTerm(c);
            }
        },

        // When the user opens another article
        onArticleChange: function(article) {
            var that = this;

            this.book.readArticle(article)
            .then(function(content) {
                var state = that.book.getArticleState(article);
                that.onArticleState(article, state.saved);

                that.ignoreChange = true;
                that.editor.session.setValue(content);
                that.editor.gotoLine(0);
                that.ignoreChange = false;
            }, dialogs.error);
        },

        // When the state of the current article change
        onArticleState: function(article, state) {
            if (article.get("path") != this.book.currentArticle.get("path")) return;
            this.$(".action-save").toggleClass("disabled", state);
            this.$(".action-save").toggleClass("btn-warning", !state);
        },

        // Update editor if article has been normalized
        onArticleSave: function(article, content) {
            if (article.get("path") != this.book.currentArticle.get("path")) return;
            if ( this.editor.session.doc.getValue() == content) return;

            var pos = this.editor.getCursorPosition();
            var selection = this.editor.getSelectionRange();

            // We need to have line to calculate new positions
            // and ensure they don't "overflow"
            var lines = content.split('\n');

            this.ignoreChange = true;

            // We are doing the same as editor.session.setValue without reseting the undomanager
            this.editor.session.doc.setValue(content);
            this.editor.moveCursorTo(pos.row, pos.column);
            this.editor.getSession().getSelection().setSelectionAnchor(selection.start.row, selection.start.column);
            this.editor.getSession().getSelection().selectTo(selection.end.row, selection.end.column);
            this.editor.session.$resetRowCache(0);
            this.editor.session.$deltas = [];
            this.editor.session.$deltasDoc = [];
            this.editor.session.$deltasFold = [];
            this.editor.session.setUndoManager(this.editor.session.$undoManager);


            this.ignoreChange = false;
        },

        // Save the article
        doSave: function(e) {
            if (e) e.preventDefault();
            this.book.saveArticle(this.book.currentArticle);
        },

        // Open the help about markdown
        doOpenHelp: function() {
            node.gui.Shell.openExternal("https://www.gitbook.io/book/gitbookio/markdown");
        }
    });

    return Editor;
});