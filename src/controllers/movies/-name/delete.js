import Promise from 'bluebird';
import Model from '../../../model';
import { errorHandler, ServerError } from '../../../utils/error-handler';
import { isExist } from '../../../utils/constraints';

export default (req, res) => {
    return Promise.resolve().then(() => {
        return isExist(Model.movie, req.params.name).then(isMovieExist => {
            if (!isMovieExist) {
                throw new ServerError('Movie does not exist', 400);
            }
        });
    }).then(() => {
        return Model.movie.delete(req.params.name);
    }).done(() => {
        res.status(200).send({ 'result': 'succeed' });
    }, errorHandler(res));
};
