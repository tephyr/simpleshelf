const config = require('config'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    push = require('couchdb-push'),
    serverConfiguration = require('./serverConfiguration');

const SETUPSTATUSFILE = 'setup-status.json';
const SETUPSTATUSPATH = path.join(process.env.NODE_CONFIG_DIR_HOST, SETUPSTATUSFILE);

function isSetupNecessary() {
    let result = true;

    // Does file exist?
    console.debug(`Looking for ${SETUPSTATUSPATH}`);
    if (fs.existsSync(SETUPSTATUSPATH)) {
        try {
            // Does it have the right keys?
            const setupCFG = JSON.parse(fs.readFileSync(SETUPSTATUSPATH));
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

/**
 * Helper fn: get setup configuration *data*, or empty object
 * @return {Promise} {}
 */
async function _getSetupConfiguration() {
    let setupCFG = {};
    if (fs.existsSync(SETUPSTATUSPATH)) {
        try {
            setupCFG = JSON.parse(fs.readFileSync(SETUPSTATUSPATH));
        } catch(exc) {
            console.debug(exc.message);
        }
    }

    return setupCFG;
}

/**
 * Helper fn: write setup configuration to disk.
 * @param {Object} cfg
 */
async function _setSetupConfiguration(cfg) {
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(SETUPSTATUSPATH, JSON.stringify(cfg));
}

function setupAsync(cfg, auth={user:'', password:''}) {
    return new Promise((resolve, reject) => {
        const promisePush = util.promisify(push);

        // Insert credentials into URL.
        const protocolEnd = cfg.get('couchdbServer').indexOf('://') + 3;
        const protocol = cfg.get('couchdbServer').substring(0, protocolEnd);
        const strippedURL = cfg.get('couchdbServer').substring(protocolEnd);

        const authURL = `${protocol}${auth.user}:${auth.password}@${strippedURL}`;
        const dbURL = `${authURL}/${cfg.get('databaseName')}`;
        console.debug(dbURL, cfg.defaults.designDoc);

        promisePush(dbURL, cfg.defaults.designDoc).then(() => {
            resolve('!');
        }).catch((msgData) => {
            reject(msgData);
        });
    });
}

/**
 * Run the setup process.
 * @return {Promise}
 */
async function run() {
    if (isSetupNecessary()) {
        console.info(`Setup IS necessary; using ${process.env.CDB_USER} for login`);
        const serverCfg = serverConfiguration.loadSideConfig();
        const setupCfg = await _getSetupConfiguration();
        const result = await setupAsync(serverCfg, {user: process.env.CDB_USER, password: process.env.CDB_PW}).catch((msgData) => {
            console.debug(msgData);
            throw(msgData);
        });

        // Update setup config.
        setupCfg.setupComplete = true;
        await _setSetupConfiguration(setupCfg);

        console.info('setup result:', result);
    } else {
        console.info('Setup is NOT necessary.');
    }

    return 'done';
}

exports.run = run;
exports.isSetupNecessary = isSetupNecessary;
