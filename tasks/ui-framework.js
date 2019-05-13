import {series, src, dest} from 'gulp';

import merge from 'merge-stream';

import {cleanUIFramework} from './clean-ui-framework';

/**
 * Copy 3rd-party UI framework files to _attachments.
 **/
const _uiFramework = function() {
    const bootstrapCSS = src(settings.externalUICSSDev)
        .pipe(dest(settings.styleOutputPath));

    const bootstrapJS = src(settings.externalUIJSDev)
        .pipe(dest(settings.codeOutputPath));

    return merge(bootstrapCSS, bootstrapJS);
};

export const uiFramework = series(cleanUIFramework, _uiFramework);
