import Promise from 'bluebird';
import _ from 'lodash';
import Model from '../../model';
import { errorHandler, ServerError } from '../../utils/error-handler';
import { orQueryParser } from '../../utils/parsers';

export default (req, res) => {
    return Promise.resolve().then(() => {
        if (req.query.q) {
            return Model.movie.get(orQueryParser(req.query.q), (s, v) => s || v, false);
        }

        let query = _.mapValues(req.query, q => _.isString(q) ? new RegExp(q, 'ig') : q);
        return Model.movie.get(query);
    }).then(r => {
        if (_.isEmpty(r)) { throw new ServerError('Movie not found', 404); }
        return r;
    }).done(r => {
        res.status(200).send(r);
    }, errorHandler(res));
};
