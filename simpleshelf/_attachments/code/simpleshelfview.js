/**
 * Views for simpleshelf
 */

// set underscore to use mustache-style interpolation
_.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
};

/**
 * Show basic info about entire library; based on Library [collection]
 */
window.LibraryInfoView = Backbone.View.extend({
    template: _.template('<ul><li>book count: {{ bookCount }}</li></ul>'),
    tagName: "div",
    className: "info-view",
    
    initialize: function(){
        _.bindAll(this, "render");
        this.collection.bind('reset', this.render);
    },
    
    render: function() {
        $(this.el).html(this.template({bookCount: this.collection.length}));
        return this;
    }
});

/**
 * Container for simple list of titles
 */
window.SpineListView = Backbone.View.extend({
    template: _.template('<h2>All books</h2><ul></ul>'),
    tagName: 'div',
    className: 'spine-list-view',
   
    initialize: function(){
        _.bindAll(this, 'render', 'addAll', 'addOne', 'updateTag', 'bookSelected');
        this.collection.bind('add', this.addOne);
        this.collection.bind('reset', this.render);
    },
   
    render: function(){
        console.log('rendering window.SpineListView');
        $(this.el).html(this.template());
        this.addAll();
        return this;
    },

    addAll: function() {
        console.log('SpineListView.addAll: this.collection.length==', this.collection.length)
        this.collection.each(this.addOne);
    },

    addOne: function(model) {
        view = new SpineView({model: model});
        view.render();
        $('ul', this.el).append(view.el);
        model.bind('remove', view.remove);
        view.bind('spineview:selected', this.bookSelected)
    },
    
    updateTag: function(msgArgs){
        console.log('SpineListView:updateTag', msgArgs);
        this.collection.filterByTag(msgArgs);
    },
    
    bookSelected: function(msgArgs){
        console.log('SpineListView:bookSelected', msgArgs);
        this.trigger('spinelistview:bookSelected', msgArgs.bookId);
    }
});

/**
 * Simple representation of book
 */
window.SpineView = Backbone.View.extend({
    className: 'spine-view',
    tagName: 'li',
    template: _.template('<a href="./{{id}}">{{title}}</a>'),
    events: {
      'click': 'bookSelected'  
    },
    
    initialize: function(properties){
        _.bindAll(this, 'render', 'remove', 'bookSelected');
        this.model.bind('change', this.render);
        this.model.bind('destroy', this.remove);
    },
    
    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
    
    remove: function() {
        $(this.el).remove();
    },
    
    bookSelected: function(evt){
        console.log('SpineView: selected book', this.options.model)
        evt.preventDefault();
        // signal to switch to full view for this book
        this.model.select();
        this.trigger('spineview:selected', {'bookId': this.model.get('id')});
    }
});

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

    initialize: function(properties){
        _.bindAll(this, 'render', 'remove', 'highlightIfMatch');
        this.model.bind('change', this.render);
        this.model.bind('destroy', this.remove);
        this.model.bind('tag:highlight', this.highlightIfMatch);
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    remove: function() {
        $(this.el).remove();
    },

    tagSelected: function(){
        console.log('TagView: click evt for tag==' + this.model.get('tag'));
        this.model.select();
        this.trigger('tagview:selected', {'tag': this.model.get('tag')});
    },

    highlightIfMatch: function(tag){
        $(this.el).toggleClass('selected', (this.model.get('tag') == tag));
    }
});

/**
 * Show tag cloud
 */
window.TagCloudView = Backbone.View.extend({
    className: 'tagcloud',
    tagName: 'div',
    template: _.template('<h2 class="tagheader">Tags</h2><ul></ul>'),
    
    initialize: function(properties) {
        _.bindAll(this, 'render', 'addAll', 'addOne', 'tagSelected', 'resetTags');
        this.collection.bind('add', this.addOne);
        this.collection.bind('reset', this.render);
    },

    render: function() {
        console.log('rendering window.TagCloudView');
        $(this.el).html(this.template());
        this.addAll();
        $('.' + this.className + ' .tagheader').on('click', this.resetTags);
        return this;
    },

    addAll: function() {
        console.log('TagCloudView.addAll: this.collection.length==', this.collection.length)
        this.collection.each(this.addOne);
    },

    addOne: function(model) {
        var view = new TagView({model: model});
        view.render();
        $('ul', this.el).append(view.el);
        model.bind('remove', view.remove);
        view.bind('tagview:selected', this.tagSelected)
    },

    resetTags: function(){
        console.log('TagCloudView.resetTags');
        this.collection.selectTag(null);
        this.trigger('tagcloud:tagselected', {'tag': null}); 
    },
    
    tagSelected: function(tag){
        console.log('TagCloudView.tagSelected event', tag);
        this.trigger('tagcloud:tagselected', tag);
    }
});

window.BookView = Backbone.View.extend({
    className: 'book',
    tagName: 'div',
    template: _.template(
        '<h2>Book</h2>' +
        '<div class="bookinfo"/>'
    ),
    simpleTemplates: {'simpleField': _.template(
        '<tr><td><span class="title">{{title}}</span></td>' +
        '<td><span class="value">{{value}}</span></td></tr>'
    )},
    
    initialize: function(options){
        _bindAll(this, 'render');
    },
    
    render: function(){
        console.log('BookView: rendering');
        $(this.el).html(this.template());
        
        // build lines programmatically
        var keys = ['title', 'author', 'isbn', 'openlibrary', 'tags'];
        var htmlSnippets = {};
        var bookinfoEl = $('#bookinfo', this.el);
        var table = $('<table/>');
        _.each(fields, function(value, key, list){
            if(_.indexOf(value, htmlSnippets) != -1) {
                // render specific field
            } else {
                table.append(this._addSimpleField(value, this.model[value]))
            }
        });
        bookinfoEl.append(table);
    },
    
    _addSimpleField: function(fieldTitle, fieldValue){
        return this.simpleTemplates.simpleField({title: fieldTitle, value: fieldValue});
    }
});
