import del from 'del';

/**
 * Delete the ui framework files.
 **/
export const cleanUIFramework = function() {
    // Enable the force option since the target directory may be a level above the gulpfile.
    return del([
        settings.styleOutputPath + "/bootstrap.*",
        settings.codeOutputPath + "/bootstrap.*"
    ], {force: true});
};
