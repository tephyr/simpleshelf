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
        'public': true
    },
    url: function(){
        return '/simpleshelf/' + this.get('id');
    },
    initialize: function(attributes){
        console.log('Book', 'initialize');
        _.bindAll(this, "addActivity", "getDefault", "getStatus", "select", "setStatus");
        // last piece to fire before this model finishes loading;
        // if activities is missing, add a new instance: if set in this.defaults, it violates encapsulation
        if (!this.get('activities')){
            this.set('activities', new ActivityList([]));
        }
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

        // enforce deeper attributes
        resp.status = _.extend(this.getDefault({attr: 'status'}), resp.status);

        return resp;
    },

    /**
     * Add an activity in one call
     * @param opts {Object} {date: date string, action: String}, IOW a valid Activity object's attributes
     **/
    addActivity: function(opts){
        this.get('activities').add(opts);
    },

    /**
     * Provide a default (empty) value for a given attribute
     * @param opts {Object} {attr:[status]}
     */
    getDefault: function(opts){
        if (!opts || !_.has(opts, 'attr')){
            return null;
        }

        var result = null;
        switch(opts.attr){
            case "status":
                result = {'read': null, 'ownership': null};
                break;

            default:
                break;
        }

        return result;
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
        switch (this._currentFilter.type){
            case 'book':
                url = '/simpleshelf/_design/simpleshelf/_view/all?key="book"';
                break;

            case 'tag':
                url = '/simpleshelf/_design/simpleshelf/_view/books_by_tags?key=%22' + this._currentFilter.filter + '%22';
                break;

            case 'report':
                // TODO: filter by specific year
                url = '/simpleshelf/_design/simpleshelf/_view/' + this._currentFilter.dbView;
                break;
        }
        return url;
    },
    
    initialize: function(properties) {
        _.bindAll(this, 'reset', 'filterByTag', 'filterByReport',
            'gotoNext', 'gotoPrev',
            'resetFilter', 'setCurrentSpine',
            '_goto'
        );
        this._currentFilter = {
            'type': 'book',
            'filter': null
        };
        this._currentSpine = null;
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
            this._currentFilter = {'type': 'tag', 'filter': msgArgs.tag};
        }
        return this;
    },

    /**
     * @param msgArgs {Object} {reportId:String}
     */
    filterByReport: function(msgArgs){
        console.log('SpineList.filterByReport', JSON.stringify(msgArgs));

        // find report by id
        var selectedReport = window.reportList.find(function(model){
            return msgArgs.reportId == model.id;
        });

        if (selectedReport){
            this._currentFilter = {
                'type': 'report',
                'dbView': selectedReport.get('dbView')
            };
        }

        return this;
    },
    
    gotoNext: function(msgArgs){
        this._goto(1);
    },

    gotoPrev: function(msgArgs){
        this._goto(-1);
    },

    resetFilter: function(){
        // reset filter to show all books
        this._currentFilter = {'type': 'book', 'filter': null};
        return this;
    },

    setCurrentSpine: function(msgArgs){
        this._currentSpine = msgArgs.id;
    },

    _goto: function(offset){
        var currentSpineIdx = null;
        var spineId = null;
        var me = this;
        this.each(function(spine, index){
            if (me._currentSpine == spine.id){
                currentSpineIdx = index;
                return;
            }
        });

        var gotoIndex = currentSpineIdx + offset;
        if (currentSpineIdx !== null){
            if (gotoIndex == -1){
                // previous wrap-around
                spineId = this.at(this.length - 1).id;
            }
            else if (this.length == gotoIndex){
                // next wrap-around
                spineId = this.at(0).id;
            } else {
                spineId = this.at(gotoIndex).id;
            }
        } else {
            return null;
        }

        this._currentSpine = spineId;
        this.trigger('spinelist:move', spineId);
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
        this.each(function(model){
            model.set({'selected': (model.get('tag') === tag)})
                .trigger('tag:highlight', tag);
        });
    }
});

/**
 * Report: a model that returns SpineList-compatible results, with optional filter
 * NOTE: Multiple reports can share the same name (but must have different filters),
 * so id distinguishes between them.
 */
window.Report = Backbone.Model.extend({
    defaults: {
        'dbView': '',     // name of couchdb view
        'title': '',      // human-readable
        'selected': false // is this view currently selected?
    },

    select: function(){
        console.log('Report.select: called for report ' + this.get('title'));
        this.collection.trigger('report:selected', this.id);
    }
});

window.ReportList = Backbone.Collection.extend({
    model: Report,
    url: null,
    initialize: function(options){
        _.bindAll(this, 'selectReport');
        this.bind('report:selected', this.selectReport);
    },

    selectReport: function(reportId){
        console.log('ReportList: selectReport()');
        // find & update selected report
        this.each(function(model){
            model
                .set('selected', (model.get('id') == reportId))
                .trigger('report:highlight', reportId);
        });
    }
});
