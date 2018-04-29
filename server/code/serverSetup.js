const config = require('config'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path');

const SETUPSTATUSFILE = 'setup-status.json';

function isSetupNecessary() {
    let result = true;
    const cfgPath = path.join(process.env.NODE_CONFIG_DIR_HOST, SETUPSTATUSFILE);

    // Does file exist?
    if (fs.existsSync(cfgPath)) {
        try {
            // Does it have the right keys?
            const setupCFG = JSON.parse(fs.readFileSync(cfgPath));
            if (_.get(setupCFG, 'setupComplete', false)) {
                result = false;
            }
        } catch(exc) {
            // Any error accessing the file means that setup is required.
            console.debug(exc.message);
        }
    }

    return result;
}

function run() {
    if (isSetupNecessary()) {
        console.info('Setup IS necessary.');
    } else {
        console.info('Setup is NOT necessary.');
    }
}

exports.run = run;
