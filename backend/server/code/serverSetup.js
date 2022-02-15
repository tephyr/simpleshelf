const config = require('config'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    nano = require('nano'),
    serverConfiguration = require('./serverConfiguration');

const SETUPSTATUSFILE = 'setup-status.json';
const SETUPSTATUSPATH = path.join(process.env.NODE_CONFIG_DIR_HOST, SETUPSTATUSFILE);

/**
 * Check if setup is necessary.
 * @return {Boolean}
 */
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
 * Cheap way to authenticate to CouchDB server: http://username:password@server/
 * @param  {Object} cfg
 * @return {String}     URL to server with authentication embedded
 */
function _getAuthURL(cfg, auth) {
    // Insert credentials into URL.
    const protocolEnd = cfg.get('couchdbServer').indexOf('://') + 3;
    const protocol = cfg.get('couchdbServer').substring(0, protocolEnd);
    const strippedURL = cfg.get('couchdbServer').substring(protocolEnd);

    return `${protocol}${auth.user}:${auth.password}@${strippedURL}`;
}

/**
 * Check if database already exists; if not, add it.
 * @param {Object} cfg
 * @param {Object} authURL
 */
async function addDatabase(cfg, authURL) {
    const funcName = '[addDatabase]';
    const nanoDriver = nano(authURL);
    const nanoListDbs = util.promisify(nanoDriver.db.list);
    const databaseName = cfg.get('databaseName');

    const currentDbs = await nanoListDbs();
    if (!_.includes(currentDbs, databaseName)) {
        // add
        console.debug(funcName, `Adding ${databaseName}`);
        const nanoCreateDb = util.promisify(nanoDriver.db.create);
        return nanoCreateDb(databaseName);
    } else {
        console.debug(funcName, `${databaseName} already exists.`);
        return `${databaseName} already exists.`;
    }
}

/**
 * Helper fn: write setup configuration to disk.
 * @param {Object} cfg
 */
async function _setSetupConfiguration(cfg) {
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(SETUPSTATUSPATH, JSON.stringify(cfg));
}

/**
 * Run whole setup process.
 * @param  {Object} cfg
 * @param  {Object} auth
 * @return {String|Object}      success msg/bulkFN result
 */
async function setupAsync(cfg, auth={user:'', password:''}) {
    const funcName = '[setupAsync]';
    const authURL = _getAuthURL(cfg, auth);
    
    // Create database, if missing.
    await addDatabase(cfg, authURL);

    const dbURL = `${authURL}/${cfg.get('databaseName')}`;
    console.debug(funcName, dbURL, cfg.defaults.designDoc);

    const nanoDriver = nano(authURL);

    const db = nanoDriver.use(cfg.get('databaseName'));
    const bulkFn = util.promisify(db.bulk);

    // Load design doc & default docs.
    const docs = [
        JSON.parse(fs.readFileSync(cfg.defaults.designDoc))
    ];

    _.forEach(fs.readdirSync(cfg.defaults.docs), (docName) => {
        docs.push(JSON.parse(fs.readFileSync(path.join(cfg.defaults.docs, docName))));
    });

    // Upload docs.
    return bulkFn({docs}).then(() => {
        console.debug(funcName, 'Added all docs.');
        return "Complete.";
    }, (msgData) => {
        console.warn(funcName, 'Failed to add docs.');
        throw msgData;
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
            console.debug(_.omit(msgData, ['request']));
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
