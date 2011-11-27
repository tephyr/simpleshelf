/**
 * Views for simpleshelf
 * To protect the templates from premature initialization, wrap all views in document.ready
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
        _.bindAll(this, 'render', 'addAll', 'addOne');
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
    }
});

/**
 * Simple representation of book
 */
window.SpineView = Backbone.View.extend({
    className: 'spine-view',
    tagName: 'li',
    template: _.template('<a href="./{{id}}">{{title}}</a>'),
    
    initialize: function(properties){
        _.bindAll(this, 'render', 'remove');
        this.model.bind('change', this.render);
        this.model.bind('destroy', this.remove);
    },
    
    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
    
    remove: function() {
        $(this.el).remove();
    }
});

/**
 * Show individual tag
 */
window.TagView = Backbone.View.extend({
    className: 'tag',
    tagName: 'li',
    template: _.template('{{ tag }}, {{ count }}'),
    
    initialize: function(properties){
        _.bindAll(this, 'render', 'remove');
        this.model.bind('change', this.render);
        this.model.bind('destroy', this.remove);
    },
    
    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
    
    remove: function() {
        $(this.el).remove();
    }
});

/**
 * Show tag cloud
 */
window.TagCloudView = Backbone.View.extend({
    className: 'tagcloud',
    tagName: 'div',
    template: _.template('<h2>Tags</h2><ul></ul>'),
    
    initialize: function(properties) {
        _.bindAll(this, 'render', 'addAll', 'addOne');
        this.collection.bind('add', this.addOne);
        this.collection.bind('reset', this.render);
    },

    render: function() {
        console.log('rendering window.TagCloudView');
        $(this.el).html(this.template());
        this.addAll();
        return this;
    },

    addAll: function() {
        console.log('TagCloudView.addAll: this.collection.length==', this.collection.length)
        this.collection.each(this.addOne);
    },

    addOne: function(model) {
        view = new TagView({model: model});
        view.render();
        $('ul', this.el).append(view.el);
        model.bind('remove', view.remove);
    }
});
