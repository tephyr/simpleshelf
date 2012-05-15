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
