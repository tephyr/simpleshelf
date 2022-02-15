import _ from 'lodash';
import del from 'del';
import {series, src, dest} from 'gulp';

/**
 * Copy docs to staging directory.
 */
const _cleanDocs = function(cb) {
    return del(settings.docsOutput);
};

const _copyDocs = function() {
    let docsGlobs = [];

    if (_.has(settings, '_docs')) {
        // Combine all values for each key.
        docsGlobs = _.values(settings._docs);
    }

    return src(docsGlobs)
        .pipe(dest(settings.docsOutput));
};

export const copyDocs = series(_cleanDocs, _copyDocs);
