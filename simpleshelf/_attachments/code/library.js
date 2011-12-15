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
        // reverse colors on the welcome msg
        $('#sidebar').css({backgroundColor: 'black', color: 'white'});
        
        // instantiate Router
        window.app = new SimpleShelfLibrary();

        // setup events across objects
        window.app.tagCloudView.bind('tagcloud:tagselected', window.app.spineListView.updateTag);
        window.app.spineListView.bind('spinelistview:bookSelected', window.app.books);

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
        $('#welcome-msg').fadeOut(5000);
    }
};
