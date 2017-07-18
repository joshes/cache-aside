const assert = require('assert');
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const spies = require('chai-spies');

chai.use(spies);

const Store = require('../index').MemoryStore;

describe('MemoryStore', () => {

    describe('#get()', () => {
        it('first execution should execute the provider', (done) => {

            const provider = (key, cb) => {
                cb(null, 'Some Data');
            };

            const inst = new Store(provider);
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

            const inst = new Store(provider);
            const spy = chai.spy.on(inst, '_provider');
            inst.get('MyKey', (err, data) => {
                assert(!err);
                inst.get('MyKey', (err, data) => {
                    assert(!err);
                    expect(spy).to.have.been.called.once;
                    done();
                });
            });

        });

        it('cached item should be evicted after TTL expires', (done) => {

            const provider = (key, cb) => {
                cb(null, 'Some Data');
            };

            const inst = new Store(provider, 10);
            const spy = chai.spy.on(inst, '_provider');
            inst.get('MyKey', (err, data) => {
                assert(!err);
                assert(data);
                inst.get('MyKey', (err, data) => {
                    assert(!err);
                    expect(spy).to.have.been.called.once;
                    setTimeout(() => {
                        inst.get('MyKey', (err, data) => {
                            assert(!err);
                            expect(spy).to.have.been.called.twice;
                            done();
                        });
                    }, 20);
                });
            });

        });
    });

});

