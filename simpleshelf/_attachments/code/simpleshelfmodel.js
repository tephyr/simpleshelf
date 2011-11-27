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

window.Spine = Backbone.Model.extend({
    initialize: function(){}
});

window.SpineList = Backbone.Collection.extend({
   model: Spine,
   url: '/simpleshelf/_design/simpleshelf/_view/all', // NOTE: this will change based on the subclass
   parse: function(response){
       var results = [];
       if (response.rows){
            for (var x = 0; x < response.rows.length; x++){
                results.push({
                    'title': response.rows[x].value,
                    'id': response.rows[x].id
                });
            }
       }
       return results;
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
        _.bindAll(this, 'reset');
        this.bind('reset', this.reset_debug);
        this.bind('tag:selected', this.selectTag);
    },

    parse: function(response){
        console.log('TagList: parsing!');
        var results = [];
        if (response.rows){
            for (var x = 0; x < response.rows.length; x++){
                results.push({'tag': response.rows[x].key,
                    'count': response.rows[x].value});
            }
        }
        return results;
    },

    reset_debug: function(models, opts){
        console.log('TagList reset activated; models.length==' + models.length);
    },

    selectTag: function(tag){
        console.log('TagList.selectTag: called with tag', tag);
        // find & update the selected tag; views should redraw
        this.models.forEach(function(model){
            model.set({'selected': (model.get('tag') === tag)})
                .trigger('tag:highlight', tag);
        });
    }
});
