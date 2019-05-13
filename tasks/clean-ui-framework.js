import del from 'del';

/**
 * Delete the ui framework files.
 **/
export const cleanUIFramework = function() {
    return del([
        settings.styleOutputPath + "/bootstrap.*",
        settings.codeOutputPath + "/bootstrap.*"
    ]);
};
