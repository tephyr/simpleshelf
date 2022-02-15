var utilities = {
    helperConfigBasic: function(configModel) {
        configModel.set({
            'read': ['to.read', 'reading', 'finished'],
            'ownership': ['personal', 'library'],
            'actions': {
                "read": {
                    "to.read": "book.read.queued",
                    "reading": "book.read.started",
                    "finished": "book.read.finished",
                    "abandoned": "book.read.stopped",
                    "reference": "book.read.setasreference"
                }
            }
        });
    }
};

module.exports = utilities;
