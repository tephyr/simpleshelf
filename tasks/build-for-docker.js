import {series} from 'gulp';
import {buildApp} from './build-app';
import {copyDocs} from './copy-docs';
import {buildDDoc} from './build-ddoc';

/**
 * build-for-docker: prep everything in ./output
 */
export const buildForDocker = series(buildApp, copyDocs, buildDDoc);
