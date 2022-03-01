// Prepare CouchDB for usage.
// Assumes that the CouchDB server is available.
// Requirements: url module (built-in), and nano, 3rd-party module.
const url = require('url'); // node.js built-in;

function prepEmptyStatusResponse() {
    return {result: false, output: []};
}

async function pingServer(couchdbURL) {
    const nano = require('nano')(couchdbURL);
    let response;
    let result = prepEmptyStatusResponse();

    try {
        response = await nano.request({path: '/_up'});
        console.info(response);
        result.result = true;
        result.output.push(response);
    } catch(e) {
        console.error(e, response);
        result.output.push(response);
    }

    return result;
}

async function verifyUser(couchdbURL, userName, password) {
    const nano = require('nano')(couchdbURL);
    let response;
    let result = prepEmptyStatusResponse();

    try {
        response = await nano.auth(userName, password);
        console.info(response);
        result.result = true;
        result.output.push(response);
    } catch(e) {
        console.error(e, response);
        result.output.push(response);
    }

    return result;
}

async function checkDB(couchdbURL, userName, password, dbs) {
    const nano = require('nano')({
        url: couchdbURL,
        requestDefaults: {
            jar: true
        }
    });

    // Authenticate w/cookies.
    await nano.auth(userName, password);

    // Get current list of databases.
    const dblist = await nano.db.list()

    // Loop through all dbs and add any missing.
    const output = [];
    let flagFailure = false;

    // Using a for loop as Array.forEach does not wait for asynchronous functions.
    for (const db of dbs) {
        if (!dblist.includes(db)) {
            try {
                await nano.db.create(db);
                output.push(`Created ${db}`);
            } catch (e) {
                flagFailure = true;
                output.push(`Failed when creating ${db}`);
                output.push(e);
                break;
            }
        }
    }

    return {result: !flagFailure, output};
}

async function addDB() {

}

async function run(host, port, userName, password, dbs) {
    // Collect *all* results;
    const results = prepEmptyStatusResponse();

    // Build full URL with authentication.
    let urlNoAuth = new URL(`http://${host}:${port}/`);

    // Ping server (/_up).
    let result = await pingServer(urlNoAuth.href);
    results.output.push(...result.output);

    if (!result.result) {
        return results;
    }

    // Verify user (TBD).
    result = await verifyUser(urlNoAuth.href, userName, password);
    results.output.push(...result.output);

    if (!result.result) {
        return results;
    }

    // Check if databases exist.
    // Add databases if necessary.
    result = await checkDB(urlNoAuth.href, userName, password, dbs);
    results.output.push(...result.output);

    if (!result.result) {
        return results;
    }

    // Report results.
    results.result = true;
    console.log("[RESULTS]", results);
    return results;
}

exports.run = run;
