import _ from 'lodash';

let compose = (middlewares, path) => {
    if (!_.isArray(middlewares)) {
        throw new Error(`middlewares ${JSON.stringify(middlewares)} should be an Array of functions.`);
    };

    _.each(middlewares, fn => {
        if (!_.isFunction(fn)) {
            throw new Error(`middleware ${path} - ${JSON.stringify(fn)} should be a function, ignored.`);
        };
    });

    return (req, res, next) => {
        (function iterate (i, max) {
            if (i === max) return next();
            middlewares[i](req, res, iterate.bind(this, i + 1, max));
        })(0, middlewares.length);
    };
};

export default compose;
