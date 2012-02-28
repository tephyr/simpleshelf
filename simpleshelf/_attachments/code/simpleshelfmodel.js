/**
 * Model for simpleshelf
 */

window.Book = Backbone.Model.extend({
    defaults: {
        'type': 'book'
    },
    url: function(){
        return '/simpleshelf/' + this.get('id');
    },
    initialize: function(){
        console.log('Book', 'initialize');
    },

    select: function(){
        console.log('Book.select');
        this.collection.trigger('book:selected', this.get('id'));
    }
});

window.Library = Backbone.Collection.extend({
    model: Book,
    url: '/simpleshelf/_design/simpleshelf/_view/books?key="book"',
    parse: function(response) {
        var results = [];
        if (response.rows){
            var bookJSON;
            for(var x=0; x < response.rows.length; x++){
                bookJSON = response.rows[x];
                results.push({'id': bookJSON.id, 
                              'title': bookJSON.title});
            }
        }
        
        return results;
    }
});

window.Spine = Backbone.Model.extend({
    url: function(){
        return '/simpleshelf/' + this.get('id');
    },
    initialize: function(){},
    
    select: function(){
        console.log('Spine.select');
        this.collection.trigger('spine:selected', this.get('id'));
    }
});

window.SpineList = Backbone.Collection.extend({
    model: Spine,
    url: function(){
        var url = '';
        switch (this._current_filter.type){
            case 'book':
                url = '/simpleshelf/_design/simpleshelf/_view/all?key="book"';
                break;
            case 'tag':
                url = '/simpleshelf/_design/simpleshelf/_view/books_by_tags?key=%22' + this._current_filter.filter + '%22';
                break;
        }
        return url;
    },
    
    initialize: function(properties) {
        _.bindAll(this, 'reset', 'filterByTag', 'resetFilter');
        this._current_filter = {
            'type': 'book',
            'filter': null
        };
    },
    
    parse: function(response){
        var results = [], row, values;
        if (response.rows){
            for (var x = 0; x < response.rows.length; x++){
                row = response.rows[x];
                values = {};
                // handle different couchdb query results
                if (_.has(row.value, 'title')){
                    values['title'] = row.value.title;
                    values['_rev'] = row.value._rev;
                } else {
                    values['title'] = row.value;
                    values['_rev'] = null;
                }
                results.push({
                    'title': values.title,
                    'id': row.id,
                    '_rev': values._rev
                });
            }
       }
       return results;
    },
    
    /**
     * @param msgArgs {Object} {tag:String}
     */
    filterByTag: function(msgArgs){
        console.log('SpineList.filterByTag', JSON.stringify(msgArgs));
        if (msgArgs.tag == null){
            // reset filter to show all books
            this.resetFilter();
        } else {
            this._current_filter = {'type': 'tag', 'filter': msgArgs.tag};
        }
        return this;
    },
    
    resetFilter: function(){
        // reset filter to show all books
        this._current_filter = {'type': 'book', 'filter': null};
        return this;
    }
});

window.Tag = Backbone.Model.extend({
    /*
     * attributes from db: tag, count
     * local attributes: selected
     */
    defaults: {
        'tag': '',
        'count': 0,
        'selected': false
    },

    initialize: function(){},

    select: function(){
        console.log('Tag.select: called for tag ' + this.get('tag'));
        this.collection.trigger('tag:selected', this.get('tag'));
    }
});

window.TagList = Backbone.Collection.extend({
    model: Tag,
    url: '/simpleshelf/_design/simpleshelf/_view/tags?group=true',
    initialize: function(properties) {
        _.bindAll(this, 'reset', 'selectTag');
        this.bind('reset', this.reset_debug);
        this.bind('tag:selected', this.selectTag);
    },

    parse: function(response){
        var results = [];
        if (response.rows){
            for (var x = 0; x < response.rows.length; x++){
                results.push({
                    'tag': response.rows[x].key,
                    'count': response.rows[x].value
                });
            }
        }
        return results;
    },

    reset_debug: function(models, opts){
        console.log('TagList reset activated; models.length==' + models.length);
    },

    selectTag: function(tag){
        console.log('TagList.selectTag', tag);
        // find & update the selected tag; views should redraw
        this.models.forEach(function(model){
            model.set({'selected': (model.get('tag') === tag)})
                .trigger('tag:highlight', tag);
        });
    }
});
