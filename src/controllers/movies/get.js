import Promise from 'bluebird';
import _ from 'lodash';
import Model from '../../model';
import { errorHandler, ServerError } from '../../utils/error-handler';

export default (req, res) => {
    return Promise.resolve().then(() => {
        return Model.movie.get(req.query);
    }).then(r => {
        if (_.isEmpty(r)) { throw new ServerError('Movie not found', 404); }
        return r;
    }).done(r => {
        res.status(200).send(r);
    }, errorHandler(res));
};
