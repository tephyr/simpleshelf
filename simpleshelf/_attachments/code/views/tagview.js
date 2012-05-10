/**
 * Show individual tag
 */
window.TagView = Backbone.View.extend({
    className: 'tag',
    tagName: 'li',
    template: _.template('{{ tag }}, {{ count }}'),

    events: {
        'click': 'tagSelected'
    },
    viewName: 'TagView',

    initialize: function(properties){
        _.bindAll(this, 'render', 'remove', 'highlightIfMatch');
        this.model.bind('change', this.render);
        this.model.bind('destroy', this.remove);
        this.model.bind('tag:highlight', this.highlightIfMatch);
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        if (this.model.get('selected'))
            $(this.el).addClass('selected');
        return this;
    },

    remove: function() {
        $(this.el).remove();
    },

    tagSelected: function(){
        this.log('TagView: click evt for tag==' + this.model.get('tag'));
        this.model.select();
        this.trigger('tagview:selected', this.model.get('tag'));
    },

    highlightIfMatch: function(tag){
        $(this.el).toggleClass('selected', (this.model.get('tag') == tag));
    }
});
