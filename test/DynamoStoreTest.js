const assert = require('assert');
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const spies = require('chai-spies');
const AWS = require('mock-aws');

chai.use(spies);

const table = 'MyTable';
const Store = require('../index').DynamoStore;

class MockDynamoDocumentClient {
    constructor(mockDynamoDb) {
        this._mockDynamoDb = mockDynamoDb;
    }

    get(p, cb) {
        this._mockDynamoDb.getItem(p, cb);
    }

    put(p, cb) {
        this._mockDynamoDb.putItem(p, cb);
    }
}

describe('DynamoStore', () => {

    describe('#get()', () => {
        it('first execution should execute the provider', (done) => {

            const dynamo = new MockDynamoDocumentClient(new AWS.DynamoDB());
            const provider = (key, cb) => {
                cb(null, 'Some Data');
            };

            AWS.mock('DynamoDB', 'getItem', null);

            AWS.mock('DynamoDB', 'putItem', {});

            const inst = new Store(table, dynamo, provider);
            const spy = chai.spy.on(inst, '_provider');
            inst.get('MyKey', (err, data) => {
                assert(!err);
                expect(spy).to.have.been.called.once;
                done();
            });

        });

        it('second execution should not execute the provider', (done) => {

            const dynamo = new MockDynamoDocumentClient(new AWS.DynamoDB());

            const provider = (key, cb) => {
                cb(null, 'Some Data');
            };

            AWS.mock('DynamoDB', 'getItem', null);

            AWS.mock('DynamoDB', 'putItem', null);

            const inst = new Store(table, dynamo, provider);
            const spy = chai.spy.on(inst, '_provider');
            inst.get('MyKey', (err, data) => {
                assert(!err);

                AWS.restore('DynamoDB', 'getItem');
                AWS.mock('DynamoDB', 'getItem', {Item: 'Some Data'});

                inst.get('MyKey', (err, data) => {
                    assert(!err);
                    expect(spy).to.have.been.called.once;
                    done();
                });
            });

        });

    });

});

