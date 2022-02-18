import {series} from 'gulp';
import {copyDocs} from './copy-docs';
import {buildDDoc} from './build-ddoc';

/**
 * build-for-server: prep everything in ./output related to the node server.
 */
export const buildForServer = series(copyDocs, buildDDoc);
