var expect = require('chai').expect;

var EditBookPageView = require("../../views/EditBookPageView.js");

describe('EditBookPageView', function() {

    var view;

    before(function() {
        view = new EditBookPageView({});
    });

    describe('verify objects', function () {

        it("should create a valid view object", function() {
            expect(view).to.be.an('object');
        });

    });

    describe.skip('get data for template', function () {

        it("should include status info", function() {
            expect(view).to.be.an('object');
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

});
