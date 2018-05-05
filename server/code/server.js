const config = require('config');
const express = require('express');
const app = express();
const proxy = require('http-proxy-middleware');
const serverSetup = require('./serverSetup');
let svrConfig;

function loadSideConfig() {
    // Load from host config; all values overwrite standard config.
    const sideCfg = config.util.loadFileConfigs(process.env.NODE_CONFIG_DIR_HOST);

    // config object made immutable by first .get()
    svrConfig = config.util.extendDeep({}, config, sideCfg);
}

loadSideConfig();

console.info('NODE_ENV:', svrConfig.util.getEnv('NODE_ENV'));
console.info('NODE_CONFIG_DIR: ' + svrConfig.util.getEnv('NODE_CONFIG_DIR'));
console.info('NODE_CONFIG_DIR_HOST:', process.env.NODE_CONFIG_DIR_HOST);
console.info(`Running node ${process.version} on ${new Date().toISOString()}`);
console.info('[couchdbServer]', svrConfig.get('couchdbServer'), '[databaseName]', svrConfig.get('databaseName'),
    '[designDoc]', svrConfig.get('designDoc'));

const nano = require('nano')(svrConfig.get('couchdbServer')),
    simpleshelfDB = nano.use(svrConfig.get('databaseName'));

const port = process.env.PORT || 8080;
const baseProxy = {
    target: svrConfig.get('couchdbServer'),
    changeOrigin: true,
    logLevel: 'debug'
};

/* ROUTES */
// Main: static files from webapp/
app.use('/', express.static('webapp'));

// Access info about current db through nano.
app.get('/simpleshelf', (req, res) => {
    nano.db.list(function(err, body) {
        if (err) {
            console.warn(err);
            res.send('Error when retrieving current databases.');
        } else {
            // body is an array
            body.forEach(function(db) {
                console.log(db);
            });
            res.send('Listed current databases to console.');
        }
    });
});

// Access session calls
app.use('/auth/_session', proxy(Object.assign({}, baseProxy, {
    pathRewrite: {
        '^/auth' : ''           // remove base path
    }
})));

// Access data from current db.
app.use('/data', proxy(Object.assign({}, baseProxy, {
    target: svrConfig.get('couchdbServer') + '/' + svrConfig.get('databaseName'),
    pathRewrite: {
        '^/data' : ''           // remove base path
    }
})));

// Access specific view functions from current design doc.
// api/_design/simpleshelfmobile/_view/global
app.use('/view', proxy(Object.assign({}, baseProxy, {
    target: svrConfig.get('couchdbServer') + '/' + svrConfig.get('databaseName'),
    pathRewrite: {
        '^/view' : '/_design/' + svrConfig.get('designDoc') + '/_view/'
    }
})));

// Check if server is properly setup.
if (serverSetup.isSetupNecessary()) {
    console.warn('Server requires setup; exiting.');
    process.exitCode = 2;
} else {
    app.listen(port, () => {
        console.log(`Example app listening (internally) on port ${port}`);
        console.info('');
    });
}
