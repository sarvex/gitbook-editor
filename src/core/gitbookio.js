define([
    "core/settings"
], function(settings) {
    var GitBook = node.require("gitbook-api");
    var client = new GitBook();

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

    return client;
});