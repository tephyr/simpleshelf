// encase in jQuery-safe wrapper
(function($) {
    $(document).ready(function() {
        $.couch.app(function(app) { 
            launchSimpleShelf(app);
        });
    });

    function launchSimpleShelf(app){
        // instantiate global event dispatcher
        // TODO: keep within app object
        window.dispatcher = {};
        _.extend(window.dispatcher, Backbone.Events);

        // ugly hack for not having the db name when creating Book/Spine models
        window.simpleshelf.info = window.simpleshelf.info || {};
        window.simpleshelf.info = {
            dbName: app.db.name
        };

        // prep models
        window.authInfo = new AuthInfo({dbName: app.db.name});
        window.tagList = new TagList([], {dbName: app.db.name});
        window.spineList = new SpineList([], {dbName: app.db.name});
        window.availableReportList = new AvailableReportList([], {dbName: app.db.name});
        window.byYearSpineList = new ByYearSpineList([], {dbName: app.db.name});

        prepAvailableReportList();

        // instantiate Router
        window.app = new SimpleShelfLibrary({
            appView: new AppView(),
            dbName: app.db.name
        });

        // setup events across objects
        var events = {
            'authenticate:askedforcredentials': [window.app.navigationView.askedForCredentials],
            'authenticate:loggedin': [window.app.navigationView.loggedIn],
            'authenticate:processlogin': [window.authInfo.handleLogin],
            'authenticate:processlogout': [window.authInfo.handleLogout],
            'authenticationview.login': [window.app.authenticate],
            'availablereportlistview:reportselected': [window.app.reports],
            'editbookview:canceledit': [window.app.bookView],
            'editbookview:cancelnewbook': [window.app.home],
            'editbookview:dataSynced': [
                window.app.bookView,
                window.app.tagCloudView.reloadTags
            ],
            'navigation:editbook': [window.app.bookEdit],
            'navigation:index': [window.app.home],
            'navigation:logout': [window.app.authenticate],
            'navigation:newbook': [window.app.bookView],
            'router:bookedit': [window.app.navigationView.hideGoto],
            'router:home': [window.app.navigationView.hideGoto],
            'router:loadbook': [window.app.navigationView.showGoto],
            'router:reports': [window.app.navigationView.hideGoto],
            'router:tags': [window.app.navigationView.hideGoto],
            'spinelistview:bookSelected': [window.app.bookView],
            'tagcloudview:tagselected': [window.app.tags],
            'tagcloudview:tagsreset': [window.app.home]
        };
        
        // bind events to global dispatcher
        _.each(events, function(eventTargets, eventName){
            _.each(eventTargets, function(eventTarget){
                window.dispatcher.on(eventName, eventTarget);
            });
        });

        // bind events from specific models
        window.authInfo.on('authinfo:authenticationupdated', window.app.authenticate);
        window.authInfo.on('authinfo:loggedout', window.app.home);
        window.authInfo.on('authinfo:loggedout', window.app.navigationView.loggedOut);
        window.spineList.on('destroy', window.app.tagCloudView.reloadTags);
        // See also simpleshelfrouter._manageSpineListEvents,
        // for events that apply to all SpineList collections.

        // start (?) router
        Backbone.history.start({pushState: true});

        window.fetchCount = 0, window.fetchTotal = 2;

        // go to start point
        window.app.home();
    }
})(jQuery);

function fetchConstants(){
    $.getJSON( 'data/simpleshelf.constants', null, constantsFetched );
};

function constantsFetched(data, textStatus, jqXHR) {
    console.log('constantsFetched completed');
    window.app = window.app || {};
    window.app.constants = {
        'ownership': data.ownership,
        'read': data.read
    };
};

function tagList_fetch_complete(){
  console.log('tagList.fetch succeeded');
  window.fetchCount += 1;
  fetches_done();
};

function spineList_fetch_complete(){
  console.log('spineList.fetch succeeded');
  window.fetchCount += 1;
  fetches_done();
};

function fetches_done(){
    if (window.fetchCount == window.fetchTotal){
        //$('#welcome-msg').fadeOut(5000);
    };
};

function bind_test(){
    console.log("THIS BOUND EVENT HAS BEEN FIRED.");
};

/**
 * Add default reports
 */
function prepAvailableReportList(){
    window.availableReportList.add({
        id: 'by-year',
        dbView: 'by_year',
        title: 'By year'
    });
    window.availableReportList.add({
        id: 'by-status-read-finished',
        dbView: 'by_status?key=[%22read%22,%22finished%22]',
        title: 'Finished'
    });
    window.availableReportList.add({
        id: 'by-status-read-reading',
        dbView: 'by_status?key=[%22read%22,%22reading%22]',
        title: 'Currently reading'
    });
    window.availableReportList.add({
        id: 'read-not-set',
        dbView: 'read_not_set',
        title: 'Read status not set'
    });
};

/**
 * Override the original Backbone.sync, customize only as necessary
 */
Backbone.sync = _.wrap(Backbone.sync, function(func, method, model, options){
    console.log("BB.sync", method);
    switch(method){
        case "create":
            console.log(method + ": " + JSON.stringify(model));

            // get new UUID synchronously
            // generate 4 new uuids, if cache is empty
            var modelId = $.couch.newUUID(4);
            model.set({'id': modelId});
            
            // couchdb uses PUT for both creates & updates
            options.type = 'PUT';
            
            // save to couchdb
            func(method, model, options);
            
            break;

        case "delete":
            console.log(method + ": " + JSON.stringify(model));
            // include rev, or couchdb won't allow deletion
            options.url = model.url() + "?rev=" + model.get("_rev");
            
            // delete from couchdb
            func(method, model, options);
            break;

        case "update":
            console.log(method + ": " + JSON.stringify(model));
            options.type = 'PUT';
            func(method, model, options);

            break;
        default:
            func(method, model, options);
            break;
    }
});

/**
 * Use AppView to transition between "pages", while enforcing close() calls
 * Shamelessly copied from http://lostechies.com/derickbailey/2011/09/15/zombies-run-managing-page-transitions-in-backbone-apps/
 */
function AppView(){

    this.showView = function(view, options){
        if (options && _.has(options, 'log') && options.log){
            var c = this.currentView ? (this.currentView.viewName || this.currentView.cid) : '[x]';
            var v = view.viewName || view.cid;
            console.log('AppView: closing ' + c + ', opening ' + v);
        }
        if (this.currentView){
          this.currentView.close();
        }
    
        this.currentView = view;
        this.currentView.render();
    
        $("#items").html(this.currentView.el);
    };
};

/**
 * Use underscore.js difference() to quickly compare 2 arrays of strings
 */
Array.prototype.smartCompare = function(arr) {
    if (this.length != arr.length) return false;
    if (_.difference(this, arr).length > 0){
        return false;
    }
    return true;
};

/**
 * Compare list of strings by order & value of each element
 */
Array.prototype.stringElementCompare = function(arr){
    if (this.length != arr.length) return false;
    for (var x = 0; x < this.length; x++){
        if (this[x] != arr[x]){
            return false;
        }
    }
    return true;
};
