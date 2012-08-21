/**
 * Show tag cloud
 */
window.TagCloudView = Backbone.View.extend({
    className: 'tagcloud',
    tagName: 'div',
    template: _.template('<h2 class="tagheader"><a href="#" id="tagcloudviewheader">Tags</a></h2>' + 
        '<ul></ul>' + 
        '<p><a href="#" id="changeAppearance">Change appearance</a></p>'),
    events: {
        'click #changeAppearance': 'changeAppearance',
        'click #tagcloudviewheader': 'tagResetRequested'
    },
    viewName: 'TagCloudView',

    initialize: function(properties) {
        _.bindAll(this, 'render',
            'addAll', 'addOne',
            'changeAppearance',
            'tagResetRequested', 'tagSelected',
            'resetTags', 'reloadTags');
        this.collection.bind('add', this.addOne);
        this.collection.bind('reset', this.render);
    },

    render: function() {
        this.log('rendering window.TagCloudView');
        if (this.collection.length){
            this.$el.html(this.template());
            this.$el.attr('id', 'tags');
            $('.tagheader', this.$el).attr('title', 'Click to show all tags');
            this.addAll();
        } else {
            this.$el.empty();
        }
        return this;
    },

    addAll: function() {
        this.log('TagCloudView.addAll: this.collection.length==', this.collection.length);
        this.collection.each(this.addOne);
    },

    addOne: function(model) {
        var view = new TagView({
            dispatcher: this.options.dispatcher,
            model: model,
            okToLog: this.okToLog
        });
        view.render();
        $('ul', this.$el).append(view.el);
        model.bind('remove', view.remove);
        view.bind('tagview:selected', this.tagSelected);
    },

    changeAppearance: function(evt){
        evt.preventDefault();
        var $anchor = $('#changeAppearance', this.$el);
        if (!$anchor.hasClass('toggled')) {
            $("ul", this.$el).hide().addClass("alt").fadeIn("fast");
            $anchor.addClass('toggled');
        } else {
            $("ul", this.$el).hide().removeClass("alt").fadeIn("fast");
            $anchor.removeClass('toggled');
        }
    },
    
    reloadTags: function(){
        this.log('TagListView.reload');
        this.collection.fetch();
    },

    resetTags: function(fromEvent){
        this.log('TagCloudView.resetTags');
        this.collection.selectTag(null);
        if (fromEvent){
            // fired from UI event; ok to trigger further actions
            this.options.dispatcher.trigger('tagcloudview:tagsreset', {'tag': null});
        }
    },

    tagResetRequested: function(evt){
        evt.preventDefault();
        this.log('TagCloudView.tagResetRequested');
        this.resetTags(true);
    },

    tagSelected: function(tag){
        this.log('TagCloudView.tagSelected event', tag);
        this.options.dispatcher.trigger('tagcloudview:tagselected', tag);
    }
});
