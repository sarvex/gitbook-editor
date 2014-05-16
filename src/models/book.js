define([
    "hr/hr",
    "hr/promise",
    "hr/utils"
], function(hr, Q, _) {
    var fs = node.require("fs");
    var path = node.require("path");

    var Book = hr.Model.extend({
        defaults: {
            base: ""
        },

        isValidPath: function(_path) {
            return _path.indexOf(this.get("base")) === 0;
        },
        virtualPath: function(_path) {
            return path.relative(this.get("base"), _path);
        },
        realPath: function(_path) {
            return path.join(this.get("base"), _path);
        },

        root: function() {
            return this.realPath("/");
        },

        /*
         * Read a directory content by its path
         *
         * @return Promise([File])
         */
        readdir: function(_path) {
            var that = this;
            _path = this.realPath(_path);

            return Q.nfcall(fs.readdir, _path)
            .then(function(files) {
                return Q.all(
                    _.chain(files)
                    .filter(function(file) {
                        if (file == "." || file == "..") return false;
                        return true;
                    })
                    .map(function(file) {
                        var f_path = path.join(_path, file);

                        return Q.nfcall(fs.stat, f_path)
                        .then(function(_stat) {
                            return {
                                'path': that.virtualPath(f_path),
                                'name': file,
                                'isDirectory': _stat.isDirectory()
                            };
                        });
                    }).__wrapped__
                );
            });
        },

        /*
         * Try to make a directory by its path
         *
         * @return Promise()
         */
        mkdir: function(_path) {
            var that = this;
            return that.exists(_path)
            .then(function(exists){
                if (! exists){
                    _path = that.realPath(_path);
                    return Q.nfcall(fs.mkdir, _path);
                }else{
                    return Q();
                }
            });
        },
        /*
         * Remove a directory by its path
         *
         * @return Promise()
         */
        rmdir: function(_path) {
            var that = this;
            return that.readdir(_path)
            .then(function(files){
                return Q.all(
                    _.map(files, function(file){
                        if (file.isDirectory){
                            return that.rmdir(file.path);
                        }else{
                            return that.unlink(file.path);
                        }
                    })
                );
            })
            .then(function() {
                return Q.nfcall(fs.rmdir, that.realPath(_path));
            });
        },
        /*
         * Read a file by its path
         *
         * @return Promise(String)
         */
        read: function(_path) {
            var that = this;
            _path = this.realPath(_path);

            return Q.nfcall(fs.readFile, _path)
            .then(function(buf) {
                return buf.toString();
            });
        },

        /*
         * Write a file by its path
         *
         * @return Promise()
         */
        write: function(_path, content) {
            var that = this;
            _path = this.realPath(_path);

            return Q.nfcall(fs.writeFile, _path, content);
        },
        /*
         * Unlink a file by its path
         *
         * @return Promise()
         */
        unlink: function(_path) {
            var that = this;
            return that.exists(_path)
            .then(function(exists){
                if (exists){
                    _path = that.realPath(_path);
                    return Q.nfcall(fs.unlink, _path);
                }
                return Q();
            })
        },

        /*
         * Check a file exists
         *
         * @return boolean
         */
        exists: function(_path) {
            var that = this;
            _path = this.realPath(_path);

            var deferred = Q.defer();
            fs.exists(_path, function(exists) {
                deferred.resolve(exists);
            });
            return deferred.promise;
        },

        /*
         *  Valid that is a gitbook
         */
        valid: function() {
            var that = this;

            return that.exists("README.md")
            .then(function(exists) {
                if (!exists) {
                    return Q.reject(new Error("Invalid GitBook: need README.md and SUMMARY.md"));
                }
                return that.exists("SUMMARY.md")
                .then(function(exists) {
                    if (!exists) {
                        return Q.reject(new Error("Invalid GitBook: need README.md and SUMMARY.md"));
                    }
                });
            });
        }
    });

    return Book;
});