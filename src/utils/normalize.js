define([], function() {
    var whitespace = function(str) {
        return str.split('\n')
        .map(function(line) { return line.trimRight(); })
        .join('\n');
    };

    return {
        whitespace: whitespace
    };
});
