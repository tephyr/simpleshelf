window.Spine = Backbone.Model.extend({
    initialize: function(){},
    
    select: function(){
        console.log('Spine.select');
        this.collection.trigger('spine:selected', this.get('id'));
    },

    toJSON: function(){
        var result = Backbone.Model.prototype.toJSON.call(this);
        result.titleOrId = this.get('title') || this.get('id');
        return result;
    },

    url: function(){
        return '_rewrite/data/' + this.get('id');
    }
});
