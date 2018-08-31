module.exports = function(gulp, settings) {
    const _ = require('lodash'),
        fs = require('fs'),
        globby = require('globby'),
        path = require('path');

    // Combine all documents into single array, under {"docs": []}, and write to disk.
    gulp.task("bulk-update-file", function(cb) {
        let pathGlobs = _.values(settings._docs),
            bulkDocs = {"docs": []},
            paths = globby.sync(pathGlobs);

        _.each(paths, function(jsonPath) {
            bulkDocs.docs.push(JSON.parse(fs.readFileSync(path.join(process.cwd(), jsonPath), 'utf8')));
        });

        fs.writeFile(path.join(process.cwd(), 'bulk-update-file.json'), JSON.stringify(bulkDocs), 'utf8', cb);
    });
};
