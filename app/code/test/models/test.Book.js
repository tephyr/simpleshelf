var expect = require('chai').expect,
    sinon = require('sinon'),
    testUtilities = require("../testUtilities.js"),
    Configuration = require("../../models/Configuration.js"),
    Book = require("../../models/Book.js");

describe('Book', function() {

    var book, config;

    describe("basic functionality", function() {
        beforeEach(function() {
            config = new Configuration();
            testUtilities.helperConfigBasic(config);
            book = new Book({}, {configuration: config});
        });

        it("must default to type 'book' and public==true", function() {
            expect(book.get('type')).to.equal('book');
            expect(book.get('public')).to.be.true;
        });

        it("should not allow configuration as data", function() {
            // Prevent accidental instantiation of model with configuration as data.
            expect(book.get('configuration')).to.be.undefined;

            var createBadBook = function() {
                var badBook = new Book({configuration: config});
            };

            expect(createBadBook).to.throw;
        });
    });

    describe("validation", function() {
        beforeEach(function() {
            config = new Configuration();
            testUtilities.helperConfigBasic(config);
            book = new Book({}, {configuration: config});
        });

        it("must require title or isbn", function() {
            // Verify that book does not have title or isbn.
            expect(book.has('title')).to.be.false;
            expect(book.has('isbn')).to.be.false;

            // Now check validate().
            expect(book.isValid()).to.be.false;
            book.set('title', 'valid title');
            expect(book.isValid()).to.be.true;
            book.unset('title').set('isbn', '0123');
            expect(book.isValid()).to.be.true;
        });

        it("must check for empty strings in title & isbn", function() {
            // Test title.
            book.set('title', '');
            expect(book.isValid()).to.be.false;
            book.set('title', '    '); // 4 spaces
            expect(book.isValid()).to.be.false;

            // Test ISBN.
            book.unset('title').set('isbn', '');
            expect(book.isValid()).to.be.false;
            book.set('isbn', '    '); // 4 spaces
            expect(book.isValid()).to.be.false;

            // Test both.
            book.set({'title': '', 'isbn': ''});
            expect(book.isValid()).to.be.false;
            book.set({'title': '    ', 'isbn': '    '});
            expect(book.isValid()).to.be.false;
        });
    });

    describe("changeStatus", function() {
        beforeEach(function() {
            config = new Configuration();
            testUtilities.helperConfigBasic(config);
            book = new Book({}, {configuration: config});
        });

        // changeStatus: function(statusKey, statusValue, asOfDate)
        it("must change any status", function() {
            expect(book.get("status")).to.be.undefined;
            book.changeStatus("ownership", "library");
            expect(book.get("status"))
                .to.be.an('object')
                .and.to.include.keys("ownership");
        });

        it("must log 'read' status", function() {
            book.changeStatus("read", "to.read");
            var activities = book.get("activities");
            expect(activities)
                .to.be.an('Array')
                .and.have.lengthOf(1);
            expect(activities[0])
                .to.be.an('object')
                .and.to.include.keys("date", "action");
        });

        it("must add log entry with date on read status change", function() {
            book.changeStatus("read", "to.read", "2016-01-02");
            var activities = book.get("activities");
            expect(activities[0])
                .to.be.an('object')
                .and.to.deep.equal({date: "2016-01-02", action: "book.read.queued"});

            book.changeStatus("read", "reading", "2016-02-03");
            activities = book.get("activities");
            expect(activities).to.have.lengthOf(2);
            expect(activities[1])
                .to.be.an('object')
                .and.to.deep.equal({date: "2016-02-03", action: "book.read.started"});
        });

        it("must only log 'read' status changes", function() {
            book.changeStatus("read", "reading", "2016-01-02");
            book.changeStatus("ownership", "personal");
            book.changeStatus("read", "abandoned", "2016-01-03");

            var activities = book.get("activities");
            expect(activities)
                .to.be.an('Array')
                .and.have.lengthOf(2);
        });
    });

    describe("activities", function() {
        it("must parse activities by date");
    });

});
