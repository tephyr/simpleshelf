// encase in jQuery-safe wrapper
(function($) {
    // prep vars
    // window.library = new Library();
    window.tagList = new TagList();
    window.spineList = new SpineList();
    
    window.fetchCount = 0, window.fetchTotal = 2;

    // load a set of book spines
    window.spineList.fetch({ success: spineList_fetch_complete });
    // load tags
    window.tagList.fetch({ success: tagList_fetch_complete });

    $(document).ready(function() {
        // instantiate global event dispatcher
        // TODO: keep within app object
        window.dispatcher = {};
        _.extend(window.dispatcher, Backbone.Events);
        
        // instantiate Router
        window.app = new SimpleShelfLibrary({appView: new AppView()});

        // setup events across objects
        var events = {
            'tagcloudview:tagselected': [window.app.spineListView.updateTag],
            'tagcloudview:tagsreset': [window.app.home],
            'spinelistview:bookSelected': [window.app.books],
            'navigation:index': [window.app.home],
            'navigation:newbook': [window.app.books],
            'editbookview:dataSynced': [
                window.app.tagCloudView.reloadTags,
                window.app.books
            ]
        };
        
        // bind events
        _.each(events, function(eventTargets, eventName){
            _.each(eventTargets, function(eventTarget){
                window.dispatcher.bind(eventName, eventTarget);
            });
        });

        window.spineList.bind('destroy', window.app.tagCloudView.reloadTags);
        
        // start (?) router
        Backbone.history.start({pushState: true});

        // go to start point
        window.app.home();
        
        // showImportMessage();
    });
})(jQuery);

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
    }
};

function bind_test(){
    console.log("THIS BOUND EVENT HAS BEEN FIRED.")
};

/**
 * Override the original Backbone.sync, customize only as necessary
 */
Backbone.sync = _.wrap(Backbone.sync, function(func, method, model, options){
    console.log("BB.sync", method);
    switch(method){
        case "create":
            console.log(method + ": " + JSON.stringify(model));

            // TODO: generate *good* UUID
            var modelId = new Date().getTime();
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
            console.log(method, "not enabled");
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

    this.showView = function(view){
        if (this.currentView){
          this.currentView.close();
        }
    
        this.currentView = view;
        this.currentView.render();
    
        $("#items").html(this.currentView.el);
    }
};

/**
 * Add close() method to all views
 * Shamelessly copied from lostechies.com (see AppView)
 */
Backbone.View.prototype.close = function(){
    this.remove();
    this.unbind();
    if (this.onClose){
        this.onClose();
    }
};

Backbone.View.prototype.log = function(){
    if (_.has('okToLog', this.options) && this.options.okToLog){
        console.log(arguments);
    }
};
