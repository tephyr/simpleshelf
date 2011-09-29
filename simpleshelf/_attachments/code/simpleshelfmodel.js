/**
 * Model for simpleshelf
 */

var Book = Backbone.Model.extend({
    initialize: function(){}
});

var Library = Backbone.Collection.extend({
    model: Book,
    url: '/simpleshelf/_design/simpleshelf/_view/all',
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
