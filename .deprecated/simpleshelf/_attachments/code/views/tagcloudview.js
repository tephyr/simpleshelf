/**
 * Show tag cloud
 */
window.TagCloudView = Backbone.View.extend({
    className: 'tagcloud',
    tagName: 'div',
    template: _.template('<h2 class="tagheader"><a href="#" id="tagcloudviewheader">Tags</a></h2>' + 
        '<ul></ul>' + 
        '<p class="tagcloudchangercontrols"><span class="tagcloudchanger"><a href="#" id="changeAppearance">Change appearance</a></span>' +
        '&nbsp;<span class="tagcloudchanger"><a href="#" id="sortAlpha">Sort alpha</a></span>' +
        '&nbsp;<span class="tagcloudchanger"><a href="#" id="sortStrength">Sort strength</a></span>' +
        '</p>'),
    events: {
        'click #changeAppearance': 'changeAppearance',
        'click #sortAlpha': 'sortAlpha',
        'click #sortStrength': 'sortStrength',
        'click #tagcloudviewheader': 'tagResetRequested'
    },
    viewName: 'TagCloudView',
    // track internal state
    _internals: {'appearance': '', 'sortAlpha': 'asc', 'sortStrength': ''},

    initialize: function(options) {
        _.bindAll(this,
            'addAll',
            'addOne',
            'changeAppearance',
            'reloadTags',
            'render',
            'resetTags',
            'sortAlpha',
            'sortStrength',
            'tagResetRequested',
            'tagSelected',
            '_getSortTarget'
        );
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
        if (this._internals.appearance == '') {
            $("ul", this.$el).hide().addClass("alt").fadeIn("fast");
            this._internals.appearance = 'toggled';
        } else {
            $("ul", this.$el).hide().removeClass("alt").fadeIn("fast");
            this._internals.appearance = '';
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

    sortAlpha: function(evt){
        evt.preventDefault();
        // defaults to ascending alpha sort on page load
        var sorting = (this._internals.sortAlpha == 'asc') ? 'desc' : 'asc';
        this._getSortTarget().tsort({order:sorting});
        this._internals.sortAlpha = sorting;
    },

    sortStrength: function(evt){
        evt.preventDefault();
        var sorting;
        if (this._internals.sortStrength == '' || this._internals.sortStrength == 'asc'){
            sorting = 'desc';
        } else {
            sorting = 'asc';
        }
        this._getSortTarget().tsort({order:sorting, attr:"class"});
        this._internals.sortStrength = sorting;
    },

    tagResetRequested: function(evt){
        evt.preventDefault();
        this.log('TagCloudView.tagResetRequested');
        this.resetTags(true);
    },

    tagSelected: function(tag){
        this.log('TagCloudView.tagSelected event', tag);
        this.options.dispatcher.trigger('tagcloudview:tagselected', tag);
    },

    _getSortTarget: function(){
        return $("ul li", this.$el);
    }
});
