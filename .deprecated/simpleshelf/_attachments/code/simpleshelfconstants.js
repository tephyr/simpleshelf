/**
 * Constants for simpleshelf
 */

window.simpleshelf = window.simpleshelf || {};
window.simpleshelf.constantsUI = {
    bookView: {
        schema: [
            {'field': 'title', 'title': 'Title'},
            {'field': 'authors', 'title': 'Author', 'special': true},
            {'field': 'isbn', 'title': 'ISBN'},
            {'field': 'public', 'title': 'Public', 'special': true},
            {'field': 'publisher', 'title': 'Publisher'},
            {'field': 'tags', 'title': 'Tags'},
            {'field': 'notesPublic', 'title': 'Public notes'},
            {'field': 'notesPrivate', 'title': 'Private notes'},
            {'field': 'status.read', 'special': true, 'title': 'Read'},
            {'field': 'status.ownership', 'special': true, 'title': 'Ownership'},
            // urls
        ]
    }
};

window.simpleshelf.constantsUI.allFields = _.map(window.simpleshelf.constantsUI.bookView.schema,
    function(schema){
        return schema.field;
    }
);

window.simpleshelf.constants = {
    actionsRead: {
        'to.read': 'book.read.queued',
        'reading': 'book.read.started',
        'finished': 'book.read.finished',
        'abandoned': 'book.read.stopped',
        'reference': null
    }
};
