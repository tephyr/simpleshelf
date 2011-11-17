// encase in jQuery-safe wrapper
(function($) {
    // prep vars
    // window.library = new Library();
    window.tagList = new TagList();
    window.spineList = new SpineList();
    
    // load a set of book spines
    spineList.fetch({ success: spineList_fetch_complete });
    // load tags
    tagList.fetch({ success: tagList_fetch_complete });

    $(document).ready(function() {
        // reverse colors on the welcome msg
        $('#sidebar').css({backgroundColor: 'black', color: 'white'});
        
        // instantiate Router
        window.App = new SimpleShelfLibrary();
        // start (?) router
        Backbone.history.start({pushState: true});
        // go to start point
        window.App.home();
        
        // showImportMessage();
    });
})(jQuery);

function tagList_fetch_complete(){
  console.log('tagList.fetch succeeded');
};

function spineList_fetch_complete(){
  console.log('spineList.fetch succeeded');
};
