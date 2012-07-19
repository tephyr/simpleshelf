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
        Mousetrap.bind('e', this.editBook);
    },

    onClose: function(){
        // dispose of sub views
        this.options.activitiesView.close();
        Mousetrap.reset();
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

                    case 'authors':
                        tbody.append(me._addSimpleField(
                            element.title,
                            me.model.getAuthorsAsString({delimiter: ', '})
                        ));
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
