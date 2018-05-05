import path from 'path';
import fs from 'fs';
import del from 'del';
import compile from 'couchdb-compile';

module.exports = function(gulp, settings) {
    const outputTemp = `${settings.ddocOutput}-temp`;

    /**
     * Clean the output directory.
     */
    gulp.task('_clean:ddoc', function() {
        return del([
            settings.ddocOutput,
            outputTemp
        ]);
    });

    /**
     * Copy design doc files to output.
     **/
    gulp.task('_copy_ddoc', ['_clean:ddoc'], () => {
        return gulp.src(settings.globs.ddoc)
            .pipe(gulp.dest(outputTemp));
    });

    /**
     * Take global modules and install them to {ddocOutput/views/lib}.
     */
    gulp.task('_copy_ddoc_modules', ['_copy_ddoc'], () => {
        const moduleDest = path.join(outputTemp, 'views', 'lib');
        return gulp.src(settings.ddocModules)
            .pipe(gulp.dest(moduleDest));
    });

    /**
     * Compile design doc directory to single JSON file.
     */
    gulp.task('_compile-ddoc', ['_copy_ddoc_modules'], (cb) => {
        compile(outputTemp, (err, doc) => {
            fs.mkdirSync(settings.ddocOutput);
            fs.writeFileSync(path.join(settings.ddocOutput, 'designdoc.json'), JSON.stringify(doc));
            del.sync([outputTemp]);
            cb();
        });
    });

    /**
     * Run all sub-tasks in order.
     */
    gulp.task('build-ddoc', ['_compile-ddoc']);
};
