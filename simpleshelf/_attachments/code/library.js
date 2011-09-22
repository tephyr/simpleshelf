$(document).ready(function() {
    // reverse colors on the welcome msg
    $('#sidebar').css({backgroundColor: 'black', color: 'white'});
    
    // prep vars
    window.library = new Library();
    
    // load a set of books
    library.fetch();
    
    // this will display zero, since the fetch is asynchronous
    // use a backbone view!
    $('#items').html('<b>Item count: '+library.length+'</b>');
});
