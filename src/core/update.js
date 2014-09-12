define([
    "hr/promise",
    "core/gitbookio"
], function(Q, gitbookIO) {
    var path = node.require("path");
    var request = node.require("request");
    var semver = node.require("semver");
    var fs = node.require("fs");
    var kramed = node.require("kramed");
    var pkg = node.require("../package.json");
    var gitbookPkg = node.require("gitbook/package.json");
    var __dirname = node.require("../src/dirname");

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

    var getChangeLog = function() {
        return  Q()
        .then(function() {
            return Q.nfcall(fs.readFile, path.join(__dirname, "../CHANGES.md"))
        })
        .then(function(content) {
            return kramed(content.toString());
        })
    };

    return {
        isAvailable: isAvailable,
        getChangeLog: getChangeLog,
        version: pkg.version,
        gitbook: {
            version: gitbookPkg.version
        }
    };
});