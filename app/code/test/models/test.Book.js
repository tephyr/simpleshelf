var expect = require('chai').expect,
    sinon = require('sinon'),
    testUtilities = require("../testUtilities.js");

var Configuration = require("../../models/Configuration.js"),
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
        it("must require title or isbn");
        it("must check for empty strings in title & isbn");
    });

    describe("status", function() {
        it("must log any status");
        it("must log read status");
        it("must check if new read status has associated activity");
        it("must add log entry with date on read status change");
    });

    describe("activities", function() {
        it("must parse activities by date");
    });

});
