const config = require('config');

function loadSideConfig() {
    // Load from host config; all values overwrite standard config.
    const sideCfg = config.util.loadFileConfigs(process.env.NODE_CONFIG_DIR_HOST);

    // config object made immutable by first .get()
    return config.util.extendDeep({}, config, sideCfg);
}

exports.loadSideConfig = loadSideConfig;
