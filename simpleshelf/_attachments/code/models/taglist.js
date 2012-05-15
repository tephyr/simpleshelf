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
