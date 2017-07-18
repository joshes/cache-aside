const assert = require('assert');
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const spies = require('chai-spies');
const AWS = require('mock-aws');

chai.use(spies);

const s3 = new AWS.S3();
const bucket = 'MyBucket';
const Store = require('../index').S3Store;

describe('DynamoStore', () => {

    describe('#get()', () => {
        it('first execution should execute the provider', (done) => {

            const provider = (key, cb) => {
                cb(null, 'Some Data');
            };

            AWS.mock('S3', 'headObject', (p, cb) => {
                cb({code: 'NotFound'}, null);
            });

            AWS.mock('S3', 'putObject', (p, cb) => {
                cb(null);
            });

            const inst = new Store(bucket, s3, provider);
            const spy = chai.spy.on(inst, '_provider');
            inst.get('MyKey', (err, data) => {
                assert(!err);
                expect(spy).to.have.been.called.once;
                done();
            });

        });

        it('second execution should not execute the provider', (done) => {

            const provider = (key, cb) => {
                cb(null, 'Some Data');
            };

            AWS.mock('S3', 'headObject', (p, cb) => {
                cb({code: 'NotFound'}, null);
            });

            AWS.mock('S3', 'getObject', {Body: 'Some Data'});

            const inst = new Store(bucket, s3, provider);
            const spy = chai.spy.on(inst, '_provider');
            inst.get('MyKey', (err, data) => {
                assert(!err);

                AWS.restore('S3', 'headObject');

                AWS.mock('S3', 'headObject', (p, cb) => {
                    cb(null);
                });

                inst.get('MyKey', (err, data) => {
                    assert(!err);
                    expect(spy).to.have.been.called.once;
                    done();
                });
            });

        });

    });

});

