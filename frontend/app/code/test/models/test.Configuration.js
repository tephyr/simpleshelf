var expect = require('chai').expect,
    sinon = require('sinon');

import {ConfigurationModel as Configuration} from '../../models/Configuration.js';

/**
 * Test the Configuration model & validate parsing.
 */
describe('Configuration', function() {

    describe('parsing: basic', function() {
        var config;

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

    describe('messages', function() {
        it('must get all global messages', function() {
            var config = new Configuration(require('./data/configuration.messages.global.json'), {parse: true});
            var messagesForView = config.getMessagesForView('global');

            expect(messagesForView)
                .to.be.an('Array')
                .and.to.have.lengthOf(4);

            expect(messagesForView[0])
                .to.be.an('object')
                .and.to.have.all.keys('alertMsg', 'alertType', 'dismiss')
                .and.to.have.deep.property('alertType', 'danger');

            expect(messagesForView[1])
                .to.be.an('object')
                .and.to.have.property('alertType').that.equals('warning');

            expect(messagesForView[1]).to.have.property('alertMsg').that.equals('warning message');
            expect(messagesForView[1]).to.have.property('dismiss').that.is.true;

            expect(messagesForView[2])
                .to.be.an('object')
                .and.to.have.deep.property('alertType', 'info');
            expect(messagesForView[2]).to.have.property('dismiss', false);

            expect(messagesForView[3])
                .to.be.an('object')
                .and.to.have.deep.property('alertType', 'success');
        });
    });
});
