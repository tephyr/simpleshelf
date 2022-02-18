const _ = require('lodash');
const serverConfiguration = require('./serverConfiguration');
const express = require('express');
const app = express();
const proxy = require('http-proxy-middleware');
const serverSetup = require('./serverSetup');
const bodyParser = require('body-parser');
const prepCouchDB = require('./prepCouchDB');

console.log('server.js: START');
console.log('process.cwd', process.cwd());

let svrConfig = serverConfiguration.loadSideConfig();

console.info('NODE_ENV:', svrConfig.util.getEnv('NODE_ENV'));
console.info('NODE_CONFIG_DIR: ' + svrConfig.util.getEnv('NODE_CONFIG_DIR'));
console.info('NODE_CONFIG_DIR_HOST:', process.env.NODE_CONFIG_DIR_HOST);
console.info(`Running node ${process.version} on ${new Date().toISOString()}`);
console.info(`ENV variable(s): COUCHDB_USER: ${process.env.COUCHDB_USER}`);
console.info('[couchdbServer]', svrConfig.get('couchdbServer'), '[databaseName]', svrConfig.get('databaseName'),
    '[designDoc]', svrConfig.get('designDoc'));

app.use(bodyParser.json());

const nano = require('nano')(svrConfig.get('couchdbServer')),
    simpleshelfDB = nano.use(svrConfig.get('databaseName'));

const port = process.env.PORT || 8080;
const baseProxy = {
    target: svrConfig.get('couchdbServer'),
    changeOrigin: true,
    logLevel: 'debug'
};

const serverDocumentIO = require('./serverDocumentIO');

/* ROUTES */
// Main: static files from webapp/
app.use('/', express.static('webapp'));

// Access info about current db through nano.
app.get('/serverinfo', (req, res) => {
    (async function foo() {
        const couchdbInfo = await nano.request({
            path: '/'
        });
        
        const body = await nano.db.list().catch((err) => {
            console.warn(err);
            res.send('Error when retrieving current databases.');
        });

        console.log(couchdbInfo);
        // body is an array
        body.forEach(function(db) {
            console.log(db);
        });

        res.send('Printed server info to console.');
    }());
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

// Get the database's data in bulk-load-ready format.
app.get('/getdocs', (req, res) => {
    (async function bkp() {
        // console.info('Has Basic Auth?', req.headers.authorization);
        // console.info('Has Cookie?', req.headers.cookie);

        const db = await getDBConn(req);
        let documents = await serverDocumentIO.getDocuments(db);
        console.info('/getdocs', `# of documents: ${documents.length}`);
        res.send({
            count: documents.length,
            docs: documents
        });
    })();
});

// Add documents to db.
app.post('/setdocs', (req, res) => {

    (async function bulkUpdate(){
        const db = await getDBConn(req);
        let updateResponse = await serverDocumentIO.setDocuments(db, req.body);
        console.info(updateResponse);
        res.send(updateResponse);
    }());

});

async function getDBConn(req) {
    const nanoDB = require('nano')({
        url: svrConfig.get('couchdbServer'),
        cookie: req.headers.cookie,
        requestDefaults: { jar:true }
    }).use(svrConfig.get('databaseName'));

    let sessionInfo = await nanoDB.session();
    return nanoDB;
}

// Initialize CouchDB.
(async () => {
    console.log('CouchDB prep: START');
    const requiredDBs = ['_global_changes', '_replicator', '_users'];
    const results = await prepCouchDB.run(
        svrConfig.get('couchdbServerName'),
        svrConfig.get('couchdbServerPort'),
        process.env.COUCHDB_USER,
        process.env.COUCHDB_PASSWORD,
        requiredDBs
    );
    console.log('CouchDB prep: FINISH; result==', results.result);
    console.log(results);
})();

// Check if server is properly setup.
if (serverSetup.isSetupNecessary()) {
    console.warn('Server requires setup; exiting.');
    // process.exitCode = 2;
} else {
    app.listen(port, () => {
        console.log(`Example app listening (internally) on port ${port}`);
        console.info('');
    });
}
