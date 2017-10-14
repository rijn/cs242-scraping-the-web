const _ = require('lodash');

export const ServerError = class extends Error {
    constructor (message = 'Undefined', statusCode = 500, ...params) {
        super(...params);

        Error.captureStackTrace(this, ServerError);

        this.message = message;
        this.statusCode = statusCode;
    }
};

export const errorHandler = (res) => {
    return function (e) {
        console.log(e);
        if (process.env.NODE_ENV === 'dev') console.log(e);
        res.status(e.statusCode).send(_.defaults(e.extra, {
            'error': (e.message).toString()
        }));
    };
};
