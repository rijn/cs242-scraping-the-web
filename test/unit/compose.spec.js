var requireHelper = require('../require-helper');
let compose = requireHelper('./utils/compose').default;

describe('compose', () => {
    it('should throw error if middleware is not an array', () => {
        (() => { compose(null) }).should.throw();
    });

    it('should throw error if middleware are not functions', () => {
        (() => { compose([ null ]) }).should.throw();
    });
});
