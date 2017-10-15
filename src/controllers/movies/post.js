import Promise from 'bluebird';
import _ from 'lodash';
import Model from '../../model';
import { errorHandler, ServerError } from '../../utils/error-handler';
import { isExist } from '../../utils/constraints';

export default (req, res) => {
    return Promise.resolve().then(() => {
        if (!_.has(req.body, 'name')) {
            throw new ServerError('Must contain a name', 400);
        }
    }).then(() => {
        return isExist(Model.movie, req.body.name).then((isMovieExist) => {
            if (isMovieExist) {
                throw new ServerError('Movie already exist', 409);
            }
        });
    }).then(() => {
        return Model.movie.insert(req.body);
    }).done(() => {
        res.status(201).send({ 'result': 'succeed' });
    }, errorHandler(res));
};
