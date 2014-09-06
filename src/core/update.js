define([
    "hr/promise",
    "core/gitbookio"
], function(Q, gitbookIO) {
    var request = node.require("request");
    var semver = node.require("semver");
    var pkg = node.require("../package.json");
    var gitbookPkg = node.require("gitbook/package.json");

    var isAvailable = function() {
        return gitbookIO.api.request("get", "editor/infos")
        .then(function(infos) {
            if (semver.gt(infos.version, pkg.version)) {
                return body.version;
            } else {
                return Q.reject(new Error("no updates"));
            }
        });
    };

    return {
        isAvailable: isAvailable,
        version: pkg.version,
        gitbook: {
            version: gitbookPkg.version
        }
    };
});