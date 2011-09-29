// encase in jQuery-safe wrapper
(function($) {
    // prep vars
    window.library = new Library();
    
    // load a set of books
    library.fetch();

    $(document).ready(function() {
        // reverse colors on the welcome msg
        $('#sidebar').css({backgroundColor: 'black', color: 'white'});
        
        // instantiate Router
        window.App = new SimpleShelfLibrary();
        // start (?) router
        Backbone.history.start({pushState: true});
        // go to start point
        window.App.home();
    });
})(jQuery);
