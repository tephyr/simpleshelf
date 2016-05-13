/**
 * Combine all configuration files, by configurationType.
 * Expect at least 2: simpleshelf.configuration.default and simpleshelf.configuration.custom.
 */
function(doc) {
    var _ = require('views/lib/underscore');

    if (_.has(doc, "type") && doc.type === "configuration") {
        emit(doc.configurationType || "unknown", doc);
    }
}
