import Promise from 'bluebird';
import _ from 'lodash';
import Model from '../../model';
import { errorHandler, ServerError } from '../../utils/error-handler';
import { checkActorExist } from '../../utils/constraints';

export default (req, res) => {
    return Promise.resolve().then(() => {
        if (!_.has(req.body, 'name')) {
            throw new ServerError('Must contain a name', 400);
        }
    }).then(() => checkActorExist(req.body.name)).then(() => {
        return Model.actor.insert(req.body);
    }).done(() => {
        res.status(200).send({ 'result': 'succeed' });
    }, errorHandler(res));
};
