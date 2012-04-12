/**
 * Models for simpleshelf
 */

/**
 * Individual Activity record
 */
window.Activity = Backbone.Model.extend({
    defaults: {
        date: null,
        action: null
    }
});

/**
 * Collection of Activity records
 */
window.ActivityList = Backbone.Collection.extend({
    model: Activity,
    parse: function(response) {
        var results = [];
        if (response.rows){
            _.each(response.rows, function(element){
                results.push({
                    "date": element.date || null,
                    "action": element.action || null
                });
            });
        }

        return results;
    }
});

/**
 * Model for book
 */
window.Book = Backbone.Model.extend({
    defaults: {
        'type': 'book',
        'status': {'ownership': null, 'read': null},
        'public': true,
        'activities': new ActivityList([])
    },
    url: function(){
        return '/simpleshelf/' + this.get('id');
    },
    initialize: function(attributes){
        console.log('Book', 'initialize');
        _.bindAll(this, "addActivity", "getStatus", "select", "setStatus");
    },

    /**
     * Parse book info, removing activities list, to be parsed by child collection
     * Inspired by http://stackoverflow.com/questions/8501170/backbone-js-view-of-model-containing-collection
     */
    parse: function(resp){
        if (_.has(resp, 'ok') && resp.ok == true){
            // no need to parse
            return;
        }
        if (this.attributes.activities){
            this.attributes.activities.reset(resp.activities);
            delete resp.activities;
        } else {
            resp.activities = new ActivityList(resp.activities);
        }
        return resp;
    },

    /**
     * Add an activity in one call
     * @param opts {Object} {date: date string, action: String}, IOW a valid Activity object's attributes
     **/
    addActivity: function(opts){
        this.get('activities').add(opts);
    },

    getStatus: function(status){
        var statusHash = this.get('status') || {};
        if (_.has(statusHash, status)){
            return statusHash[status];
        } else {
            return null;
        }
    },

    select: function(){
        console.log('Book.select');
        this.collection.trigger('book:selected', this.get('id'));
    },

    setStatus: function(statusName, statusValue){
        var updatedStatus = {};
        updatedStatus[statusName] = statusValue;
        this.set(_.extend(this.get('status'), updatedStatus));
    }
});

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

window.Library = Backbone.Collection.extend({
    model: Book,
    url: '/simpleshelf/_design/simpleshelf/_view/books?key="book"',
    parse: function(response) {
        var results = [];
        if (response.rows){
            var bookJSON;
            for(var x=0; x < response.rows.length; x++){
                bookJSON = response.rows[x];
                results.push({'id': bookJSON.id, 
                              'title': bookJSON.title});
            }
        }
        
        return results;
    }
});

window.Spine = Backbone.Model.extend({
    url: function(){
        return '/simpleshelf/' + this.get('id');
    },
    initialize: function(){},
    
    select: function(){
        console.log('Spine.select');
        this.collection.trigger('spine:selected', this.get('id'));
    }
});

window.SpineList = Backbone.Collection.extend({
    model: Spine,
    url: function(){
        var url = '';
        switch (this._current_filter.type){
            case 'book':
                url = '/simpleshelf/_design/simpleshelf/_view/all?key="book"';
                break;
            case 'tag':
                url = '/simpleshelf/_design/simpleshelf/_view/books_by_tags?key=%22' + this._current_filter.filter + '%22';
                break;
        }
        return url;
    },
    
    initialize: function(properties) {
        _.bindAll(this, 'reset', 'filterByTag', 'resetFilter');
        this._current_filter = {
            'type': 'book',
            'filter': null
        };
    },
    
    parse: function(response){
        var results = [], row, values;
        if (response.rows){
            for (var x = 0; x < response.rows.length; x++){
                row = response.rows[x];
                values = {};
                // handle different couchdb query results
                if (_.has(row.value, 'title')){
                    values['title'] = row.value.title;
                    values['_rev'] = row.value._rev;
                } else {
                    values['title'] = row.value;
                    values['_rev'] = null;
                }
                results.push({
                    'title': values.title,
                    'id': row.id,
                    '_rev': values._rev
                });
            }
       }
       return results;
    },
    
    /**
     * @param msgArgs {Object} {tag:String}
     */
    filterByTag: function(msgArgs){
        console.log('SpineList.filterByTag', JSON.stringify(msgArgs));
        if (msgArgs.tag == null){
            // reset filter to show all books
            this.resetFilter();
        } else {
            this._current_filter = {'type': 'tag', 'filter': msgArgs.tag};
        }
        return this;
    },
    
    resetFilter: function(){
        // reset filter to show all books
        this._current_filter = {'type': 'book', 'filter': null};
        return this;
    }
});

window.Tag = Backbone.Model.extend({
    /*
     * attributes from db: tag, count
     * local attributes: selected
     */
    defaults: {
        'tag': '',
        'count': 0,
        'selected': false
    },

    initialize: function(){},

    select: function(){
        console.log('Tag.select: called for tag ' + this.get('tag'));
        this.collection.trigger('tag:selected', this.get('tag'));
    }
});

window.TagList = Backbone.Collection.extend({
    model: Tag,
    url: '/simpleshelf/_design/simpleshelf/_view/tags?group=true',
    initialize: function(properties) {
        _.bindAll(this, 'reset', 'selectTag');
        this.bind('reset', this.reset_debug);
        this.bind('tag:selected', this.selectTag);
    },

    parse: function(response){
        var results = [];
        if (response.rows){
            for (var x = 0; x < response.rows.length; x++){
                results.push({
                    'tag': response.rows[x].key,
                    'count': response.rows[x].value
                });
            }
        }
        return results;
    },

    reset_debug: function(models, opts){
        console.log('TagList reset activated; models.length==' + models.length);
    },

    selectTag: function(tag){
        console.log('TagList.selectTag', tag);
        // find & update the selected tag; views should redraw
        this.models.forEach(function(model){
            model.set({'selected': (model.get('tag') === tag)})
                .trigger('tag:highlight', tag);
        });
    }
});
