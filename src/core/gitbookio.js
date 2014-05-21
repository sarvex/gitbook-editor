define([
    "hr/utils",
    "core/settings",
    "utils/dialogs"
], function(_, settings, dialogs) {
    var GitBook = node.require("gitbook-api");
    var client = new GitBook();
    var gui = node.gui;

    var setConfig = function() {
        client.config = {
            host: settings.get("host") || "https://www.gitbook.io",
            auth: {
                username: settings.get("username"),
                password: settings.get("token")
            }
        };
        client.updateConfig();
    };

    settings.on("set", setConfig);
    setConfig();

    /* Dialog to connect an account */
    var connectAccount = function() {
        return dialogs.fields("Connect your GitBook.io account", {
            username: {
                label: "Username or Email",
                type: "text"
            },
            password: {
                label: "Password",
                type: "password"
            }
        }, {})
        .then(function(auth) {
            return client.login(auth.username, auth.password);
        })
        .then(function() {
            settings.set("username", client.config.auth.username);
            settings.set("token", client.config.auth.password);
            settings.setStateToStorage();
        })
        .then(function() {
            dialogs.alert("Account connected", "You're account is now connected to this computer.");
        }, dialogs.error)
    };

    /* Publish a book */
    var publishBook = function(toPublish) {
        var books, book;

        return client.books()
        .then(function(_books) {
            books = _books;

            return dialogs.fields("Publish this book", {
                book: {
                    label: "Book",
                    type: "select",
                    options: _.chain(books)
                        .map(function(book) {
                            return [
                                book.id,
                                book.id
                            ]
                        })
                        .object()
                        .value()
                },
                version: {
                    label: "Version",
                    type: "text"
                },
            }, {});
        })
        .then(function(build) {
            book =_.find(books, function(_book) {
                return _book.id == build.book;
            });
            if (!build.version) throw "Need a version";

            return book.publishFolder(build.version, toPublish.root());
        })
        .then(function() {
            var link = client.config.host+"/book/"+book.id+"/activity";
            return dialogs.confirm("Do you want to see your build status?", "Your build just started, you can follow the process on the activity tab on your book.")
            .then(function() {
                gui.Shell.openExternal(link);
            });
        }, dialogs.error);
    };

    return {
        api: client,
        connectAccount: connectAccount,
        publishBook: publishBook
    };
});