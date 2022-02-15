/**
 * Combine all configuration files, by configurationType.
 * Expect at least 2: simpleshelf.configuration.default and simpleshelf.configuration.custom.
 */
function(doc) {
    const utils = require('views/lib/utils');

    if (utils.types.isConfig(doc)) {
        emit(doc.configurationType || "unknown", doc);
    }
}
