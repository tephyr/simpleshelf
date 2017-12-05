const expect = require('chai').expect,
    sinon = require('sinon'),
    testUtilities = require("../testUtilities.js"),
    Configuration = require("../../models/Configuration.js");

import {Book} from '../../models/Book.js';

describe('Book', function() {

    var book, config;

    describe('creation', function() {
        it('must throw error if configuration passed in', () => {
            const createBook = () => {
                const book = new Book({configuration: {}});
            };
            expect(createBook).to.throw();
        });
    });

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
            book = new Book({});
            book.configuration = config;
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

    describe("parse", function() {
        beforeEach(function() {
            config = new Configuration();
            testUtilities.helperConfigBasic(config);
            book = new Book({}, {configuration: config});
        });

        it("must order activities by date", function() {
            var parsedResponse = book.parse(basicBookResponse());

            expect(parsedResponse)
                .to.contain.all.keys("activities", "_id"); // At *least* these keys.

            expect(parsedResponse.activities)
                .to.be.an('Array')
                .and.to.have.lengthOf(3);

            expect(parsedResponse.activities[0])
                .to.deep.equal({"date": "2016-04-01", "action": "book.read.queued"});
            expect(parsedResponse.activities[1])
                .to.deep.equal({"date": "2016-05-01", "action": "book.read.started"});
            expect(parsedResponse.activities[2])
                .to.deep.equal({"date": "2016-06-01", "action": "book.read.finished"});
        });
    });

    describe('metadata', () => {
        beforeEach(() => {
            config = new Configuration();
            testUtilities.helperConfigBasic(config);
            book = new Book(basicBookResponse(), {configuration: config});
        });

        it('must contain a canonicalTitle method', () => {
            expect(book.getCanonicalTitle).to.be.instanceof(Function);
        });

        it('must parse canonicalTitle', () => {
            const bookWithTitle = new Book({title: 'The title', canonicalTitle: 'title, The'}, {configuration: config});
            expect(bookWithTitle.getCanonicalTitle()).to.equal('title, The');
        });

        it('canonicalTitle must handle all prefixes ([a, an, the])', () => {
            const testData = [
                [{title: 'A title'}, 'title, A'],
                [{title: 'An interesting title'}, 'interesting title, An'],
                [{title: 'The interesting title'}, 'interesting title, The'],
                [{title: 'There is no title'}, 'There is no title']
            ];

            testData.forEach((info) => {
                let bookWithTitle = new Book({}, {configuration: config});
                bookWithTitle.set(info[0]);
                expect(bookWithTitle.getCanonicalTitle()).to.equal(info[1]);
            });
        });
    });

    function basicBookResponse() {
        return {
                "_id": "demo-0679729658",
                "status": {
                    "read": "finished",
                    "ownership": "personal"
                },
                "isbn": "0679729658",
                "activities": [
                    {"date": "2016-06-01", "action": "book.read.finished"},
                    {"date": "2016-04-01", "action": "book.read.queued"},
                    {"date": "2016-05-01", "action": "book.read.started"}
                ],
                "title": "A tale of two cities",
                // "canonicalTitle": "tale of two cities, A",
                "publisher": "Vintage Books",
                "notesPrivate": null,
                "notesPublic": "1st Vintage classics ed.",
                "urls": {
                    "openlibrary": "https://openlibrary.org/books/OL1859004M/A_tale_of_two_cities"
                },
                "authors": ["Dickens, Charles"],
                "type": "book",
                "public": true,
                "tags": ["fiction", "classic"]
            };
    }

});
