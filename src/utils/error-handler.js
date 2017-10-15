const _ = require('lodash');

/**
 * @class ServerError
 */
export const ServerError = class extends Error {
    /**
     * @constructs ServerError
     *
     * @param {string} message Message need to be sent
     * @param {Number} statusCode Status code to response
     */
    constructor (message = 'Undefined', statusCode = 500, ...params) {
        super(...params);

        Error.captureStackTrace(this, ServerError);

        this.message = message;
        this.statusCode = statusCode;
    }
};

/**
 * @function errorHandler
 *
 * @desc Compose the error handler
 *
 * @param {Response} res
 *
 * @returns {Function}
 */
export const errorHandler = (res) => {
    return function (e) {
        res.status(e.statusCode).send(_.defaults(e.extra, {
            'error': (e.message).toString()
        }));
    };
};
