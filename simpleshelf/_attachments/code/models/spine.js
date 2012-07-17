window.Spine = Backbone.Model.extend({
    initialize: function(){},
    
    select: function(){
        console.log('Spine.select');
        this.collection.trigger('spine:selected', this.get('id'));
    },

    url: function(){
        return '/' + window.simpleshelf.info.dbName + '/' + this.get('id');
    },
});
