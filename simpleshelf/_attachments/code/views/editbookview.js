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
        'authors': _.template(
            '<tr class="complex {{key}}"><td><span class="title">{{title}}</span></td>' +
            '<td><textarea name="{{key}}" id="authorsinput" cols="60" rows="2" title="Use shift+enter to add a new line">{{value}}</textarea></tr>'
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
            '<td><span class="value" id="status_read_display">{{value}}</span><input type="hidden" value="{{value}}" name="{{key}}">&nbsp;<a href="#" id="openReadDialog">Change Read status</a><div id="formElementRead"/></td></tr>'
        )
    },
    
    events: {
        'click .submit': 'save',
        'click .cancel': 'cancel',
        'click #openReadDialog': 'openReadDialog'
    },

    initialize: function(options){
        _.bindAll(this,
            'render', 'dataChanged', 'dataSynced',
            'openReadDialog', 'save', 'cancel',
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
            'statusRead': this.simpleTemplates.statusRead,
            'authors': this.simpleTemplates.authors
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

                    case "authors":
                        // put in multi-line textbox
                        tbody.append(htmlSnippets[element.field]({
                            title: element.title,
                            key: element.field,
                            value: me.model.getAuthorsAsString({delimiter: "\n"})
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

        var htmlTail = '<div class="menu"><button type="submit" class="submit"><strong>Submit</strong></button>&nbsp;' +
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
                    case "authors":
                    case "public":
                        me.model.set(element.field, freshData[element.field]);
                        break;

                    case "status.ownership":
                    case "status.read":
                        var fieldSubName = element.field.split(".")[1];
                        me.model.setStatus(fieldSubName, freshData['status'][fieldSubName]);
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
                case "authors":
                    if (_.isArray(me.model.get(key))){
                        difference = !formData[key].stringElementCompare(me.model.get(key));
                    } else {
                        difference = (formData[key].length > 0);
                    }
                    break;

                case "tags":
                    if (_.isArray(me.model.get(key))){
                        if (!formData[key].smartCompare(me.model.get(key) || [])){
                            difference = true;
                        }
                    } else {
                        difference = (formData[key].length > 0);
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
                me.log('EditBookView.cancel difference', key, "Old", me.model.get(key), "New", value);
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
            },
            close: function(event, ui) {
                // put focus back on launcher button
                $('#openReadDialog').focus();
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
                case "authors":
                    // use regexp to split, to handle \r\n
                    formData["authors"] = window.simpleshelf.util.cleanStringArray($.trim(element.value).split(/\r\n|\r|\n/));
                    break;

                case "public":
                    formData["public"] = (element.value == "true");
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

                case "tags":
                    // TODO more robust method of splitting
                    var fieldValue = $.trim(element.value);
                    if (fieldValue.length > 0){
                        formData["tags"] = element.value.split(',');
                    } else {
                        formData["tags"] = [];
                    }
                    formData["tags"] = window.simpleshelf.util.cleanStringArray(formData["tags"]);
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
