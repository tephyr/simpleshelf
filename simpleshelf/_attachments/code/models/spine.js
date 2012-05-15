window.Spine = Backbone.Model.extend({
    url: function(){
        return '/simpleshelf/' + this.get('id');
    },
    initialize: function(){},
    
    select: function(){
        console.log('Spine.select');
        this.collection.trigger('spine:selected', this.get('id'));
    }
});
