import path from 'path';
import fs from 'fs';
import del from 'del';
import compile from 'couchdb-compile';

import {series, src, dest} from 'gulp';

const outputTempFn = () => { return `${global.settings.ddocOutput}-temp`; };

/**
 * Clean the output directory.
 */
const _clean_ddoc = function() {
    return del([
        global.settings.ddocOutput,
        outputTempFn()
    ]);
};

/**
 * Copy design doc files to output.
 **/
const _copy_ddoc = () => {
    return src(global.settings.globs.ddoc)
        .pipe(dest(outputTempFn()));
};

/**
 * Take global modules and install them to {ddocOutput/views/lib}.
 */
const _copy_ddoc_modules = (cb) => {
    if (global.settings.ddocModules.length === 0) {
        cb();
    } else {
        const moduleDest = path.join(outputTempFn(), 'views', 'lib');
        console.info('[_copy_ddoc_modules]', moduleDest, global.settings.ddocModules);
        return src(global.settings.ddocModules)
            .pipe(dest(moduleDest));
    }
};

/**
 * Compile design doc directory to single JSON file.
 */
const _compile_ddoc = (cb) => {
    compile(outputTempFn(), (err, doc) => {
        fs.mkdirSync(global.settings.ddocOutput);
        fs.writeFileSync(path.join(global.settings.ddocOutput, 'designdoc.json'), JSON.stringify(doc));
        del.sync([outputTempFn()]);
        cb();
    });
};

/**
 * Run all sub-tasks in order.
 */
export const buildDDoc = series(_clean_ddoc, _copy_ddoc, _copy_ddoc_modules, _compile_ddoc);
