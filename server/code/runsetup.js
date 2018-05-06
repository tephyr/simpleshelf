#!/usr/local/bin/node
process.env.NODE_CONFIG_DIR = "/opt/simpleshelf/config";
process.env.NODE_CONFIG_DIR_HOST = "/opt/simpleshelf/config-host";

const serverSetup = require('./serverSetup');

console.info('runsetup!', process.env.CDB_USER, process.env.CDB_PW);

serverSetup.run();
