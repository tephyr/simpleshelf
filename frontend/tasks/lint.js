/**
 * Execute linter on given source files
 * @return {Stream}
 */
function lint() {
    const lintSpecific = require('../util/gulp/lint-specific');
    return lintSpecific(global.settings.globs.appCode);
};

export { lint };
