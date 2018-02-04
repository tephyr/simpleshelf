const config = require('config');
const express = require('express');
const app = express();
const proxy = require('http-proxy-middleware');
console.info('NODE_ENV: ' + config.util.getEnv('NODE_ENV'));
console.info('[couchdbServer]', config.get('couchdbServer'), '[databaseName]', config.get('databaseName'));
const nano = require('nano')(config.get('couchdbServer')),
    simpleshelfDB = nano.use(config.get('databaseName'));

const port = process.env.PORT || 8080;
const baseProxy = {
    target: config.get('couchdbServer'),
    changeOrigin: true,
    logLevel: 'debug'
};

app.use('/', express.static('output-public'));
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

/*app.all('*', (req, res) => {
    // res.send(`Hello world, from ${req.path} route`);
    console.info(`Rec'd ${req.method} method from ${req.path} path`);
    res.send('!!');
});*/

app.use('/auth', proxy(Object.assign({}, baseProxy, {
    pathRewrite: {
        '^/auth' : ''           // remove base path
    }
})));

app.use('/api', proxy(Object.assign({}, baseProxy, {
    target: config.get('couchdbServer') + '/' + config.get('databaseName'),
    pathRewrite: {
        '^/api' : ''           // remove base path
    }
})));

app.listen(8080, () => console.log(`Example app listening on port ${port}!!!`));
