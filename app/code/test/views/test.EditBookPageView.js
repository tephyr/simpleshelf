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

    describe('pull data from form', function () {

        beforeEach(function() {
            config = new Configuration();
            helperConfigBasic(config);
            view = new EditBookPageView({configuration: config});
            book = new Book({}, {configuration: config});
            view.model = book;
        });

        it("should include title", function() {
            var data = {title: "The title"};
            view._fillModel(helperFormBasic(data));
            expect(book.get("title")).to.equal(data.title);
        });

        it("should include isbn", function() {
            var data = {isbn: "123456"};
            view._fillModel(helperFormBasic(data));
            expect(book.get("isbn")).to.equal(data.isbn);
        });

        it("must convert authors to array", function() {
            var data = {authors: "One\nTwo"};
            view._fillModel(helperFormBasic(data));
            expect(book.get("authors")).to.be.instanceOf(Array)
                .and.have.lengthOf(2)
                .and.include.members(["Two", "One"]);
        });

        it("must set all standard fields", function() {
            var data = {
                title: "Abc",
                isbn: "012345",
                authors: "Author One",
                publisher: "The publisher",
                public: "on",
                notesPublic: "Public notes",
                notesPrivate: "Private notes"
            };

            view._fillModel(helperFormBasic(data));
            expect(book.get("authors")).to.have.lengthOf(1).and.include.members([data.authors]);
            expect(book.get("publisher")).to.equal(data.publisher);
            expect(book.get("public")).to.be.true;
            expect(book.get("notesPublic")).to.equal(data.notesPublic);
            expect(book.get("notesPrivate")).to.equal(data.notesPrivate);

        });

        it("must set status fields", function() {
            var data = {
                title: "Abc",
                isbn: "012345",
                statusRead: "to.read",
                statusOwnership: "personal"
            };

            view._fillModel(helperFormBasic(data));
            var status = book.get("status");

            expect(status)
                .to.be.instanceOf(Object)
                .and.include.keys("read", "ownership");
            expect(status["read"]).to.equal("to.read");
            expect(status["ownership"]).to.equal("personal");
        });

        it.skip("must trigger status change for reading", function() {
            var data = {
                title: "Abc",
                isbn: "012345",
                statusRead: "to.read"
            };

            view._fillModel(helperFormBasic(data));

        });

        it("must not update changelog when reading/ownership did not change");

        it("must update changelog for reading w/date");
        it("must update changelog for ownership");

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

    function helperFormBasic(bookData) {
        return [
            {name: "editbookTitle", value: bookData.title},
            {name: "editbookAuthors", value: bookData.authors},
            {name: "editbookISBN", value: bookData.isbn},
            {name: "editbookPublisher", value: bookData.publisher},
            {name: "editbookPublic", value: bookData.public},
            {name: "editbookNotesPublic", value: bookData.notesPublic},
            {name: "editbookNotesPrivate", value: bookData.notesPrivate},
            {name: "editbookRead", value: bookData.statusRead},
            {name: "editbookOwnership", value: bookData.statusOwnership}
        ];
    }
});
