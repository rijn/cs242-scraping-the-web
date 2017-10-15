var requireHelper = require('../require-helper');
let errorHandler = requireHelper('./utils/error-handler');

describe('errorHandler', () => {
    it('should compose error with specific params', () => {
        let e = new errorHandler.ServerError('message', 1, 'message', 'filename');
        e.message.should.equal('message');
        e.statusCode.should.equal(1);
    });
});
