const express = require('express');
const app = express();
const proxy = require('http-proxy-middleware');
const nano = require('nano')('http://couchdb:5984'),
    simpleshelfDB = nano.use('simpleshelf-dev-personal');

const port = process.env.PORT || 8080;

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

app.use('/api', proxy({
    target: 'http://couchdb:5984',
    changeOrigin: true,
    pathRewrite: {
        '^/api' : ''           // remove base path
    },
    logLevel: 'debug'
}));

app.listen(8080, () => console.log(`Example app listening on port ${port}!!!`));
