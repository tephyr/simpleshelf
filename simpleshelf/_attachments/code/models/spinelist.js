window.SpineList = Backbone.Collection.extend({
    model: Spine,
    url: function(){
        var url = '';
        switch (this._currentFilter.type){
            case 'book':
                url = '/simpleshelf/_design/simpleshelf/_view/all?key="book"';
                break;

            case 'tag':
                url = '/simpleshelf/_design/simpleshelf/_view/books_by_tags?key=%22' + this._currentFilter.filter + '%22';
                break;

            case 'report':
                // TODO: filter by specific year
                url = '/simpleshelf/_design/simpleshelf/_view/' + this._currentFilter.dbView;
                break;
        }
        return url;
    },
    
    initialize: function(properties) {
        _.bindAll(this, 'reset', 'filterByTag', 'filterByReport',
            'gotoNext', 'gotoPrev',
            'resetFilter', 'setCurrentSpine',
            '_goto'
        );
        this._currentFilter = {
            'type': 'book',
            'filter': null
        };
        this._currentSpine = null;
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
            this._currentFilter = {'type': 'tag', 'filter': msgArgs.tag};
        }
        return this;
    },

    /**
     * @param msgArgs {Object} {reportId:String}
     */
    filterByReport: function(msgArgs){
        console.log('SpineList.filterByReport', JSON.stringify(msgArgs));

        // find report by id
        var selectedReport = window.reportList.find(function(model){
            return msgArgs.reportId == model.id;
        });

        if (selectedReport){
            this._currentFilter = {
                'type': 'report',
                'dbView': selectedReport.get('dbView')
            };
        }

        return this;
    },
    
    gotoNext: function(msgArgs){
        this._goto(1);
    },

    gotoPrev: function(msgArgs){
        this._goto(-1);
    },

    resetFilter: function(){
        // reset filter to show all books
        this._currentFilter = {'type': 'book', 'filter': null};
        return this;
    },

    setCurrentSpine: function(msgArgs){
        this._currentSpine = msgArgs.id;
    },

    _goto: function(offset){
        var currentSpineIdx = null;
        var spineId = null;
        var me = this;
        this.each(function(spine, index){
            if (me._currentSpine == spine.id){
                currentSpineIdx = index;
                return;
            }
        });

        var gotoIndex = currentSpineIdx + offset;
        if (currentSpineIdx !== null){
            if (gotoIndex == -1){
                // previous wrap-around
                spineId = this.at(this.length - 1).id;
            }
            else if (this.length == gotoIndex){
                // next wrap-around
                spineId = this.at(0).id;
            } else {
                spineId = this.at(gotoIndex).id;
            }
        } else {
            return null;
        }

        this._currentSpine = spineId;
        this.trigger('spinelist:move', spineId);
    }
});
