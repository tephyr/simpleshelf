import {series} from 'gulp';

import {bundleLib} from './bundle-lib';
import {code} from './code';
import {uiFramework} from './ui-framework';
import {uiLocal} from './ui-local';

/**
 * Build files locally.
 **/
export const buildApp = series(bundleLib, code, uiFramework, uiLocal);
