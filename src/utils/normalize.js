define([], function() {
    // Remove extra whitespace on the right of lines
    var whitespace = function(str) {
        return str.split('\n')
        .map(function(line) { return line.trimRight(); })
        .join('\n');
    };

    // Ensure file is correctly termined by a newline
    var eof = function(str) {
        return str[str.length-1] === '\n' ? str : str + '\n';
    };

    return {
        eof: eof,
        whitespace: whitespace,
    };
});
