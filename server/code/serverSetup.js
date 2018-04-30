const config = require('config'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    push = require('couchdb-push');

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

function setupAsync(cfg) {
    return new Promise((resolve, reject) => {
        const promisePush = util.promisify(push);

        // TODO: use credentials
        const dbURL = `${cfg.get('couchdbServer')}/${cfg.get('databaseName')}`;
        console.debug(dbURL, cfg.defaults.designdoc);

        promisePush(dbURL, cfg.defaults.designdoc).then(() => {
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
function run(svrConfig) {
    const promiseSetup = new Promise((resolve, reject) => {
        if (isSetupNecessary()) {
            console.info('Setup IS necessary.');
            // TODO
            // setupAsync(svrConfig).then(() => {
                resolve('!done');
            // }).catch((msgData) => {
            //     reject(msgData);
            // });
        } else {
            console.info('Setup is NOT necessary.');
            resolve('done');
        }
    });

    return promiseSetup;
}

exports.run = run;
exports.isSetupNecessary = isSetupNecessary;
