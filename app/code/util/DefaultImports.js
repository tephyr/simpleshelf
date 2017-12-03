import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';
import * as Handlebars from 'handlebars';
import {RegisterHandlebarHelpers} from 'handlebarhelpers';

RegisterHandlebarHelpers(_, Handlebars);

export {$, _, Backbone, Handlebars};
