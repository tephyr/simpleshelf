var expect = require('chai').expect;

var EditBookPageView = require("../../views/EditBookPageView.js"),
    Configuration = require("../../models/Configuration.js"),
    Book = require("../../models/Book.js");

describe('EditBookPageView', function() {

    var view, book, config;

    // beforeEach(function() {
    //     console.log("EditBookPageView:beforeEach fired");
    // });

    describe('verify objects', function () {
        beforeEach(function() {
            config = new Configuration();
            helperConfigBasic(config);
            view = new EditBookPageView({configuration: config});
            book = new Book({configuration: config});
        });

        it("should create a valid view object", function() {
            expect(view).to.be.an('object');
        });
        it("should have a valid model", function() {
            view.model = book;
            expect(view.model).to.be.an('object');
        });

    });

    describe('get data for template', function () {
        // Verify view properly retrieves and builds data
        // from model (blank for add, non-blank for edit).

        beforeEach(function() {
            config = new Configuration();
            helperConfigBasic(config);
            view = new EditBookPageView({configuration: config});
            book = new Book({}, {configuration: config});
            view.model = book;
        });

        it("should have the basics for a new model", function() {
            expect(view._buildTemplateData()).to.be.an('object');
            expect(view._buildTemplateData()).to.include.keys('hasOwnership', 'hasRead',
                'statusRead', 'statusOwnership');
            expect(view._buildTemplateData()).to.not.include.keys('title', 'isbn', 'authors');
        });

        it("should have the basics for an existing model", function() {
            book.set({'title': 'Test title', 'isbn': '12345', 'authors': ['Author One']});
            expect(view._buildTemplateData()).to.be.an('object');
            expect(view._buildTemplateData()).to.include.keys('hasOwnership', 'hasRead',
                'statusRead', 'statusOwnership', 'title', 'isbn', 'authors');
        });

        it("should not have a configuration element", function() {
            // Ensure that the configuration model does not accidentally get included in the data.
            expect(view._buildTemplateData()).to.not.include.keys('configuration');
        });

        it("should convert missing 'public' to false", function() {
            book.unset('public');
            expect(book.get('public')).to.be.undefined;
            expect(view._buildTemplateData()).to.have.property('public', false);
            book.set('public', false);
            expect(view._buildTemplateData()).to.have.property('public', false);
            book.set('public', true);
            expect(view._buildTemplateData()).to.have.property('public', true);
        });

        it("should convert authors to \\n-delimited string", function() {
            book.set("authors", ["Just One"]);
            expect(book.get("authors")).to.be.an.array;
            expect(view._buildTemplateData()).to.have.property('authors', "Just One");
            book.set("authors", ["One", "Two"]);
            expect(book.get("authors")).to.be.an.array;
            expect(view._buildTemplateData()).to.have.property('authors', "One\nTwo");
        });

    });

    describe.skip('get data from form', function () {

        it("should include title", function() {
            expect(view).to.be.an('object');
        });

        it("should include isbn", function() {
            expect(view).to.be.an('object');
        });

        it("must include EITHER title OR isbn", function() {
            expect(view).to.be.an('object');
        });

    });

    function helperConfigBasic(configModel) {
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
});
