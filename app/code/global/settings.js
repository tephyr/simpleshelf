/**
 * Store application-wide settings.
 * @return Singleton
 **/
import {Backbone} from 'DefaultImports';

const SettingsModel = Backbone.Model.extend({

});

const appSettings = new SettingsModel();
export {appSettings};
