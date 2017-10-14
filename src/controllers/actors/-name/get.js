import Promise from 'bluebird';
import _ from 'lodash';
import Model from '../../../model';
import errorHandler from '../../../utils/error-handler';

export default (req, res) => {
    return Promise.resolve().then(() => {
        let r = Model.actor.get({ name: req.params.name })[0];
        if (!r) throw {
            message: 'Actor not found',
            statusCode: 404
        };
        return r;
    }).done(r => {
        res.status(200).send(r);
    }, errorHandler(res));
};

