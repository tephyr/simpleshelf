const _ = require('lodash'),
    cdbPush = require('couchdb-push'),
    notifier = require("node-notifier");

import {series} from 'gulp';
import {buildDDoc} from './build-ddoc';

/**
 * Push SOURCE to DESTINATION using couchdb-push.
 **/
const _push = function(cb) {
    console.info("Pushing", global.settings.ddocOutput, "to", global.settings.destination);
    cdbPush(global.settings.destination, global.settings.ddocOutput, function(err, resp) {
        if (_.isObject(err)) {
            // Handle failure.
            console.error(err);
            return cb(err);
        } else {
            // Handle success.
            console.log(resp);
            notifier.notify({title: 'push', message: JSON.stringify(resp, null, ' ')});
            return cb();
        }
    });
};

export const push = series(buildDDoc, _push);
