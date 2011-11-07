/**
 * Model for simpleshelf
 */

window.Book = Backbone.Model.extend({
    initialize: function(){}
});

window.Library = Backbone.Collection.extend({
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

window.Tag = Backbone.Model.extend({});

window.TagList = Backbone.Collection.extend({
    model: Tag,
    url: '/simpleshelf/_design/simpleshelf/_view/tags?group=true',
    parse: function(response){
        var results = [];
        if (response.rows){
            for (var x = 0; x < response.rows.length; x++){
                results.push({'tag': response.rows[x].key,
                    'count': response.rows[x].value});
            }
        }
        return results;
    }
});
