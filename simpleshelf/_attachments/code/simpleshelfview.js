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
      'click a.newbook': 'addBook',
      'click a.index': 'goIndex',
      'click a.login': 'logIn',
      'click a.next': 'gotoNext',
      'click a.prev': 'gotoPrev'
    },
    viewName: 'NavigationView',

    initialize: function(options){
        _.bindAll(this, "render",
            "addBook", "askedForCredentials",
            "goIndex", "gotoPrev", "gotoNext",
            "hideGoto", "logIn", "loggedIn",
            "loggedOut", "showGoto",
            "_updateLinks");
        this.model.bind('change:status', this._updateLinks);
        this.options.okToLog = true;
    },

    render: function(){
        // get template
        var $parent = $(this.template());

        // add links
        var links = {
            "prev": {"text": "Previous", "show": false},
            "next": {"text": "Next", "show": false},
            "newbook": {"text": "New book"},
            "index": "Index",
            "login": "Login"
        };

        var linkTemplate = _.template('<li class="{{key}}"><a href="#{{key}}" class="{{key}}">{{name}}</a></li>');
        var text, show, $li;
        _.each(links, function(value, key, list){
            if (_.isString(value)){
                text = value;
                show = true;
            } else {
                text = value.text;
                show = value.show || true;
            }
            $li = $(linkTemplate({'key': key, 'name': text}));
            $parent.append($li);
            if (!show){
                $li.filter('li').hide();
            }
        });

        $(this.el).html($parent);
        return this;
    },

    goIndex: function(event){
        event.preventDefault();
        // return home
        this.options.dispatcher.trigger('navigation:index');
    },

    addBook: function(event){
        event.preventDefault();
        // show new book form
        this.options.dispatcher.trigger('navigation:newbook');
    },

    logIn: function(event){
        event.preventDefault();
        if (window.authInfo.get('status') != 'loggedIn'){
            // navigate to authentication page
            window.app.authenticate();
        } else {
            // log out
            this.options.dispatcher.trigger('navigation:logout', {'action': 'logout'});
        }
    },

    /**
     * Hide/show links
     */
    _updateLinks: function(){
        var authStatus = this.model.get("status");
        var linkVisibility = {
            ".next": authStatus == "loggedIn",
            ".prev": authStatus == "loggedIn",
            ".newbook": authStatus == "loggedIn",
            ".index": authStatus == "loggedIn",
            ".login": true // always visible; text may change
        };

        _.each(linkVisibility, function(value, key){
            $(key, this).toggle(value);
        }, this.$el);
    },

    /* event handlers*/
    askedForCredentials: function(){
        // update login link to show that credentials are being asked for
        $('a.login', this.$el).css('background-color', 'yellow').text("Login");
    },

    gotoPrev: function(event){
        event.preventDefault();
        // this.log("gotoPrev: firing navigation.prev");
        this.options.dispatcher.trigger("navigation:prev");
    },

    gotoNext: function(event){
        event.preventDefault();
        // this.log("gotoPrev: firing navigation.next");
        this.options.dispatcher.trigger("navigation:next");
    },

    loggedIn: function(){
        // update link to logout
        $('a.login', this.$el).css('background-color', '').text("Logout");
    },

    loggedOut: function(){
        $('a.login', this.$el).text("Login");
    },

    /**
     * show prev/next buttons
     */
    showGoto: function(){
        // quirky because they were hidden before being added to DOM
        // $('li.next', this.$el).add('li.prev', this.$el).show();
        $('li.next', this.$el).children().andSelf().css('display', '');
        $('li.prev', this.$el).children().andSelf().css('display', '');
    },

    /**
     * hide prev/next buttons
     */
    hideGoto: function(){
        $('li.next', this.$el).add('li.prev', this.$el).hide();
    }
});

/**
 * Container for login/signup forms
 */
window.AuthenticationView = Backbone.View.extend({
    template: _.template(
        '<form>' +
        '<label for="name">Name</label> <input type="text" name="name" value="" autocapitalize="off" autocorrect="off">' +
        '<label for="password">Password</label> <input type="password" name="password" value="">' +
        '<input type="submit" name="submit" value="{{submitValue}}">' +
        '</form>'
    ),
    tagName: 'div',
    className: 'authentication-view',
    viewName: 'AuthenticationView',
    events: {
        'submit form': 'onSubmit'
    },

    initialize: function(options){
        _.bindAll(this, 'render', 'onSubmit');
        this.action = options.action || null;
    },

    render: function(){
        var templateOptions = {submitValue: ''};
        switch(this.action){
            case "getcredentials":
                templateOptions.submitValue = 'Login';
                break;

            case "signup":
                templateOptions.submitValue = 'Signup';
                break;
        }
        $(this.el).html(this.template(templateOptions));
        return this;
    },

    onSubmit: function(event){
        event.preventDefault();
        var $formElement = $('form', this.el);
        var userName = $('input:text[name=name]', $formElement).val();
        var userPw = $('input:password', $formElement).val();
        this.log('submitted', 'action', $(':submit', $formElement).val());
        if (this.action == "getcredentials"){
            this.options.dispatcher.trigger('authenticationview.login', {
                action: 'login',
                name: userName,
                password: userPw
            });
        }
    }
});

/**
 * Container for simple list of titles
 */
window.SpineListView = Backbone.View.extend({
    template: _.template('<h2>All books</h2><ul></ul>'),
    tagName: 'div',
    className: 'spine-list-view',
    viewName: 'SpineListView',

    initialize: function(options){
        _.bindAll(this, 'render',
            'addAll', 'addOne', 'bookSelected',
            'updateTag');
        this.collection.on('add', this.addOne);
        this.collection.on('reset', this.render);
        this.options.okToLog = true;
    },

    render: function(){
        this.log('rendering window.SpineListView');
        $(this.el).html(this.template());
        this.addAll();
        return this;
    },

    onClose: function(){
        this.collection.off('add', this.addOne);
        this.collection.off('reset', this.render);
    },

    addAll: function() {
        this.log('SpineListView.addAll: this.collection.length==', this.collection.length);
        this.collection.each(this.addOne);
    },

    addOne: function(model) {
        // TODO: hold in array for onClose clean-up
        var view = new SpineView({
            dispatcher: this.options.dispatcher,
            model: model
        });
        view.render();
        $('ul', this.el).append(view.el);
        model.on('remove', view.remove);
        // even though the subview is given the dispatcher reference,
        // its events should still bubble up to the parent view, which
        // will handle dispatching them globally
        view.on('spineview:selected', this.bookSelected);
    },

    updateTag: function(msgArgs){
        this.log('SpineListView:updateTag', msgArgs);
        this.collection.filterByTag(msgArgs);
    },

    bookSelected: function(msgArgs){
        this.log('SpineListView:bookSelected', msgArgs);
        this.collection.setCurrentSpine({'id': msgArgs.bookId});
        this.options.dispatcher.trigger('spinelistview:bookSelected', msgArgs.bookId);
    }
});

/**
 * Simple representation of book
 */
window.SpineView = Backbone.View.extend({
    className: 'spine-view',
    tagName: 'li',
    template: _.template('<span class="spine"><a href="./{{id}}">{{title}}</a></span> <span class="del"><a href="#">delete</a></span>'),
    events: {
      'click .spine a': 'bookSelected',
      'click .del a': 'bookRequestedDelete'
    },
    viewName: 'SpineView',

    initialize: function(properties){
        _.bindAll(this, 'render', 'remove', 'bookSelected', 'bookRequestedDelete');
        this.model.on('change', this.render);
        this.model.on('destroy', this.remove);
        this.options.okToLog = true;
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
    
    onClose: function(){
        this.model.off('change', this.render);
        this.model.off('destroy', this.remove);
    },

    remove: function() {
        $(this.el).remove();
    },

    bookRequestedDelete: function(evt){
        this.log("SpineView: deleted book", this.options.model);
        evt.preventDefault();
        // verify!
        if (window.confirm("Ok to delete \"" + this.options.model.get("title") + "\"?")){
            this.model.destroy({'wait': true});
        }
    },

    bookSelected: function(evt){
        this.log('SpineView: selected book', this.options.model);
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

/**
 * Show tag cloud
 */
window.TagCloudView = Backbone.View.extend({
    className: 'tagcloud',
    tagName: 'div',
    template: _.template('<h2 class="tagheader"><a href="#" id="tagcloudviewheader">Tags</a></h2><ul></ul>'),
    events: {
        'click #tagcloudviewheader': 'tagResetRequested'
    },
    viewName: 'TagCloudView',

    initialize: function(properties) {
        _.bindAll(this, 'render', 'addAll', 'addOne', 'tagResetRequested', 'tagSelected',
            'resetTags', 'reloadTags');
        this.collection.bind('add', this.addOne);
        this.collection.bind('reset', this.render);
    },

    render: function() {
        this.log('rendering window.TagCloudView');
        if (this.collection.length){
            this.$el.html(this.template());
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

/**
 * Show all information for single book
 */
window.BookView = Backbone.View.extend({
    className: 'book',
    tagName: 'div',
    template: _.template(
        '<div class="header">' +
        '<h2>Book</h2>' +
        '<div class="menu">' +
        '<button id="edit">Edit</button>' +
        '</div></div>' +
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
        ),
        'notes': _.template(
            '<tr class="notes"><td><span class="title">{{title}}</span></td>' +
            '<td><span class="value">{{value}}</span></td></tr>'
        ),
        'status': _.template(
            '<tr class="status"><td><span class="title">{{title}}</span></td>' +
            '<td><span class="value">{{value}}</span></td></tr>'
        )
    },

    events: {
        'click #edit': 'editBook'
    },

    initialize: function(options){
        _.bindAll(this, 'render', 'editBook');
        this.options.activitiesView = new window.ActivityListView({
            dispatcher: window.dispatcher,
            collection: this.options.model.get("activities")
        });
        this.options.okToLog = true;
    },

    onClose: function(){
        // dispose of sub views
        this.options.activitiesView.close();
    },

    render: function(){
        this.log('BookView: rendering');
        $(this.el).html(this.template());

        $('h2', this.el).attr('title', 'id: ' + this.model.id);

        // build lines programmatically
        var dataKeys = window.simpleshelf.constantsUI.bookView.schema;
        var htmlSnippets = {
            'tags': this.simpleTemplates.tags,
            'public': this.simpleTemplates.simpleField,
            'notesPublic': this.simpleTemplates.notes,
            'notesPrivate': this.simpleTemplates.notes,
            'status': this.simpleTemplates.status
        };
        var bookinfoEl = $('.bookinfo', this.el);
        var table = $('<table><colgroup><col id="column_title"><col id="column_data"></colgroup><tbody/></table>');
        var tbody = $('tbody', table);
        var me = this;

        // for each data element (in specified order), render as TR
        _.each(dataKeys, function(element){
            if (element.special){
                var formElement;
                var status = me.model.get('status') || {'ownership': null, 'read': null};

                switch (element.field){
                    case 'status.ownership':
                        tbody.append(htmlSnippets['status']({
                            title: element.title,
                            value: status['ownership'] || '---'
                        }));
                        break;
                    case 'status.read':
                        tbody.append(htmlSnippets['status']({
                            title: element.title,
                            value: status['read'] || '---'
                        }));
                        break;

                    case 'public':
                        tbody.append(htmlSnippets['public']({
                            title: element.title,
                            value: me.model.get(element.field) ? "yes" : "no"
                        }));
                        break;

                    default:
                        break;

                } 
            } else if (_.has(htmlSnippets, element.field)){
                // render specific field
                var properValue;
                switch(element.field){
                    default:
                        properValue = me.model.get(element.field);
                        break;
                }
                tbody.append(htmlSnippets[element.field]({
                    title: element.title,
                    value: properValue
                }));
            } else {
                // render element in generic way
                tbody.append(me._addSimpleField(element.title, me.model.get(element.field)));
            }
        });

        bookinfoEl.append(table);
        bookinfoEl.append(
            $('<div/>').addClass('activities').append(this.options.activitiesView.render().el)
        );
        return this;
    },

    editBook: function(evt){
        evt.preventDefault();
        // show new book form
        this.options.dispatcher.trigger('navigation:editbook', this.model.id);
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
        '<form class="bookinfo" id="editbookviewform"/>'
    ),

    simpleTemplates: {
        'simpleField': _.template(
            '<tr class="simple {{key}}"><td><span class="title">{{title}}</span></td>' +
            '<td><input type="text" name="{{key}}" value="{{value}}"></td></tr>'
        ),
        'tags': _.template(
            '<tr class="complex {{key}}"><td><span class="title">{{title}}</span></td>' +
            '<td><input type="text" name="{{key}}" value="" id="taginput"></td></tr>'
        ),
        'public': _.template(
            '<tr class="complex {{key}}"><td><span class="title">{{title}}</span></td>' +
            '<td><input type="checkbox" name="{{key}}" checked="{{value}}" value="true"></td></tr>'
        ),
        'notes': _.template(
            '<tr class="complex {{key}}"><td><span class="title">{{title}}</span></td>' +
            '<td><textarea name="{{key}}" rows="5">{{value}}</textarea></td></tr>'
        ),
        'statusOwn': _.template(
            '<tr class="status own"><td><span class="title">{{title}}</span></td>' +
            '<td><span class="value"><div id="formElementOwn"/></span></td></tr>'
        ),
        'statusRead': _.template(
            '<tr class="status read"><td><span class="title">{{title}}</span></td>' +
            '<td><span class="value" id="status_read_display">{{value}}</span><input type="hidden" value="{{value}}" name="{{key}}">&nbsp;<button id="openReadDialog">Change Read status</button><div id="formElementRead"/></td></tr>'
        )
    },
    
    events: {
        'click .submit': 'save',
        'click .cancel': 'cancel',
        'click #openReadDialog': 'openReadDialog'
    },

    initialize: function(options){
        _.bindAll(this, 'render', 'dataChanged', 'dataSynced', 'openReadDialog', 'save', 'cancel',
            '_addSimpleField', '_getFormData', '_prepPlugins');
        this.model.bind('change', this.dataChanged);
        this.model.bind('sync', this.dataSynced);
    },

    onClose: function(){
        // remove read status dialog, since on first open, jQuery pushes it outside the container
        $('#dialogStatusRead').remove();
    },

    render: function(){
        this.log('EditBookView: rendering');
        $(this.el).html(this.template());

        if (!this.model.isNew()){
            $('h2', this.el).attr('title', 'id: ' + this.model.id);
        }

        // build lines programmatically
        var dataKeys = window.simpleshelf.constantsUI.bookView.schema;
        var htmlSnippets = {
            'tags': this.simpleTemplates.tags,
            'public': this.simpleTemplates.public,
            'notesPublic': this.simpleTemplates.notes,
            'notesPrivate': this.simpleTemplates.notes,
            'statusOwn': this.simpleTemplates.statusOwn,
            'statusRead': this.simpleTemplates.statusRead
        };
        var bookinfoEl = $('.bookinfo', this.el);
        var table = $('<table><colgroup><col id="column_title"><col id="column_data"></colgroup><tbody/></table>');
        var tbody = $('tbody', table);
        var me = this;

        // for each data element (in specified order), render as TR
        _.each(dataKeys, function(element){
            if (element.special){
                var $formElement;
                switch (element.field){
                    case 'status.ownership':
                        $formElement = window.simpleshelf.util.buildSelect(
                            element.field,
                            window.app.constants.ownership,
                            me.model.getStatus('ownership')
                        );

                        tbody.append(htmlSnippets['statusOwn']({
                            title: 'Ownership',
                        }));
                        $('#formElementOwn', tbody).replaceWith($formElement);
                        break;

                    case 'status.read':
                        var $select = window.simpleshelf.util.buildSelect(
                            'status_read_form',
                            window.app.constants.read,
                            me.model.getStatus('read')
                        );

                        var $dialogElement = window.simpleshelf.util.buildStatusFormRead(
                            $select
                        );

                        tbody.append(htmlSnippets['statusRead']({
                            title: 'Read',
                            value: me.model.getStatus('read') || '---',
                            key: element.field
                        }));
                        $('#formElementRead', tbody).replaceWith($dialogElement);
                        break;

                    case "public":
                        // convert "true" to "checked" for input type==checkbox
                        tbody.append(htmlSnippets[element.field]({
                            title: element.title,
                            key: element.field,
                            value: (me.model.get(element.field) == "true") ? "checked" : ""
                        }));
                        break;

                }
            } else if (_.has(htmlSnippets, element.field)){
                var properValue;
                switch(element){
                    case "tags":
                        properValue = me.model.get(element.field).join(" ");
                        break;

                    default:
                        properValue = me.model.get(element.field);
                        break;
                }
                tbody.append(htmlSnippets[element.field]({
                    title: element.title,
                    key: element.field,
                    value: properValue
                }));
            } else {
                // render element in generic way
                tbody.append(me._addSimpleField(element.field, element.title));
            }
        });

        var htmlTail = '<div class="menu"><input type="submit" value="Submit" class="submit">&nbsp;' +
            '<button class="cancel">Cancel</button></div>';
        bookinfoEl.append(table).append(htmlTail);

        // call prep plugins after timeout to let DOM render
        window.setTimeout(function(){
            me._prepPlugins();
            // put focus in first text field
            $('input[type="text"]', me.$el).first().focus();
        }, 50);

        return this;
    },
    
    _prepPlugins: function(){
        var tags = this.model.get('tags') || [];
        $('#taginput', this.$el).tagsInput({
            'interactive': true
        }).importTags(tags.join(','));
    },
    
    save: function(event){
        event.preventDefault();
        this.log("EditBookView:save", this.model.isNew());
        
        $('input.submit', this.el).attr("disabled", "disabled");
        
        // save everything
        var freshData = this._getFormData();
        var me = this;
        _.each(window.simpleshelf.constantsUI.bookView.schema, function(element, index){
            if (element.special){
                switch(element.field){
                    case "status.ownership":
                    case "status.read":
                        var fieldSubName = element.field.split(".")[1];
                        me.model.setStatus(fieldSubName, freshData['status'][fieldSubName]);
                        break;

                    case "public":
                        me.model.set('public', freshData[element.field]);
                        break;

                    default:
                        break;
                }
            } else {
                me.model.set(element.field, freshData[element.field], {silent: true});
            }
        });

        // TODO: handle validation
        this.model.save(null, {'wait': true});
    },

    /**
     * User requested form cancel; prevent lost changes
     */
    cancel: function(evt){
        evt.preventDefault();
        var formData = this._getFormData();
        var me = this, difference = false, anyDifferences = false, okToGo = false;
        // check for changes; ask user to abandon
        _.each(formData, function(value, key, list){
            difference = false;
            // handle special fields separately
            switch(key){
                case "tags":
                    if (!formData[key].smartCompare(me.model.get(key) || [])){
                        difference = true;
                    }
                    break;

                case "status":
                    if (!_.isEqual(me.model.get(key), formData[key])){
                        difference = true;
                    }
                    break;

                default:
                    difference = (formData[key] != (me.model.get(key) || ""));
                    break;
            }

            if (difference){
                this.log('EditBookView.cancel difference', key, "Old", me.model.get(key), "New", value);
                anyDifferences = true;
            }
        });

        okToGo = anyDifferences ? window.confirm("There are changes, ok to abandon?") : true;

        if (okToGo){
            if (this.model.isNew()){
                this.options.dispatcher.trigger('editbookview:cancelnewbook');
            } else {
                // reset from server in case any attributes changed (like activities)
                this.model.fetch();
                this.options.dispatcher.trigger('editbookview:canceledit', this.model.id);
            }
        }
    },

    dataChanged: function(event){
        this.log("model's data has changed");
    },
    
    dataSynced: function(event){
        this.log("EditBookView: dataSynced");
        this.options.dispatcher.trigger('editbookview:dataSynced', this.model.id);
    },
    
    openReadDialog: function(event){
        event.preventDefault();
        var me = this;
        var updateData = function(status, date){
            var updatedValue = null;
            if (status.length > 0){
                updatedValue = status;
            }
            $('input[name="status.read"]', this.el).val(updatedValue || "---");
            $('#status_read_display', this.el).text(updatedValue || '---');

            if (date.length > 0){
                // add to log
                var mappedStatus = window.simpleshelf.constants.actionsRead[status] || null;
                if (mappedStatus){
                    me.model.addActivity({'date': date, 'action': mappedStatus});
                }
            }
        };

        $('#dialogStatusRead').dialog({
            modal: true,
            resizable: false,
            buttons: {
                "Save": function(){
                    var newStatus = $('select', this).val();
                    var newDate = $("#dateRead", this).val();
                    updateData(newStatus, newDate);
                    $( this ).dialog( "close" );
                },
                Cancel: function() {
                    $( this ).dialog( "close" );
                }
            }
        });
    },

    _addSimpleField: function(fieldKey, fieldTitle){
        return this.simpleTemplates.simpleField({
            title: fieldTitle,
            key: fieldKey,
            value: this.model.get(fieldKey)
        });
    },

    /**
     * Serialize form data
     */
    _getFormData: function(){
        var formData = {
            'status': {}
        };
        var me = this;
        var fieldValue, fieldSubName;
        _.each($('form', this.el).serializeArray(), function(element, index, list){
            switch (element.name){
                case "public":
                    formData["public"] = (element.value == "true");
                    break;

                case "tags":
                    // TODO more robust method of splitting
                    var fieldValue = $.trim(element.value);
                    if (fieldValue.length > 0){
                        formData["tags"] = element.value.split(',');
                    } else {
                        formData["tags"] = [];
                    }
                    break;

                case "status.ownership":
                case "status.read":
                    fieldValue = $.trim(element.value);
                    fieldSubName = element.name.split(".")[1];
                    if (fieldValue.length == 0 || fieldValue == "---"){
                        fieldValue = null;
                    }
                    // ensure the object exists
                    formData["status"] = formData["status"] || {}
                    formData["status"][fieldSubName] = fieldValue;
                    break;

                default:
                    if (_.indexOf(window.simpleshelf.constantsUI.allFields, element.name) > -1){
                        formData[element.name] = $.trim(element.value);
                    }
                    break;
            }
        });
        return formData;
    }
});

window.ActivityView = Backbone.View.extend({
    className: 'activity-view',
    tagName: "tr",
    template: _.template(
        "<td>{{date}}</td><td>{{action}}</td>"
    ),
    viewName: 'ActivityView',

    initialize: function(properties){
        _.bindAll(this, 'render', 'remove');
        this.model.on('change', this.render);
        this.model.on('destroy', this.remove);
    },

    render: function(){
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }
});

/**
 * ActivityListView: subview on BookView for all Activities
 */
window.ActivityListView = Backbone.View.extend({
    className: 'activity-list-view',
    tagName: 'table',
    template: _.template(
        '<tbody/>'
    ),
    viewName: "ActivityListView",

    events: {},
    initialize: function(){
        _.bindAll(this, 'render', 'addAll', 'addOne');
        this.collection.on('add', this.addOne);
        this.collection.on('reset', this.render);
    },
    render: function() {
        this.log('rendering window.ActivityListView');
        $(this.el).html(this.template());
        this.addAll();
        return this;
    },

    onClose: function(){
        this.collection.off('add', this.addOne);
        this.collection.off('reset', this.render);
    },

    addAll: function() {
        this.log('ActivityListView.addAll: this.collection.length==', this.collection.length);
        this.collection.each(this.addOne);
    },

    addOne: function(model) {
        // TODO: hold in array for onClose clean-up
        var view = new ActivityView({
            dispatcher: this.options.dispatcher,
            model: model
        });
        view.render();
        $('tbody', this.el).append(view.el);
        model.on('remove', view.remove);
        // even though the subview is given the dispatcher reference,
        // its events should still bubble up to the parent view, which
        // will handle dispatching them globally
        view.on('activityview:selected', function(){window.alert("activity view selected");});
    }

});
