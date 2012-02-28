/**
 * Constants for simpleshelf
 */

window.simpleshelf = window.simpleshelf || {};
window.simpleshelf.constants = {
    bookView: {
        schema: [
            {'field': 'title', 'title': 'Title'},
            {'field': 'author', 'title': 'Author'},
            {'field': 'isbn', 'title': 'ISBN'},
            {'field': 'openlibrary', 'title': 'OpenLibrary'},
            {'field': 'publisher', 'title': 'Publisher'},
            {'field': 'tags', 'title': 'Tags'},
            {'field': 'notesPublic', 'title': 'Public notes'},
            {'field': 'notesPrivate', 'title': 'Private notes'}
        ]
    }
};

window.simpleshelf.constants.allFields = _.map(window.simpleshelf.constants.bookView.schema,
    function(schema){
        return schema.field;
    }
);
