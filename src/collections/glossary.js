define([
    "hr/hr",
    "hr/utils",
    "models/glossaryEntry"
], function(hr, _, GlossaryEntry) {
    var parseGlossary = node.require("gitbook").parse.glossary;

    var Glossary = hr.Collection.extend({
        model: GlossaryEntry,

        /*
         *  Parse GLOSSARY.md content to extract entries
         */
        parseGlossary: function(content) {
            var entries = parseGlossary(content);

            try {
                this.reset(entries);
            } catch (e) {
                console.error(e.stack);
            }

        },

        /*
         *  Return a markdown representation of the glossary
         */
        toMarkdown: function() {
            var bl = "\n";

            return this.map(function(entry) {
                return "## "+entry.get("name")+bl+bl+entry.get("description");
            }).join(bl+bl);
        }
    });

    return Glossary;
});