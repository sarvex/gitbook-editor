define([], function() {
    var GitBook = node.require("gitbook-api");
    var client = new GitBook({
        host: "http://localhost:5000"
    });

    return client;
});