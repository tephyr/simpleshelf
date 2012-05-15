/**
 * Hold authentication info for the current instance
 * actions: signup/getcredentials invoke the UI, login/logout interact with the server
 */
window.AuthInfo = Backbone.Model.extend({
    default: {
        'status': null, // loggedIn, loggedOut, adminParty; should match CouchDB
        //'action': null, // signup, getcredentials, login, logout
        'userCtx': {}
    },
    initialize: function(options){
        _.bindAll(this, 'doLogin', 'doLogout', 'getSession',
            'handleLogin', 'handleLogout', 'handleSession'
        );
    },
    url: function(){}, // enforce noop

    /**
     * Login to couch
     * @param options {Object} {error: Function(status, error, reason)}
     */
     doLogin: function(options){
        var me = this;
        var loginOptions = _.extend({
            'name': null,
            'password': null,
            'success': function(response){
                me.handleLogin(response);
            }
        }, options);
        window.simpleshelf.util.authLogin(loginOptions);
    },

    /**
     * Logout of couch
     */
    doLogout: function(){
        var me = this;
        $.couch.logout({
            success: function(response){
                me.handleLogout(response);
            }
        });
    },

    /**
     * Get current session info
     */
    getSession: function(){
        var me = this;
        window.simpleshelf.util.authGetSession(function(results){
            // hand off to local function
            me.handleSession(results);
        });
    },

    /**
     * Process a login call
     */
    handleLogin: function(results){
        if (_.has(results, 'ok') && results.ok == true){
            this.set({'status': 'loggedIn'});
            this.set('userCtx', {'name': results.name, 'roles': results.roles});
            this.trigger('authinfo:authenticationupdated');
        }
    },

    handleLogout: function(results){
        if (_.has(results, 'ok') && results.ok == true){
            this.set({'status': 'loggedOut', 'userCtx': {}});
            this.trigger('authinfo:loggedout');
        }
    },

    /**
     * Process a session call
     */
    handleSession: function(results){
        // parse info, update status & action, fire event
        if (_.has(results, 'authInfo') && results.authInfo.ok == true){
            this.set('status', results.status);
            this.set('userCtx', results.authInfo.userCtx || {});
        } else {
            this.set('status', null);
            this.set('userCtx', {});
        }

        var options = {};
        switch(this.get('status')){
            case 'loggedOut':
                options['action'] = 'getcredentials';
                break;

            case 'loggedIn':
            default:
                options['action'] = null;
                break;
        }

        this.trigger('authinfo:authenticationupdated', options);
    }
});
