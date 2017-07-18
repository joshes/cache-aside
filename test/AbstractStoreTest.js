const assert = require('assert');
const chai = require('chai');
const Store = require('../index').AbstractStore;

describe('AbstractStore', () => {

    describe('#constructor()', () => {
        it('should throw an error if provider is not given', (done) => {
            const test = () => {
                new Store();
            };
            chai.expect(test).to.throw();
            done();
        });
    });

    describe('#get()', () => {
        it('should fail as this is an abstract class', (done) => {
            const test = () => {
                const inst = new Store(() => {
                });
                inst.get('SomeKey', () => {
                });
            };
            chai.expect(test).to.throw();
            done();
        });
    });

});

