const config = require('config');
const express = require('express');
const app = express();
const proxy = require('http-proxy-middleware');

console.info('NODE_ENV: ' + config.util.getEnv('NODE_ENV'));
console.info('[couchdbServer]', config.get('couchdbServer'), '[databaseName]', config.get('databaseName'),
    '[designDoc]', config.get('designDoc'));

const nano = require('nano')(config.get('couchdbServer')),
    simpleshelfDB = nano.use(config.get('databaseName'));

const port = process.env.PORT || 8080;
const baseProxy = {
    target: config.get('couchdbServer'),
    changeOrigin: true,
    logLevel: 'debug'
};

/* ROUTES */
// Main: static files from output-public/
app.use('/', express.static('output-public'));

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
    target: config.get('couchdbServer') + '/' + config.get('databaseName'),
    pathRewrite: {
        '^/data' : ''           // remove base path
    }
})));

// Access specific view functions from current design doc.
// api/_design/simpleshelfmobile/_view/global
app.use('/view', proxy(Object.assign({}, baseProxy, {
    target: config.get('couchdbServer') + '/' + config.get('databaseName'),
    pathRewrite: {
        '^/view' : '/_design/' + config.get('designDoc') + '/_view/'
    }
})));

app.listen(port, () => {
    console.log(`Example app listening (internally) on port ${port}`);
    console.info(`Running node ${process.version}`);
});
