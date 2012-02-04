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
 * Navigation for entire app
 */
window.NavigationView = Backbone.View.extend({
    template: _.template(
        '<ul></ul>'
    ),
    tagName: "div",
    className: "navigation-view",
    events: {
      'click .newbook': 'addBook',
      'click .index': 'goIndex'
    },

    initialize: function(){
        _.bindAll(this, "render", "addBook", "goIndex");
    },

    render: function(){
        // get template
        var $parent = $(this.template());

        // add links
        var links = {
            "newbook": "New book",
            "index": "Index"
            }

        var linkTemplate = _.template('<li><a href="#{{key}}" class="{{key}}">{{name}}</a></li>');
        _.each(links, function(value, key, list){
            $parent.append(linkTemplate({'key': key, 'name': value}));
        });

        $(this.el).html($parent);
        return this;
    },

    goIndex: function(event){
        event.preventDefault();
        // return home
        this.trigger('navigation:index');
    },

    addBook: function(event){
        event.preventDefault();
        // show new book form
        this.trigger('navigation:newbook');
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
    template: _.template('<a href="./{{id}}">{{title}}</a> <span class="del">delete</span>'),
    events: {
      'click a': 'bookSelected',
      'click .del': 'bookRequestedDelete'
    },

    initialize: function(properties){
        _.bindAll(this, 'render', 'remove', 'bookSelected', 'bookRequestedDelete');
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

    bookRequestedDelete: function(evt){
        console.log("SpineView: deleted book", this.options.model);
        // verify!
        if (window.confirm("Ok to delete \"" + this.options.model.get("title") + "\"?")){
            this.model.destroy({'wait': true});
        }
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
        if (this.model.get('selected'))
            $(this.el).addClass('selected');
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
    template: _.template('<h2 class="tagheader"><a href="#" id="tagcloudviewheader">Tags</a></h2><ul></ul>'),
    events: {
        'click #tagcloudviewheader': 'resetTags'
    },

    initialize: function(properties) {
        _.bindAll(this, 'render', 'addAll', 'addOne', 'tagSelected', 'resetTags', 'reloadTags');
        this.collection.bind('add', this.addOne);
        this.collection.bind('reset', this.render);
    },

    render: function() {
        console.log('rendering window.TagCloudView');
        $(this.el).html(this.template());
        $('.tagheader', this.el).attr('title', 'Click to show all tags');
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
    
    reloadTags: function(){
        console.log('TagListView.reload');
        this.collection.fetch();
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

/**
 * Show all information for single book
 */
window.BookView = Backbone.View.extend({
    className: 'book',
    tagName: 'div',
    template: _.template(
        '<h2>Book</h2>' +
        '<div class="bookinfo"/>'
    ),
    // templates for the different values in a book
    // TODO: custom templates for status, notes
    simpleTemplates: {
        'simpleField': _.template(
            '<tr class="simple"><td><span class="title">{{title}}</span></td>' +
            '<td><span class="value">{{value}}</span></td></tr>'
        ),
        'tags': _.template(
            '<tr class="tags"><td><span class="title">{{title}}</span></td>' +
            '<td><span class="value">{{value}}</span></td></tr>'
        )
    },

    initialize: function(options){
        _.bindAll(this, 'render');
    },

    render: function(){
        console.log('BookView: rendering');
        $(this.el).html(this.template());

        // build lines programmatically
        var dataKeys = ['title', 'author', 'isbn', 'openlibrary', 'publisher', 'tags'];
        var htmlSnippets = {'tags': this.simpleTemplates.tags};
        var bookinfoEl = $('.bookinfo', this.el);
        var table = $('<table/>');
        var me = this;

        // for each data element (in specified order), render as TR
        _.each(dataKeys, function(element, index, list){
            if (_.has(htmlSnippets, element)){
                // render specific field
                table.append(htmlSnippets[element]({title: element, value: me.model.get(element)}));
            } else {
                // render element in generic way
                table.append(me._addSimpleField(element, me.model.get(element)));
            }
        });

        bookinfoEl.append(table);
        return this;
    },

    _addSimpleField: function(fieldTitle, fieldValue){
        return this.simpleTemplates.simpleField({title: fieldTitle, value: fieldValue});
    }
});

/**
 * Add/edit book
 */
window.EditBookView = Backbone.View.extend({
    className: 'editBook',
    tagName: 'div',
    template: _.template(
        '<h2>Book</h2>' +
        '<form class="bookinfo"/>'
    ),

    dataKeys: ['title', 'author', 'isbn', 'openlibrary', 'publisher', 'tags'],
    simpleTemplates: {
        'simpleField': _.template(
            '<tr class="simple {{key}}"><td><span class="title">{{title}}</span></td>' +
            '<td><input type="text" name="{{key}}"></td></tr>'
        ),
        'tags': _.template(
            '<tr class="complex {{key}}"><td><span class="title">{{title}}</span></td>' +
            '<td><input type="text" name="{{key}}"></td></tr>'
        )
    },
    
    events: {
        'click .submit': 'save'
    },

    initialize: function(options){
        _.bindAll(this, 'render', 'dataChanged', 'dataSynced');
        this.model.bind('change', this.dataChanged);
        this.model.bind('sync', this.dataSynced);
    },

    render: function(){
        console.log('EditBookView: rendering');
        $(this.el).html(this.template());

        // build lines programmatically
        var normalInputs = ['title', 'author', 'isbn', 'openlibrary', 'publisher'];
        var htmlSnippets = {'tags': this.simpleTemplates.tags};
        var bookinfoEl = $('.bookinfo', this.el);
        var table = $('<table/>');
        var me = this;

        // for each data element (in specified order), render as TR
        _.each(this.dataKeys, function(element, index, list){
            if (_.indexOf(normalInputs, element) != -1) {
                // render element in generic way
                table.append(me._addSimpleField(element, element));
            } else if (_.has(htmlSnippets, element)){
                table.append(me.simpleTemplates[element]({title: element, key: element}));
            }
        });

        bookinfoEl.append(table).append('<input type="submit" value="Submit" class="submit">');

        return this;
    },
    
    save: function(event){
        console.log("EditBookView:save", this.model.isNew());
        event.preventDefault();
        
        $('input.submit', this.el).attr("disabled", "disabled");
        
        var newAttributes = {};
        var me = this;
        if (this.model.isNew()){
            // save everything
            _.each($('form', this.el).serializeArray(), function(element, index, list){
                if (element.name == "tags"){
                    // TODO more robust method of splitting
                    newAttributes["tags"] = element.value.split(' ');
                } else {
                    if (_.indexOf(me.dataKeys, element.name) > -1){
                        newAttributes[element.name] = element.value;
                    }
                }
            });
        }

        // TODO: handle validation
        this.model.save(newAttributes);
    },

    dataChanged: function(event){
        console.log("model's data has changed");
    },
    
    dataSynced: function(event){
        console.log("EditBookView: dataSynced");
        // goto bookview
        if (this.model.isNew()){
            this.trigger('editbookview:bookChanged');
        } else {
            this.trigger('editbookview:bookChanged', this.model.id);
            window.app.books(this.model.id);
        }
    },

    _addSimpleField: function(fieldKey, fieldTitle){
        return this.simpleTemplates.simpleField({title: fieldTitle, key: fieldKey});
    }
});
