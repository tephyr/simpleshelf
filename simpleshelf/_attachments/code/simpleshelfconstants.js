/**
 * Constants for simpleshelf
 */

window.simpleshelf = window.simpleshelf || {};
window.simpleshelf.constantsUI = {
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

window.simpleshelf.constantsUI.allFields = _.map(window.simpleshelf.constantsUI.bookView.schema,
    function(schema){
        return schema.field;
    }
);

