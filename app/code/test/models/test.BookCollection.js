const expect = require('chai').expect,
    sinon = require('sinon'),
    Configuration = require("../../models/Configuration.js");

import DATA_BC0 from './data/bookcollection.0.json';
import DATA_BC1 from './data/bookcollection.1.json';
import DATA_BC2 from './data/bookcollection.2.json';

import {BookCollection} from '../../models/BookCollection.js';

/**
 * Test the BookCollection Backbone Collection.
 */
describe('BookCollection', () => {
    let config, books;

    describe('spine summary', () => {
        beforeEach(function() {
            config = new Configuration();
            books = new BookCollection(null, {configuration: config});
        });

        it('must handle alphabetic characters', () => {
            books.add(books.parse(DATA_BC0));
            expect(books.length).to.equal(3);
            expect(books.getSpineSummary()).to.be.an('object')
                .and.include.keys('f', 's', 't')
                .and.not.include.keys('?');
        });

        it('must handle numeric characters', () => {
            books.add(books.parse(DATA_BC1));
            expect(books.length).to.equal(3);
            expect(books.getSpineSummary()).to.be.an('object')
                .and.deep.equal({'?': 2, 'a': 1});
        });

        it('must handle non-alphanumeric characters', () => {
            books.add(books.parse(DATA_BC2));
            expect(books.length).to.equal(3);
            expect(books.getSpineSummary()).to.be.an('object')
                .and.include.keys('d', 'e', 'b');
        });
    });
});
