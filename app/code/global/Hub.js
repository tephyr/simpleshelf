import {Backbone, _} from 'DefaultImports';
import {CouchUtils} from 'couchutils';

/**
 * Hub module for applicaiton.
 * @type {Object}
 * Brokered events:
 * - app:navigate           (any view signals a route change)
 * - app:requestlogin
 * - router:navigate        (Hub triggers a route change)
 * - routechanged           (router navigated to different route)
 */
class HubModule {
    constructor() {
        this._logHeader = '[Hub]';
    }

    setupEvents() {
        this.on('app:navigate', this.onNavigate);
        this.on('app:requestlogin', this.onRequestLogin);
    }

    onNavigate(data) {
        let url;
        // This call is a little different than the native Backbone navigate,
        // to keep it similar to all other calls: {url: String, options: Object}.
        console.info(this._logHeader, "navigate", data);
        if (_.has(data, "url")) {
            url = data.url;
        } else {
            // Construct URL from data.
            switch(data.view) {
                case "book":
                    url = "books/" + data.id;
                    break;
                default:
                    url = "main";
                    break;
            }

        }
        // By default, trigger the route method; to disable, set ``trigger==false``.
        // This is opposite of Backbone's default.
        this.trigger('router:navigate', url, _.extend({trigger: true}, data.options));
    }

    onRequestLogin(data) {
        console.info(this._logHeader, "requestlogin", data);
        CouchUtils.login(data.username, data.password)
            .done(() => {
                console.log(this._logHeader, "Logged in!");
                // Proceed to main page.
                this.trigger("app:navigate", {url: "main"});
            })
            .fail(() => {
                console.warn(this._logHeader, "Login failed!");
                // Stay on current page.
                // TODO: warn user about login failure.
            });
    }
};

// Instantiate as singleton.
const hub = new HubModule();
// Enable event broker.
_.extend(hub, Backbone.Events);
hub.setupEvents();

export {hub as Hub};
