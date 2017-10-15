import Promise from 'bluebird';
// import _ from 'lodash';
// import Model from '../../../model';
import { errorHandler, ServerError } from '../../../utils/error-handler';

export default (req, res) => {
    return Promise.resolve().then(() => {
        console.log(req);
        throw new ServerError('1', 1);
    }).done(r => {
        res.status(200).send('');
    }, errorHandler(res));
};
