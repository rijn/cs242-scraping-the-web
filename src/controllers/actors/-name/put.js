import Promise from 'bluebird';
// import _ from 'lodash';
import Model from '../../../model';
import { errorHandler, ServerError } from '../../../utils/error-handler';
import { isExist } from '../../../utils/constraints';

export default (req, res) => {
    return Promise.resolve().then(() => {
        return isExist(Model.actor, req.params.name).then(isActorExist => {
            if (!isActorExist) {
                throw new ServerError('Actor does not exist', 400);
            }
        });
    }).then(() => {
        return Model.actor.update(req.params.name, req.body);
    }).done(() => {
        res.status(200).send({ 'result': 'succeed' });
    }, errorHandler(res));
};
