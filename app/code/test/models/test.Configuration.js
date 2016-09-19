var expect = require('chai').expect,
    sinon = require('sinon'),
    testUtilities = require("../testUtilities.js"),
    Configuration = require("../../models/Configuration.js");

/**
 * Test the Configuration model & validate parsing.
 */
describe('Configuration', function() {

    describe('parsing: basic', function() {
        beforeEach(function() {
            config = new Configuration();
        });

        it('must handle basic settings', function() {
            var result = config.parse(require('./data/configuration.basic.json'));
            // Has only these keys.
            expect(result).to.have.all.keys(['read', 'ownership', 'actions']);
        });

        it('must combine default & custom settings', function() {
            var result = config.parse(require('./data/configuration.default+custom.json'));
            // Has only these keys.
            expect(result).to.have.all.keys(['messages', 'read', 'ownership', 'actions']);
        });

    });

    describe('parsing: messages', function() {
        it('must handle basic message parsing', function() {
            var config = new Configuration(require('./data/configuration.messages.basic.json'), {parse: true});
            var msgs = config.get('messages');
            expect(msgs)
                .to.be.an('object')
                .and.to.have.keys('global');
            expect(msgs.global)
                .to.be.an('Array')
                .and.have.lengthOf(2);
        });

        it('must handle attributes for message parsing', function() {
            var config = new Configuration(require('./data/configuration.messages.intermediate.json'), {parse: true});
            var msgsGlobal = config.get('messages').global;
            expect(msgsGlobal)
                .to.be.an('Array')
                .and.to.have.lengthOf(2);

            expect(msgsGlobal[0])
                .to.be.an('object')
                .and.to.have.keys('warning', 'dismiss');
        });
    });
});
